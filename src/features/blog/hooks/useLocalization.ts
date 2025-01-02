/**
 * @writecarenotes.com
 * @fileoverview Blog localization hook
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom hook for managing blog content localization and regional settings.
 * Supports multiple languages per region with fallback chains and
 * regional regulatory content handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Region, RegulatoryBody } from '@/app/api/blog/types';

interface LocaleConfig {
  region: Region;
  language: string;
  regulatoryBodies: RegulatoryBody[];
  dateFormat: string;
  timeFormat: string;
  currencyCode: string;
}

// Regional configurations
const REGION_CONFIGS: Record<Region, LocaleConfig[]> = {
  [Region.ENGLAND]: [
    {
      region: Region.ENGLAND,
      language: 'en-GB',
      regulatoryBodies: [RegulatoryBody.CQC, RegulatoryBody.OFSTED],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currencyCode: 'GBP',
    },
  ],
  [Region.WALES]: [
    {
      region: Region.WALES,
      language: 'en-GB',
      regulatoryBodies: [RegulatoryBody.CIW],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currencyCode: 'GBP',
    },
    {
      region: Region.WALES,
      language: 'cy',  // Welsh
      regulatoryBodies: [RegulatoryBody.CIW],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currencyCode: 'GBP',
    },
  ],
  [Region.SCOTLAND]: [
    {
      region: Region.SCOTLAND,
      language: 'en-GB',
      regulatoryBodies: [RegulatoryBody.CI],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currencyCode: 'GBP',
    },
    {
      region: Region.SCOTLAND,
      language: 'gd',  // Scottish Gaelic
      regulatoryBodies: [RegulatoryBody.CI],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currencyCode: 'GBP',
    },
  ],
  [Region.NORTHERN_IRELAND]: [
    {
      region: Region.NORTHERN_IRELAND,
      language: 'en-GB',
      regulatoryBodies: [RegulatoryBody.RQIA],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currencyCode: 'GBP',
    },
    {
      region: Region.NORTHERN_IRELAND,
      language: 'ga',  // Irish
      regulatoryBodies: [RegulatoryBody.RQIA],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currencyCode: 'GBP',
    },
  ],
  [Region.IRELAND]: [
    {
      region: Region.IRELAND,
      language: 'en-IE',
      regulatoryBodies: [RegulatoryBody.HIQA],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currencyCode: 'EUR',
    },
    {
      region: Region.IRELAND,
      language: 'ga',  // Irish
      regulatoryBodies: [RegulatoryBody.HIQA],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currencyCode: 'EUR',
    },
  ],
  [Region.ALL]: [
    {
      region: Region.ALL,
      language: 'en-GB',
      regulatoryBodies: Object.values(RegulatoryBody),
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currencyCode: 'GBP',
    },
  ],
};

export function useLocalization() {
  const router = useRouter();
  const [currentConfig, setCurrentConfig] = useState<LocaleConfig>();
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

  // Initialize localization based on URL or user preferences
  useEffect(() => {
    const region = (router.query.region as Region) || Region.ALL;
    const language = router.locale || 'en-GB';
    
    const configs = REGION_CONFIGS[region];
    const config = configs.find(c => c.language === language) || configs[0];
    
    setCurrentConfig(config);
    setAvailableLanguages(configs.map(c => c.language));
  }, [router.query.region, router.locale]);

  // Change language while maintaining current region
  const changeLanguage = useCallback(async (language: string) => {
    const { pathname, asPath, query } = router;
    await router.push({ pathname, query }, asPath, { locale: language });
  }, [router]);

  // Change region and set appropriate language
  const changeRegion = useCallback(async (region: Region) => {
    const configs = REGION_CONFIGS[region];
    const preferredLanguage = router.locale;
    
    // Find config with current language or default to first available
    const config = configs.find(c => c.language === preferredLanguage) || configs[0];
    
    await router.push({
      pathname: router.pathname,
      query: { ...router.query, region },
    }, undefined, { locale: config.language });
  }, [router]);

  // Format date according to regional settings
  const formatDate = useCallback((date: Date | string) => {
    if (!currentConfig) return '';
    
    return new Intl.DateTimeFormat(currentConfig.language, {
      dateStyle: 'long',
    }).format(new Date(date));
  }, [currentConfig]);

  // Format time according to regional settings
  const formatTime = useCallback((date: Date | string) => {
    if (!currentConfig) return '';
    
    return new Intl.DateTimeFormat(currentConfig.language, {
      timeStyle: 'short',
    }).format(new Date(date));
  }, [currentConfig]);

  // Format currency according to regional settings
  const formatCurrency = useCallback((amount: number) => {
    if (!currentConfig) return '';
    
    return new Intl.NumberFormat(currentConfig.language, {
      style: 'currency',
      currency: currentConfig.currencyCode,
    }).format(amount);
  }, [currentConfig]);

  return {
    currentConfig,
    availableLanguages,
    changeLanguage,
    changeRegion,
    formatDate,
    formatTime,
    formatCurrency,
  };
} 