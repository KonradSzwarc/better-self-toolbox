import type { SitemapItem } from '@astrojs/sitemap';
import type { Options as RehypeExternalLinksOptions } from 'rehype-external-links';
import type { FlexibleContainerOptions } from 'remark-flexible-containers';
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import process from 'node:process';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import playformCompress from '@playform/compress';
import tailwindcss from '@tailwindcss/vite';
import compressor from 'astro-compressor';
import { defineConfig } from 'astro/config';
import { globby } from 'globby';
import { trimEnd } from 'lodash-es';
import rehypeExternalLinks from 'rehype-external-links';
import remarkFlexibleContainers from 'remark-flexible-containers';
import Icons from 'unplugin-icons/vite';
import { parse } from 'yaml';

import rehypeLinkedHeadings from './plugins/rehype-linked-headings';
import { defaultLocale, localeCodes, locales, regexLocales } from './src/utils/i18n/constants';

const site = process.env.ASTRO_SITE?.trim() || 'http://localhost:4321';
const toolPagesMaps = await createToolPagesMaps();

export default defineConfig({
  site,

  integrations: [
    mdx(),
    preact({
      compat: true,
    }),
    sitemap({
      i18n: {
        defaultLocale,
        locales: localeCodes,
      },
      filter: filterPagesWithContent,
      serialize: serializeSitemap,
    }),
    playformCompress({
      CSS: false,
      HTML: true,
      Image: false,
      JavaScript: false,
      SVG: false,
    }),
    compressor(),
  ],

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

  markdown: {
    remarkPlugins: [
      [
        remarkFlexibleContainers,
        {
          containerTagName: (type) => {
            return type === 'details' ? 'details' : 'div';
          },
          titleTagName: (type) => {
            return type === 'details' ? 'summary' : 'span';
          },
        } satisfies FlexibleContainerOptions,
      ],
    ],
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          rel: ['noopener', 'noreferrer', 'nofollow'],
          target: '_blank',
        } satisfies RehypeExternalLinksOptions,
      ],
      rehypeLinkedHeadings,
    ],
  },

  build: {
    inlineStylesheets: 'always',
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
      const content = await fs.readFile(path, 'utf8');
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
  console.log(filePath, Boolean(toolPagesMaps.filePathToContent.get(filePath)));

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

  console.log(links);

  if (links.length > 1) {
    sitemapItem.links = links;
  }

  return sitemapItem;
}
