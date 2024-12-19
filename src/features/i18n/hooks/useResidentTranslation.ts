import { useI18n } from '../lib/config';

export const useResidentTranslation = () => {
  const i18n = useI18n();

  const t = (key: string, options?: Record<string, any>) => {
    return i18n(`resident.${key}`, options);
  };

  return {
    t,
    i18n
  };
};

export default useResidentTranslation;
