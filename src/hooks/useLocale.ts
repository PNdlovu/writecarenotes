import { useState } from 'react';
import { LocaleConfig } from '@/components/dashboard/visualizations/types';

export function useLocale() {
  const [locale] = useState<LocaleConfig>({
    language: 'en',
    region: 'UK',
    currency: 'GBP',
    timezone: 'Europe/London'
  });

  return { locale };
}


