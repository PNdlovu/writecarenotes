import { useI18n } from '../lib/config';

export interface MedicalTermContext {
  category: 'medication' | 'condition' | 'procedure' | 'vital';
  specialty?: string;
  isAbbreviation?: boolean;
}

export const useMedicalTranslation = () => {
  const { t, locale } = useI18n('medical');

  const translateTerm = (key: string, context?: MedicalTermContext) => {
    const category = context?.category ? `${context.category}.` : '';
    const specialty = context?.specialty ? `${context.specialty}.` : '';
    
    // Try most specific translation first
    let translation = t(`${category}${specialty}${key}`);
    
    // Fall back to category-only translation
    if (translation === key && specialty) {
      translation = t(`${category}${key}`);
    }
    
    // For abbreviations, include full form in parentheses
    if (context?.isAbbreviation && translation !== key) {
      const fullForm = t(`${category}${specialty}${key}.full`);
      if (fullForm !== `${category}${specialty}${key}.full`) {
        translation = `${translation} (${fullForm})`;
      }
    }

    return translation;
  };

  const getCommonPhrases = (category: MedicalTermContext['category']) => {
    return t(`${category}.common`, { returnObjects: true }) as string[];
  };

  return {
    translateTerm,
    getCommonPhrases,
    locale
  };
};
