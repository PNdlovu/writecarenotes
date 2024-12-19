import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supportedLanguages, languageNames, setLanguage, getCurrentLanguage, SupportedLanguage } from '../index';
import useTranslation from '../hooks/useTranslation';

interface LanguageSelectorProps {
  onLanguageChange?: (language: SupportedLanguage) => void;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  onLanguageChange,
  className 
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = getCurrentLanguage();

  const handleLanguageChange = async (value: string) => {
    const newLanguage = value as SupportedLanguage;
    await setLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  };

  return (
    <Select
      value={currentLanguage}
      onValueChange={handleLanguageChange}
      className={className}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {supportedLanguages.map((lang) => (
          <SelectItem key={lang} value={lang}>
            {languageNames[lang]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
