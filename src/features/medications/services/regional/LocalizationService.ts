/**
 * @writecarenotes.com
 * @fileoverview Medication Localization Service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles localization and translation of medication-related content
 * across all supported regions and languages.
 */

import type { Region } from '@/features/compliance/types/compliance.types';

interface LocaleConfig {
  primaryLanguage: string;
  secondaryLanguages: string[];
  dateFormat: string;
  timeFormat: string;
  measurementUnits: {
    weight: string;
    volume: string;
    temperature: string;
  };
  currencyCode: string;
}

export class LocalizationService {
  private readonly localeConfigs: Record<Region, LocaleConfig> = {
    ENGLAND: {
      primaryLanguage: 'en-GB',
      secondaryLanguages: [],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      measurementUnits: {
        weight: 'kg',
        volume: 'ml',
        temperature: '°C'
      },
      currencyCode: 'GBP'
    },
    WALES: {
      primaryLanguage: 'en-GB',
      secondaryLanguages: ['cy'],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      measurementUnits: {
        weight: 'kg',
        volume: 'ml',
        temperature: '°C'
      },
      currencyCode: 'GBP'
    },
    SCOTLAND: {
      primaryLanguage: 'en-GB',
      secondaryLanguages: ['gd'],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      measurementUnits: {
        weight: 'kg',
        volume: 'ml',
        temperature: '°C'
      },
      currencyCode: 'GBP'
    },
    NORTHERN_IRELAND: {
      primaryLanguage: 'en-GB',
      secondaryLanguages: ['ga'],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      measurementUnits: {
        weight: 'kg',
        volume: 'ml',
        temperature: '°C'
      },
      currencyCode: 'GBP'
    },
    IRELAND: {
      primaryLanguage: 'en-IE',
      secondaryLanguages: ['ga'],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      measurementUnits: {
        weight: 'kg',
        volume: 'ml',
        temperature: '°C'
      },
      currencyCode: 'EUR'
    }
  };

  private readonly translations: Record<string, Record<string, string>> = {
    'en-GB': {
      MEDICATION_ROUND: 'Medication Round',
      CONTROLLED_DRUGS: 'Controlled Drugs',
      STOCK_CHECK: 'Stock Check',
      // Add more translations as needed
    },
    'cy': {
      MEDICATION_ROUND: 'Rownd Meddyginiaeth',
      CONTROLLED_DRUGS: 'Cyffuriau a Reolir',
      STOCK_CHECK: 'Gwiriad Stoc',
      // Add more translations as needed
    },
    'gd': {
      MEDICATION_ROUND: 'Cuairt Leigheis',
      CONTROLLED_DRUGS: 'Drugaichean Smachdaichte',
      STOCK_CHECK: 'Sgrùdadh Stoc',
      // Add more translations as needed
    },
    'ga': {
      MEDICATION_ROUND: 'Babhta Cógais',
      CONTROLLED_DRUGS: 'Drugaí Rialaithe',
      STOCK_CHECK: 'Seiceáil Stoic',
      // Add more translations as needed
    },
    'en-IE': {
      MEDICATION_ROUND: 'Medication Round',
      CONTROLLED_DRUGS: 'Controlled Drugs',
      STOCK_CHECK: 'Stock Check',
      // Add more translations as needed
    }
  };

  constructor(private readonly region: Region) {}

  getLocaleConfig(): LocaleConfig {
    return this.localeConfigs[this.region];
  }

  translate(key: string, language?: string): string {
    const config = this.localeConfigs[this.region];
    const targetLanguage = language || config.primaryLanguage;
    
    return this.translations[targetLanguage]?.[key] || this.translations['en-GB'][key] || key;
  }

  formatDate(date: Date): string {
    const config = this.localeConfigs[this.region];
    return date.toLocaleDateString(config.primaryLanguage, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(date: Date): string {
    const config = this.localeConfigs[this.region];
    return date.toLocaleTimeString(config.primaryLanguage, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  formatMeasurement(value: number, unit: 'weight' | 'volume' | 'temperature'): string {
    const config = this.localeConfigs[this.region];
    return `${value}${config.measurementUnits[unit]}`;
  }

  formatCurrency(amount: number): string {
    const config = this.localeConfigs[this.region];
    return new Intl.NumberFormat(config.primaryLanguage, {
      style: 'currency',
      currency: config.currencyCode
    }).format(amount);
  }

  getSupportedLanguages(): string[] {
    const config = this.localeConfigs[this.region];
    return [config.primaryLanguage, ...config.secondaryLanguages];
  }

  isMultilingualRegion(): boolean {
    return this.localeConfigs[this.region].secondaryLanguages.length > 0;
  }

  requiresBilingualDocumentation(): boolean {
    return this.region === 'WALES' || this.region === 'IRELAND';
  }
} 