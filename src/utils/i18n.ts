import type { CollectionEntry, DataEntryMap } from 'astro:content';
import { getRelativeLocaleUrl } from 'astro:i18n';

export function entriesForLocale(locale?: string) {
  return (entry: CollectionEntry<keyof DataEntryMap>) => entry.id.startsWith(`${locale}/`);
}

export function addLocale(path: string, locale?: string) {
  return `${locale}/${path}`;
}

export function omitLocale(path: string) {
  return path.match(/^(pl|en)\//) ? path.replace(/^(pl|en)\//, '') : path.replace(/\/(pl|en)\//, '/');
}

export function localizedPath(path: string, locale?: string) {
  if (!locale) {
    throw new Error('Locale not provided');
  }
  return getRelativeLocaleUrl(locale, omitLocale(path));
}
