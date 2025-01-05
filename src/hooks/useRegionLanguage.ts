import { usePathname, useSearchParams } from 'next/navigation';
import { REGION_LOCALE_MAP } from '@/config/constants';
import type { Region } from '@prisma/client';

export function useRegionLanguage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Extract region from URL (first path segment)
  const urlRegion = pathname.split('/')[1] as Region;
  const region = Object.keys(REGION_LOCALE_MAP).includes(urlRegion) ? urlRegion : 'england';
  
  // Get language from search params or default for region
  const lang = searchParams.get('lang');
  const supportedLocales = REGION_LOCALE_MAP[region as keyof typeof REGION_LOCALE_MAP];
  const defaultLocale = Array.isArray(supportedLocales) ? supportedLocales[0] : supportedLocales;
  const currentLocale = lang || defaultLocale;
  
  // Get available languages for current region
  const availableLocales = Array.isArray(supportedLocales) ? supportedLocales : [supportedLocales];
  
  return {
    region,
    currentLocale,
    availableLocales,
    isValidLocale: (locale: string) => availableLocales.includes(locale)
  };
}


