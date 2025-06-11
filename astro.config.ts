import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import node from '@astrojs/node';
import preact from '@astrojs/preact';
import playformCompress from '@playform/compress';
import compressor from 'astro-compressor';
import Icons from 'unplugin-icons/vite';

import { locales, defaultLocale } from './src/utils/i18n/constants';

export default defineConfig({
  adapter: node({
    mode: 'middleware',
  }),

  integrations: [
    preact({ compat: true }),
    playformCompress({
      CSS: false,
      HTML: true,
      Image: false,
      JavaScript: false,
      SVG: true,
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

  experimental: {
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: 'Nunito',
        cssVariable: '--font-heading',
        weights: ['100 900'],
        subsets: ['latin', 'latin-ext'],
      },
      {
        provider: fontProviders.fontsource(),
        name: 'Inter',
        cssVariable: '--font-body',
        weights: ['100 900'],
        subsets: ['latin', 'latin-ext'],
      },
    ],
  },
});
