import { defineCollection, reference, z } from 'astro:content';

import { glob } from 'astro/loaders';

const tools = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/tools' }),
  schema: z.object({
    name: z.string(),
    path: z.string().nullish(),
    summary: z.string(),
    synonyms: z.array(z.string()).nullish(),
    tags: z.array(reference('tags')),
  }),
});

const tags = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/tags' }),
  schema: z.object({
    name: z.string(),
    summary: z.string(),
  }),
});

export const collections = { tools, tags };
