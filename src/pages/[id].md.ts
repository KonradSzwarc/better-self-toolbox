import type { APIRoute } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { getCollection, getEntry } from 'astro:content';
import { omitLocale, prependLocale } from '@/utils/i18n';
import { publishedToolsForLocale } from '@/utils/tools';

export async function getStaticPaths() {
  const tools = await getCollection('tools', publishedToolsForLocale('en'));

  return tools.map((tool) => ({
    params: { id: omitLocale(tool.data.path ?? tool.id) },
    props: { tool },
  }));
}

export const GET: APIRoute<{ tool: CollectionEntry<'tools'> }> = async ({ props }) => {
  const tags = await Promise.all(props.tool.data.tags.map((tag) => getEntry('tags', prependLocale(tag.id, 'en'))));

  const markdown = `
# ${props.tool.data.name}

> ${props.tool.data.llmSummary}

Categories: ${tags
    .map((tag) => tag?.data.name)
    .filter(Boolean)
    .join(', ')}
${props.tool.data.synonyms && `Synonyms: ${props.tool.data.synonyms?.join(', ')}`}

${props.tool.body}
`.trim();

  return new Response(markdown);
};
