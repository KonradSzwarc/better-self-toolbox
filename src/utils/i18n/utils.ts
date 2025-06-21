import type { AstroGlobal } from 'astro';
import type { CollectionEntry, DataEntryMap } from 'astro:content';
import type { Locale } from './constants';
import type { MessageKey } from './messages';

import { getRelativeLocaleUrl } from 'astro:i18n';
import { trimEnd } from 'lodash-es';
import { defaultLocale, locales, regexLocales } from './constants';
import { messages } from './messages';

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
  return parsePath([locale, path].join('/'));
}

export function omitLocale(path: string) {
  return parsePath(
    path
      .replace(new RegExp(`^${regexLocales}/`), '')
      .replace(new RegExp(`/${regexLocales}/`), '/')
      .replace(new RegExp(`/${regexLocales}$`), ''),
  );
}

export function localizedPath(path: string, locale: Locale) {
  return parsePath(getRelativeLocaleUrl(locale, path));
}

function parsePath(path: string) {
  return trimEnd(removeDoubleSlashes(path), '/') || '/';
}

function removeDoubleSlashes(path: string) {
  return path.replace('//', '/');
}
