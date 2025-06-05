import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  vite: {
    plugins: [tailwindcss()],
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
