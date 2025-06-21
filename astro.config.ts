import fs from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import playformCompress from '@playform/compress';
import compressor from 'astro-compressor';
import Icons from 'unplugin-icons/vite';
import rehypeExternalLinks, { type Options as RehypeExternalLinksOptions } from 'rehype-external-links';

import { locales, defaultLocale, localeCodes } from './src/utils/i18n/constants';

const site = process.env.ASTRO_SITE?.trim() || 'http://localhost:4321';

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
      filter(page) {
        const pathParts = new URL(page).pathname.split('/').filter(Boolean);
        if (!locales.includes(pathParts[0] ?? '')) pathParts.unshift(defaultLocale);
        const path = `./src/data/tools/${pathParts.join('/')}.md`;
        if (!fs.existsSync(path)) return true;
        return Boolean(
          fs
            .readFileSync(path, 'utf8')
            .replace(/^---.+---/s, '')
            .trim(),
        );
      },
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
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          rel: ['noopener', 'noreferrer', 'nofollow'],
          target: '_blank',
        } satisfies RehypeExternalLinksOptions,
      ],
    ],
  },

  build: {
    inlineStylesheets: 'always',
  },
});
