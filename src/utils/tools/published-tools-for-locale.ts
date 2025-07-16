import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n';
import { entriesForLocale } from '../i18n';
import { isPublished } from './is-published';

export function publishedToolsForLocale(locale: Locale) {
  return (tool: CollectionEntry<'tools'>) => isPublished(tool) && entriesForLocale(locale)(tool);
}
