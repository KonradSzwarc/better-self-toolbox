import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import playformCompress from '@playform/compress';
import compressor from 'astro-compressor';
import Icons from 'unplugin-icons/vite';

import { locales, defaultLocale, localeCodes } from './src/utils/i18n/constants';

export default defineConfig({
  site: process.env.ASTRO_SITE?.trim() || 'http://localhost:4321',

  integrations: [
    preact({
      compat: true,
    }),
    sitemap({
      i18n: {
        defaultLocale,
        locales: localeCodes,
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

  build: {
    inlineStylesheets: 'always',
  },
});
