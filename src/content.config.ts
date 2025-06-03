import { defineCollection, reference, z } from 'astro:content';

import { glob } from 'astro/loaders';

const tools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/tools' }),
  schema: z.object({
    name: z.string(),
    summary: z.string(),
    tags: z.array(reference('tags')),
  }),
});

const tags = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/tags' }),
  schema: z.object({
    name: z.string(),
  }),
});

export const collections = { tools, tags };
