import type { SitemapItem } from '@astrojs/sitemap';
import type { BaseIntegrationHooks } from 'astro';
import type { Locale } from './src/utils/i18n/constants';
import { Buffer } from 'node:buffer';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import playformCompress from '@playform/compress';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import * as cheerio from 'cheerio';
import favicons from 'favicons';
import { globby } from 'globby';
import { trimEnd } from 'lodash-es';
import Icons from 'unplugin-icons/vite';
import { parse } from 'yaml';
import { defaultLocale, localeCodes, locales, regexLocales } from './src/utils/i18n/constants';
import { generateToolOpenGraph } from './src/utils/og';
import { isPublished } from './src/utils/tools/is-published';

const site = process.env.ASTRO_SITE ?? 'http://localhost:4321';
const toolPagesMaps = await createToolPagesMaps();

export default defineConfig({
  site,

  integrations: [
    mdx(),
    preact({
      compat: true,
    }),
    {
      name: 'generate-assets',
      hooks: {
        'astro:build:done': generateAssets,
      },
    },
    {
      name: 'add-trailing-slash', // Prevent redirect on Cloudflare Pages
      hooks: {
        'astro:build:done': addTrailingSlash,
      },
    },
    sitemap({
      i18n: {
        defaultLocale,
        locales: localeCodes,
      },
      serialize: serializeSitemap,
    }),
    playformCompress({
      CSS: false,
      HTML: {
        'html-minifier-terser': {
          removeComments: true,
        },
      },
      Image: false,
      JavaScript: false,
      SVG: false,
    }),
  ],

  vite: {
    server: {
      watch: {
        ignored: ['**/node_modules/**', '**/.vscode/**'],
      },
    },
    plugins: [
      tailwindcss(),
      Icons({
        compiler: 'jsx',
        jsx: 'preact',
      }),
    ],
  },

  i18n: {
    locales: [...locales],
    defaultLocale,
  },

  build: {
    inlineStylesheets: 'always',
  },

  markdown: {
    remarkRehype: {
      footnoteLabelProperties: { className: '' },
    },
  },
});

/** Create maps allowing to quickly find data about a tool page by file path or url */
async function createToolPagesMaps() {
  const paths = await globby(['./src/data/tools']);

  const urlToFilePath = new Map<string, string>();
  const filePathToUrl = new Map<string, string>();

  await Promise.all(
    paths.map(async (path) => {
      const content = await readFile(path, 'utf8');
      const frontmatter = content.match(/^---(.+?)---/s)?.[1];

      if (!frontmatter) return;

      const pathname = path.replace('src/data/tools/', '').replace(/\.mdx?$/, '');
      const [locale, fileName] = pathname.split('/');

      if (!locale || !fileName) return;

      const data = parse(frontmatter);

      if (!isPublished(data)) return;

      const url = [site, locale === defaultLocale ? null : locale, data.path || fileName].filter(Boolean).join('/');

      urlToFilePath.set(url, path);
      filePathToUrl.set(path, url);
    }),
  );

  return { urlToFilePath, filePathToUrl };
}
/**
 * Add metadata to sitemap items
 * - Links to alternate versions (languages) but only if they are published
 */
async function serializeSitemap(sitemapItem: SitemapItem) {
  const filePath = toolPagesMaps.urlToFilePath.get(trimEnd(sitemapItem.url, '/'));
  if (!filePath) return sitemapItem;

  const links = locales.flatMap((locale) => {
    const path = filePath.replace(new RegExp(`/${regexLocales}/`), `/${locale}/`);
    const url = toolPagesMaps.filePathToUrl.get(path);

    if (!url) return [];

    return [{ url, lang: localeCodes[locale] }];
  });

  if (links.length > 1) {
    sitemapItem.links = links;
  }

  return sitemapItem;
}

/** Generate custom assets for tools that have favicons */
async function generateAssets({ assets }: Parameters<BaseIntegrationHooks['astro:build:done']>[0]) {
  const toolUrls = [...(assets.get('/[id]') || []), ...(assets.get('/pl/[id]') || [])];
  const faviconPaths = await globby(['./public/*/favicon.svg']);
  const toolToFaviconPath = new Map(faviconPaths.map((path) => [path.split('/').at(-2) ?? '', path]));

  await Promise.all(
    toolUrls.map(async (toolUrl) => {
      const urlParts = toolUrl.pathname.split('/');
      const toolName = urlParts.at(-1) === 'index.html' && urlParts.at(-2);
      const toolLocale = locales.includes(urlParts.at(-3) || '') ? (urlParts.at(-3) as Locale) : null;
      const toolFaviconPath = toolName && toolToFaviconPath.get(toolName);

      if (!toolFaviconPath) return;

      const $ = cheerio.load(await readFile(toolUrl.pathname, 'utf8'));

      const generateFaviconFormats = async () => {
        let favicon = await readFile(toolFaviconPath, 'utf8');
        favicon = favicon.replace('#000', '#9F9FAA');

        const { images } = await favicons(Buffer.from(favicon), {
          icons: {
            android: false,
            appleIcon: true,
            appleStartup: false,
            favicons: true,
            windows: false,
            yandex: false,
          },
        });

        await Promise.all(
          images.map(async ({ name, contents }) =>
            writeFile(join(toolUrl.pathname.replace('/index.html', ''), name), contents),
          ),
        );
      };

      const generateOgImage = async () => {
        const ogImage = await generateToolOpenGraph({
          title: $('h1').text(),
          description: $('h1 + p').text(),
          imagePath: toolFaviconPath,
        });
        await writeFile(toolUrl.pathname.replace('/index.html', '/og.png'), ogImage.body!);
      };

      const updateToolHtml = async () => {
        const prefix = toolLocale ? `/${toolLocale}/${toolName}` : `/${toolName}`;

        $('link[rel="icon"][sizes="32x32"]').attr('href', `${prefix}/favicon.ico`);
        $('link[rel="icon"][type="image/svg+xml"]').attr('href', `${prefix}/favicon.svg`);
        $('link[rel="apple-touch-icon"]').attr('href', `${prefix}/apple-touch-icon.png`);
        $('meta[property="og:image"]').attr('content', `${prefix}/og.png`);

        await writeFile(toolUrl.pathname, $.html());
      };

      await Promise.all([generateFaviconFormats(), generateOgImage(), updateToolHtml()]);
    }),
  );
}

/** Add trailing slash to all internal links */
async function addTrailingSlash({ assets }: Parameters<BaseIntegrationHooks['astro:build:done']>[0]) {
  const htmlFiles = [...assets.values()]
    .flatMap((asset) => asset.map((file) => file.pathname))
    .filter((path) => path.endsWith('.html'));

  await Promise.all(
    htmlFiles.map(async (path) => {
      const $ = cheerio.load(await readFile(path, 'utf8'));
      $('a').each((_, link) => {
        const href = $(link).attr('href');
        const isInternalLink = href && (href.startsWith('/') || href.startsWith(site));
        if (isInternalLink && !href.endsWith('/')) {
          $(link).attr('href', `${href}/`);
        }
      });
      await writeFile(path, $.html());
    }),
  );
}
