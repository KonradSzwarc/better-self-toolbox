export const locales = ['en', 'pl'] as const;

export const defaultLocale = 'en';

export type Locale = (typeof locales)[number];

export const regexLocales = `(${locales.join('|')})`;

export const localizedHomepages = new Set(locales.map((locale) => (locale === defaultLocale ? '/' : `/${locale}`)));
