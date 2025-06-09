import type { AstroGlobal } from 'astro';
import type { CollectionEntry, DataEntryMap } from 'astro:content';
import { getRelativeLocaleUrl } from 'astro:i18n';

import { defaultLocale, locales } from './constants';
import type { Locale } from './constants';
import { messages, type MessageKey } from './messages';

export function getLocale(astro: AstroGlobal): Locale {
  const locale = astro.currentLocale as Locale;

  return locales.includes(locale) ? locale : defaultLocale;
}

export function getTranslations(locale: Locale): (key: MessageKey) => string {
  return (key: MessageKey) => messages[locale][key];
}

export function entriesForLocale(locale: Locale) {
  return (entry: CollectionEntry<keyof DataEntryMap>) => entry.id.startsWith(`${locale}/`);
}

export function prependLocale(path: string, locale: Locale) {
  return `${locale}/${path}`;
}

export function omitLocale(path: string) {
  return path.match(/^(pl|en)\//) ? path.replace(/^(pl|en)\//, '') : path.replace(/\/(pl|en)\//, '/');
}

export function localizedPath(path: string, locale: Locale) {
  let localizedPath = getRelativeLocaleUrl(locale, path);

  if (localizedPath.endsWith('/')) {
    localizedPath = localizedPath.slice(0, -1);
  }

  return localizedPath;
}
