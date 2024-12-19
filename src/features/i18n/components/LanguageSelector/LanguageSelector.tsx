import React from 'react';
import { Select } from '@/components/ui/select';
import { SUPPORTED_LANGUAGES, useChangeLocale } from '../../lib/config';

export function LanguageSelector() {
  const changeLocale = useChangeLocale();

  const handleLanguageChange = (value: string) => {
    changeLocale(value);
  };

  return (
    <Select
      onValueChange={handleLanguageChange}
      defaultValue={SUPPORTED_LANGUAGES[0]}
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <Select.Option key={lang} value={lang}>
          {lang.toUpperCase()}
        </Select.Option>
      ))}
    </Select>
  );
}

export default LanguageSelector;
