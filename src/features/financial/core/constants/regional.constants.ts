import { RegionalConfig } from '../types/regional.types';

export const REGIONAL_CONFIGS: Record<string, RegionalConfig> = {
  ENGLAND: {
    region: 'ENGLAND',
    authority: 'CQC',
    currency: 'GBP',
    vatRate: 20,
    fundingTypes: [
      'LOCAL_AUTHORITY',
      'NHS',
      'SELF_FUNDED',
      'MIXED'
    ],
    reportingFrequency: 'MONTHLY',
    financialYearEnd: '03-31'
  },
  WALES: {
    region: 'WALES',
    authority: 'CIW',
    currency: 'GBP',
    vatRate: 20,
    fundingTypes: [
      'LOCAL_AUTHORITY',
      'NHS',
      'SELF_FUNDED',
      'MIXED'
    ],
    reportingFrequency: 'MONTHLY',
    financialYearEnd: '03-31'
  },
  SCOTLAND: {
    region: 'SCOTLAND',
    authority: 'CI',
    currency: 'GBP',
    vatRate: 20,
    fundingTypes: [
      'LOCAL_AUTHORITY',
      'NHS',
      'SELF_FUNDED',
      'MIXED'
    ],
    reportingFrequency: 'MONTHLY',
    financialYearEnd: '03-31'
  },
  NORTHERN_IRELAND: {
    region: 'NORTHERN_IRELAND',
    authority: 'RQIA',
    currency: 'GBP',
    vatRate: 20,
    fundingTypes: [
      'LOCAL_AUTHORITY',
      'NHS',
      'SELF_FUNDED',
      'MIXED'
    ],
    reportingFrequency: 'MONTHLY',
    financialYearEnd: '03-31'
  },
  IRELAND: {
    region: 'IRELAND',
    authority: 'HIQA',
    currency: 'EUR',
    vatRate: 23,
    fundingTypes: [
      'LOCAL_AUTHORITY',
      'NHS',
      'SELF_FUNDED',
      'MIXED'
    ],
    reportingFrequency: 'MONTHLY',
    financialYearEnd: '12-31'
  }
};


