import type { CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';
import { entriesForLocale } from './i18n';

export function publishedToolsForLocale(locale: Locale) {
  return (tool: CollectionEntry<'tools'>) => tool.data.status === 'published' && entriesForLocale(locale)(tool);
}
