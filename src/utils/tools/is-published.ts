import type { CollectionEntry } from 'astro:content';

export function isPublished(tool: CollectionEntry<'tools'> | Pick<CollectionEntry<'tools'>['data'], 'status'>) {
  const { status } = 'data' in tool ? tool.data : tool;
  return status !== 'draft';
}
