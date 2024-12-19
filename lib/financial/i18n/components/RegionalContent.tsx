import React, { useEffect } from 'react';
import { regionLanguageMap, setLanguage, SupportedLanguage } from '../index';

interface RegionalContentProps {
  region: keyof typeof regionLanguageMap;
  children: React.ReactNode;
}

export const RegionalContent: React.FC<RegionalContentProps> = ({
  region,
  children
}) => {
  useEffect(() => {
    const regionLanguage = regionLanguageMap[region];
    setLanguage(regionLanguage as SupportedLanguage);
  }, [region]);

  return <>{children}</>;
};

export default RegionalContent;
