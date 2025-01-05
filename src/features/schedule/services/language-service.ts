import { Region } from '../types/handover';
import i18next from 'i18next';

interface LanguageConfig {
  code: string;
  name: string;
  region: Region;
  isRTL: boolean;
  dateFormat: string;
  timeFormat: string;
  currencyCode: string;
}

export class LanguageService {
  private supportedLanguages: Map<string, LanguageConfig> = new Map([
    ['en-GB', {
      code: 'en-GB',
      name: 'English (UK)',
      region: 'ENGLAND',
      isRTL: false,
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currencyCode: 'GBP',
    }],
    ['cy-GB', {
      code: 'cy-GB',
      name: 'Cymraeg',
      region: 'WALES',
      isRTL: false,
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currencyCode: 'GBP',
    }],
    ['gd-GB', {
      code: 'gd-GB',
      name: 'Gàidhlig',
      region: 'SCOTLAND',
      isRTL: false,
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currencyCode: 'GBP',
    }],
    ['ga-IE', {
      code: 'ga-IE',
      name: 'Gaeilge',
      region: 'IRELAND',
      isRTL: false,
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currencyCode: 'EUR',
    }],
  ]);

  private careTerminology: Map<string, Map<string, string>> = new Map([
    ['en-GB', new Map([
      ['PERSONAL_CARE', 'Personal Care'],
      ['MEDICATION', 'Medication'],
      ['VITAL_SIGNS', 'Vital Signs'],
      ['EDUCATION_SUPPORT', 'Education Support'],
      ['SAFEGUARDING', 'Safeguarding'],
      ['EMOTIONAL_SUPPORT', 'Emotional Support'],
      ['LIFE_SKILLS', 'Life Skills'],
      ['FAMILY_CONTACT', 'Family Contact'],
      ['INDEPENDENT_VISITOR', 'Independent Visitor'],
      ['ADVOCACY_SUPPORT', 'Advocacy Support'],
    ])],
    ['cy-GB', new Map([
      ['PERSONAL_CARE', 'Gofal Personol'],
      ['MEDICATION', 'Meddyginiaeth'],
      ['VITAL_SIGNS', 'Arwyddion Hanfodol'],
      ['EDUCATION_SUPPORT', 'Cymorth Addysg'],
      ['SAFEGUARDING', 'Diogelu'],
      ['EMOTIONAL_SUPPORT', 'Cymorth Emosiynol'],
      ['LIFE_SKILLS', 'Sgiliau Bywyd'],
      ['FAMILY_CONTACT', 'Cyswllt Teulu'],
      ['INDEPENDENT_VISITOR', 'Ymwelydd Annibynnol'],
      ['ADVOCACY_SUPPORT', 'Cymorth Eiriolaeth'],
    ])],
  ]);

  constructor() {
    this.initializeI18n();
  }

  async setLanguage(languageCode: string): Promise<void> {
    const config = this.supportedLanguages.get(languageCode);
    if (!config) {
      throw new Error(`Unsupported language: ${languageCode}`);
    }

    await i18next.changeLanguage(languageCode);
    this.updateDocumentAttributes(config);
  }

  getTerminology(term: string, languageCode: string): string {
    const terminology = this.careTerminology.get(languageCode);
    if (!terminology) return term;

    return terminology.get(term) || term;
  }

  formatDate(date: Date, languageCode: string): string {
    const config = this.supportedLanguages.get(languageCode);
    if (!config) return date.toISOString();

    return new Intl.DateTimeFormat(languageCode, {
      dateStyle: 'full',
    }).format(date);
  }

  formatTime(date: Date, languageCode: string): string {
    const config = this.supportedLanguages.get(languageCode);
    if (!config) return date.toISOString();

    return new Intl.DateTimeFormat(languageCode, {
      timeStyle: 'short',
    }).format(date);
  }

  formatCurrency(amount: number, languageCode: string): string {
    const config = this.supportedLanguages.get(languageCode);
    if (!config) return amount.toString();

    return new Intl.NumberFormat(languageCode, {
      style: 'currency',
      currency: config.currencyCode,
    }).format(amount);
  }

  getRegionalTerminology(region: Region): Map<string, string> {
    const regionalTerms = new Map<string, string>();
    
    switch (region) {
      case 'ENGLAND':
        regionalTerms.set('CARE_HOME', 'Care Home');
        regionalTerms.set('RESIDENT', 'Resident');
        break;
      case 'WALES':
        regionalTerms.set('CARE_HOME', 'Cartref Gofal');
        regionalTerms.set('RESIDENT', 'Preswylydd');
        break;
      case 'SCOTLAND':
        regionalTerms.set('CARE_HOME', 'Care Home');
        regionalTerms.set('RESIDENT', 'Resident');
        break;
      case 'IRELAND':
        regionalTerms.set('CARE_HOME', 'Teach Cúraim');
        regionalTerms.set('RESIDENT', 'Cónaitheoir');
        break;
    }

    return regionalTerms;
  }

  private async initializeI18n(): Promise<void> {
    await i18next.init({
      lng: 'en-GB',
      fallbackLng: 'en-GB',
      resources: {
        'en-GB': {
          translation: require('../locales/en-GB.json'),
        },
        'cy-GB': {
          translation: require('../locales/cy-GB.json'),
        },
        // Add other language resources
      },
    });
  }

  private updateDocumentAttributes(config: LanguageConfig): void {
    document.documentElement.lang = config.code;
    document.documentElement.dir = config.isRTL ? 'rtl' : 'ltr';
  }
}
