export const SUPPORTED_REGIONS = {
  england: {
    name: 'England',
    languages: ['en'],
    currency: 'GBP',
    timezone: 'Europe/London',
    regulatoryBody: 'CQC'
  },
  wales: {
    name: 'Wales',
    languages: ['en', 'cy'],
    currency: 'GBP',
    timezone: 'Europe/London',
    regulatoryBody: 'CIW'
  },
  scotland: {
    name: 'Scotland',
    languages: ['en', 'gd'],
    currency: 'GBP',
    timezone: 'Europe/London',
    regulatoryBody: 'Care Inspectorate'
  },
  northernIreland: {
    name: 'Northern Ireland',
    languages: ['en', 'ga'],
    currency: 'GBP',
    timezone: 'Europe/London',
    regulatoryBody: 'RQIA'
  },
  ireland: {
    name: 'Ireland',
    languages: ['en', 'ga'],
    currency: 'EUR',
    timezone: 'Europe/Dublin',
    regulatoryBody: 'HIQA'
  }
}

export type SupportedRegion = keyof typeof SUPPORTED_REGIONS
export type SupportedLanguage = 'en' | 'cy' | 'gd' | 'ga' 


