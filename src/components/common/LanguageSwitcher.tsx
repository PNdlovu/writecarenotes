import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SUPPORTED_LOCALES, REGION_LOCALE_MAP } from '@/config/constants';
import { usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
  const router = useRouter();
  const t = useTranslations('Common');
  const pathname = usePathname();

  // Get available languages based on current region
  const getCurrentRegion = () => {
    const region = pathname.split('/')[1]; // Assuming URL structure like /{region}/...
    return Object.keys(REGION_LOCALE_MAP).find(r => r === region) || 'england';
  };

  const getAvailableLocales = () => {
    const region = getCurrentRegion();
    const locales = REGION_LOCALE_MAP[region as keyof typeof REGION_LOCALE_MAP];
    return Array.isArray(locales) ? locales : [locales];
  };

  const handleLanguageChange = (locale: string) => {
    const region = getCurrentRegion();
    const newPath = pathname.replace(/^\/[^\/]+/, `/${region}`);
    router.push(`${newPath}?lang=${locale}`);
  };

  const availableLocales = getAvailableLocales();

  return (
    <div className="relative inline-block text-left">
      <select
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        aria-label={t('selectLanguage')}
      >
        {availableLocales.map((locale) => (
          <option key={locale} value={locale}>
            {SUPPORTED_LOCALES[locale as keyof typeof SUPPORTED_LOCALES]}
          </option>
        ))}
      </select>
    </div>
  );
}


