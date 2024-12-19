import { createI18nServer } from 'next-international/server';
import { createI18nClient } from 'next-international/client';

export const SUPPORTED_LANGUAGES = ['en', 'en-GB-SCT', 'cy', 'en-IE', 'ga', 'es', 'fr', 'de'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const DEFAULT_LANGUAGE = 'en';
export const FALLBACK_LANGUAGE = 'en';

// Server-side translations
export const { getI18n, getScopedI18n, getCurrentLocale, getStaticParams } = createI18nServer({
  en: () => import('./locales/en'),
  'en-GB-SCT': () => import('./locales/en-GB-SCT'),
  cy: () => import('./locales/cy'),
  'en-IE': () => import('./locales/en-IE'),
  ga: () => import('./locales/ga'),
  es: () => import('./locales/es'),
  fr: () => import('./locales/fr'),
  de: () => import('./locales/de'),
});

// Client-side translations
export const { useI18n, useScopedI18n, useChangeLocale, I18nProviderClient } = createI18nClient({
  en: () => import('./locales/en'),
  'en-GB-SCT': () => import('./locales/en-GB-SCT'),
  cy: () => import('./locales/cy'),
  'en-IE': () => import('./locales/en-IE'),
  ga: () => import('./locales/ga'),
  es: () => import('./locales/es'),
  fr: () => import('./locales/fr'),
  de: () => import('./locales/de'),
});

// Type for translation keys
export type TranslationKey = keyof Awaited<ReturnType<typeof import('./locales/en')>['default']>;

// Helper function to get browser language
export function getBrowserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  const browserLang = window.navigator.language.split('-')[0];
  return SUPPORTED_LANGUAGES.includes(browserLang as SupportedLanguage)
    ? (browserLang as SupportedLanguage)
    : DEFAULT_LANGUAGE;
}

// Helper function to format dates according to locale
export function formatDate(date: Date, locale: SupportedLanguage): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Helper function to format numbers according to locale
export function formatNumber(
  number: number,
  locale: SupportedLanguage,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(number);
}

// Helper function to format currency according to locale
export function formatCurrency(
  amount: number,
  currency: string,
  locale: SupportedLanguage
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}


