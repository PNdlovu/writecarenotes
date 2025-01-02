/**
 * @fileoverview Regional Constants
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Constants for regional settings and configurations
 */

export interface RegionConfig {
  code: string;
  name: string;
  languages: string[];
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}

export const REGIONS: Record<string, RegionConfig> = {
  ENGLAND: {
    code: 'ENG',
    name: 'England',
    languages: ['en'],
    currency: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound'
    },
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-GB'
  },
  WALES: {
    code: 'WAL',
    name: 'Wales',
    languages: ['en', 'cy'],
    currency: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound'
    },
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-GB'
  },
  SCOTLAND: {
    code: 'SCT',
    name: 'Scotland',
    languages: ['en', 'gd'],
    currency: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound'
    },
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-GB'
  },
  NORTHERN_IRELAND: {
    code: 'NIR',
    name: 'Northern Ireland',
    languages: ['en', 'ga'],
    currency: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound'
    },
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-GB'
  },
  IRELAND: {
    code: 'IRL',
    name: 'Ireland',
    languages: ['en', 'ga'],
    currency: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro'
    },
    timezone: 'Europe/Dublin',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-IE'
  }
}; 