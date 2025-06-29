import type { AstroGlobal } from 'astro';
import type { CollectionEntry, DataEntryMap } from 'astro:content';
import type { DefaultNamespace, KeyPrefix } from 'i18next';
import type { Locale } from './constants';

import { getRelativeLocaleUrl } from 'astro:i18n';
import i18next from 'i18next';
import { trimEnd } from 'lodash-es';
import { defaultLocale, locales, regexLocales } from './constants';
import { messages } from './messages';

i18next.init({
  fallbackLng: defaultLocale,
  resources: {
    en: { translation: messages.en },
    pl: { translation: messages.pl },
  },
});

export function getLocale(astro: AstroGlobal): Locale {
  const locale = astro.currentLocale as Locale;

  return locales.includes(locale) ? locale : defaultLocale;
}

export function getTranslations<TKPrefix extends KeyPrefix<DefaultNamespace> = undefined>(
  astro: AstroGlobal,
  key?: TKPrefix,
) {
  return i18next.getFixedT(getLocale(astro), 'translation', key);
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
