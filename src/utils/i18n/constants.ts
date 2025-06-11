export const locales = ['en', 'pl'] as const;

export const defaultLocale = 'en';

export const localeCodes = {
  en: 'en-US',
  pl: 'pl-PL',
} satisfies Record<Locale, string>;

export type Locale = (typeof locales)[number];

export const regexLocales = `(${locales.join('|')})`;

export const localizedHomepages = new Set(locales.map((locale) => (locale === defaultLocale ? '/' : `/${locale}`)));
