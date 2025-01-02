import { useI18n } from '../config';

export const useFinancialTranslation = () => {
  const i18n = useI18n();

  const t = (key: string, options?: Record<string, any>) => {
    return i18n(`financial.${key}`, options);
  };

  return {
    t,
    i18n
  };
};

export default useFinancialTranslation;


