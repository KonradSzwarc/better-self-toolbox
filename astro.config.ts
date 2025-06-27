import type { SitemapItem } from '@astrojs/sitemap';
import type { BaseIntegrationHooks } from 'astro';
import type { Locale } from './src/utils/i18n/constants';
import { Buffer } from 'node:buffer';
import { execSync } from 'node:child_process';
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

const isProd = Boolean(process.env.ASTRO_SITE);
const site = isProd ? process.env.ASTRO_SITE : 'http://localhost:4321';
const toolPagesMaps = await createToolPagesMaps();

export default defineConfig({
  site,

  integrations: [
    mdx(),
    preact({
      compat: true,
    }),
    {
      name: 'generate-favicons',
      hooks: {
        'astro:build:done': generateFavicons,
      },
    },
    isProd &&
      sitemap({
        i18n: {
          defaultLocale,
          locales: localeCodes,
        },
        filter: filterPagesWithContent,
        serialize: serializeSitemap,
      }),
    isProd &&
      playformCompress({
        CSS: false,
        HTML: true,
        Image: false,
        JavaScript: false,
        SVG: false,
      }),
  ].filter(Boolean),

  vite: {
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
  const filePathToContent = new Map<string, string>();

  await Promise.all(
    paths.map(async (path) => {
      const content = await readFile(path, 'utf8');
      const frontmatter = content.match(/^---(.+?)---/s)?.[1];

      if (!frontmatter) return;

      const pathname = path.replace('src/data/tools/', '').replace(/\.mdx?$/, '');
      const [locale, fileName] = pathname.split('/');

      if (!locale || !fileName) return;

      const data = parse(frontmatter);
      const url = [site, locale === defaultLocale ? null : locale, data.path || fileName].filter(Boolean).join('/');

      urlToFilePath.set(url, path);
      filePathToUrl.set(path, url);
      filePathToContent.set(path, content.replace(/^---.+---/s, '').trim());
    }),
  );

  return { urlToFilePath, filePathToUrl, filePathToContent };
}

/** Filter out pages without content from the sitemap */
function filterPagesWithContent(pageUrl: string) {
  const filePath = toolPagesMaps.urlToFilePath.get(trimEnd(pageUrl, '/'));
  if (!filePath) return true;

  return Boolean(toolPagesMaps.filePathToContent.get(filePath));
}

/**
 * Add metadata to sitemap items
 * - Last modified date to tool pages
 * - Links to alternate versions (languages) but only if they have content
 */
function serializeSitemap(sitemapItem: SitemapItem) {
  const filePath = toolPagesMaps.urlToFilePath.get(trimEnd(sitemapItem.url, '/'));
  if (!filePath) return sitemapItem;

  const lastModified = execSync(`git log -1 --pretty="format:%cI" "${filePath}"`);
  sitemapItem.lastmod = new Date(lastModified.toString()).toISOString();

  const links = locales.flatMap((locale) => {
    const path = filePath.replace(new RegExp(`/${regexLocales}/`), `/${locale}/`);
    const content = toolPagesMaps.filePathToContent.get(path);
    const url = toolPagesMaps.filePathToUrl.get(path);

    if (!content || !url) return [];

    return [{ url, lang: localeCodes[locale] }];
  });

  if (links.length > 1) {
    sitemapItem.links = links;
  }

  return sitemapItem;
}

/** Generate custom favicons for tools that have them */
async function generateFavicons({ assets }: Parameters<BaseIntegrationHooks['astro:build:done']>[0]) {
  const toolUrls = [...(assets.get('/[id]') || []), ...(assets.get('/pl/[id]') || [])];
  const faviconPaths = await globby(['./public/*/favicon.svg']);
  const toolToFaviconPath = new Map(faviconPaths.map((path) => [path.split('/').at(-2) ?? '', path]));

  await Promise.all(
    toolUrls.map(async (url) => {
      const urlParts = url.pathname.split('/');
      const toolName = urlParts.at(-1) === 'index.html' && urlParts.at(-2);
      const toolLocale = locales.includes(urlParts.at(-3) || '') ? (urlParts.at(-3) as Locale) : null;
      const toolFaviconPath = toolName && toolToFaviconPath.get(toolName);

      if (!toolFaviconPath) return;

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
            writeFile(
              join(url.pathname.replace('/index.html', ''), name),
              contents as unknown as NodeJS.ArrayBufferView,
            ),
          ),
        );
      };

      const updateToolHtml = async () => {
        const prefix = toolLocale ? `/${toolLocale}/${toolName}` : `/${toolName}`;

        const $ = cheerio.load(await readFile(url.pathname, 'utf8'));
        $('link[rel="icon"][sizes="32x32"]').attr('href', `${prefix}/favicon.ico`);
        $('link[rel="icon"][type="image/svg+xml"]').attr('href', `${prefix}/favicon.svg`);
        $('link[rel="apple-touch-icon"]').attr('href', `${prefix}/apple-touch-icon.png`);
        await writeFile(url.pathname, $.html());
      };

      await Promise.all([generateFaviconFormats(), updateToolHtml()]);
    }),
  );
}
