import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';
import react from '@astrojs/react';
import Icons from 'unplugin-icons/vite';

import { locales, defaultLocale } from './src/utils/i18n/constants';

export default defineConfig({
  integrations: [react()],

  adapter:
    process.env.APP_ENV === 'local'
      ? node({
          mode: 'standalone',
        })
      : cloudflare({
          imageService: 'passthrough',
        }),

  vite: {
    plugins: [
      tailwindcss(),
      Icons({
        compiler: 'astro',
      }),
    ],
  },

  i18n: {
    locales: [...locales],
    defaultLocale,
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
