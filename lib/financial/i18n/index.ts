import { en } from './translations/en';
import { ga } from './translations/ga';
import { cy } from './translations/cy';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

export const supportedLanguages = ['en', 'ga', 'cy'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  ga: 'Gaeilge',
  cy: 'Cymraeg'
};

export const regionLanguageMap = {
  'England': 'en',
  'Scotland': 'en',
  'Wales': 'cy',
  'Belfast': 'en',
  'Dublin': 'ga'
} as const;

const resources = {
  en: { translation: en },
  ga: { translation: ga },
  cy: { translation: cy }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie']
    },
    react: {
      useSuspense: true
    }
  });

export default i18n;

// Helper functions for language management
export const setLanguage = async (lang: SupportedLanguage) => {
  if (supportedLanguages.includes(lang)) {
    await i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    document.documentElement.lang = lang;
  }
};

export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language || 'en') as SupportedLanguage;
};

export const getLanguageFromRegion = (region: keyof typeof regionLanguageMap): SupportedLanguage => {
  return regionLanguageMap[region];
};

// Type-safe translation key helper
type DeepKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${DeepKeys<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

export type TranslationKey = DeepKeys<typeof en>;

// Type-safe translation function
export const translate = (key: TranslationKey, options?: Record<string, any>) => {
  return i18n.t(key, options);
};
