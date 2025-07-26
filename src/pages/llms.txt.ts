import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { entriesForLocale, omitLocale } from '@/utils/i18n';
import { publishedToolsForLocale } from '@/utils/tools';

export const GET: APIRoute = async ({ site }) => {
  let base = `
# Better Self Toolbox: A collection of personal development tools, mental models, and frameworks.

> This file provides a curated list of concepts for self-improvement, effective decision-making, and productivity. The purpose is to offer clear, actionable summaries of each tool for personal growth. The collection includes productivity techniques, decision-making frameworks, mental models for clearer thinking, and explanations of common cognitive biases and logical fallacies.

## List of Personal Development Tools

`;

  const tagsCollection = await getCollection('tags', entriesForLocale('en'));
  const toolsCollection = await getCollection('tools', publishedToolsForLocale('en'));
  const tagsMap = new Map(tagsCollection.map((tag) => [omitLocale(tag.id), tag.data]));

  for (const tool of toolsCollection) {
    const { name, path, llmSummary, tags } = tool.data;
    const categories = tags
      .map((tag) => tagsMap.get(tag.id)?.name?.toLowerCase())
      .filter(Boolean)
      .join(', ');
    base += `- [${name}](${site}${omitLocale(path ?? tool.id)}) - ${llmSummary} (category: ${categories})\n`;
  }

  return new Response(base);
};
