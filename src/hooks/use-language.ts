/**
 * @writecarenotes.com
 * @fileoverview Enterprise-grade language management hook
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom hook for managing language preferences and regional settings.
 * Features include:
 * - Language detection and switching
 * - Regional language defaults
 * - Persistent language preferences
 * - Fallback language handling
 */

import { useCallback, useEffect } from 'react';
import { useTranslation } from '@/i18n';
import { useRegion } from './use-region';
import { REGIONAL_CONFIG, type Region } from '@/types/regional';
import { logEvent } from '@/utils/analytics';

export interface Language {
  code: string;
  name: string;
  region: Region;
  isDefault?: boolean;
}

export interface UseLanguageOptions {
  persistPreference?: boolean;
  fallbackLanguage?: string;
}

const LANGUAGE_PREFERENCE_KEY = 'app_language_preference';

export function useLanguage(options: UseLanguageOptions = {}) {
  const { persistPreference = true, fallbackLanguage = 'en-GB' } = options;
  const { i18n } = useTranslation();
  const { region } = useRegion();

  const getAvailableLanguages = useCallback((): Language[] => {
    return Object.entries(REGIONAL_CONFIG).flatMap(([regionCode, config]) => 
      config.languages.map(lang => ({
        code: lang.code,
        name: lang.name,
        region: regionCode as Region,
        isDefault: lang.code === config.defaultLanguage
      }))
    );
  }, []);

  const getCurrentLanguage = useCallback((): Language | undefined => {
    return getAvailableLanguages().find(lang => lang.code === i18n.language);
  }, [i18n.language, getAvailableLanguages]);

  const setLanguage = useCallback(async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      
      if (persistPreference) {
        localStorage.setItem(LANGUAGE_PREFERENCE_KEY, languageCode);
      }

      logEvent('language_changed', {
        language: languageCode,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logEvent('language_change_failed', {
        language: languageCode,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }, [i18n, persistPreference]);

  // Initialize language based on preferences and region
  useEffect(() => {
    const initLanguage = async () => {
      const savedPreference = persistPreference 
        ? localStorage.getItem(LANGUAGE_PREFERENCE_KEY)
        : null;

      if (savedPreference) {
        await setLanguage(savedPreference);
        return;
      }

      const regionalDefault = REGIONAL_CONFIG[region]?.defaultLanguage;
      if (regionalDefault) {
        await setLanguage(regionalDefault);
        return;
      }

      await setLanguage(fallbackLanguage);
    };

    initLanguage();
  }, [region, setLanguage, persistPreference, fallbackLanguage]);

  return {
    currentLanguage: getCurrentLanguage(),
    availableLanguages: getAvailableLanguages(),
    setLanguage,
    isRTL: i18n.dir() === 'rtl',
  };
}
