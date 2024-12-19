import { useTranslation as useI18nTranslation } from 'react-i18next';
import { TranslationKey } from '../index';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const typeSafeT = (key: TranslationKey, options?: Record<string, any>) => {
    return t(key, options);
  };

  return {
    t: typeSafeT,
    i18n
  };
};

export default useTranslation;
