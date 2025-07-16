import type { CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';
import { entriesForLocale } from './i18n';

export function publishedToolsForLocale(locale: Locale) {
  return (tool: CollectionEntry<'tools'>) => isPublished(tool) && entriesForLocale(locale)(tool);
}

export function isPublished(tool: CollectionEntry<'tools'> | Pick<CollectionEntry<'tools'>['data'], 'status'>) {
  const { status } = 'data' in tool ? tool.data : tool;
  return status !== 'draft';
}
