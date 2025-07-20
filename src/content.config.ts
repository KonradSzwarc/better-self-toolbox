import { glob } from 'astro/loaders';

import { defineCollection, reference, z } from 'astro:content';

const tools = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/tools' }),
  schema: z.object({
    name: z.string(),
    summary: z.string(),
    status: z.enum(['draft', 'published']),
    path: z.string().nullish(),
    synonyms: z.array(z.string()).nullish(),
    tags: z.array(reference('tags')),
    seo: z
      .object({
        title: z.string().nullish(),
        description: z.string().nullish(),
      })
      .nullish(),
  }),
});

const tags = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/tags' }),
  schema: z.object({
    name: z.string(),
    summary: z.string(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/pages' }),
  schema: z.object({
    seo: z.object({
      title: z.string(),
      description: z.string(),
    }),
  }),
});

export const collections = { tools, tags, pages };
