import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { format as formatDate, formatDistance } from 'date-fns';
import * as locales from 'date-fns/locale';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr', 'de', 'zh'],
    ns: ['common', 'medications', 'errors'],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
      format: (value, format, lng) => {
        if (value instanceof Date) {
          const locale = (locales as any)[lng as string] || locales.enUS;
          if (format === 'relative') {
            return formatDistance(value, new Date(), { locale });
          }
          return formatDate(value, format || 'PPP', { locale });
        }
        return value;
      },
    },
  });


