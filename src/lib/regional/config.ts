import { z } from 'zod';

export const RegionSchema = z.enum([
  'UK',
  'US',
  'EU',
  'AU',
  'NZ',
  'CA'
]);

export type Region = z.infer<typeof RegionSchema>;

interface RegionalConfig {
  language: string;
  defaultTimezone: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousand: string;
    precision: number;
  };
  currencyFormat: {
    symbol: string;
    position: 'before' | 'after';
  };
  regulations: {
    dataRetentionDays: number;
    requiresConsent: boolean;
    consentValidityDays: number;
  };
}

const regionalConfigs: Record<Region, RegionalConfig> = {
  UK: {
    language: 'en-GB',
    defaultTimezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: '.',
      thousand: ',',
      precision: 2
    },
    currencyFormat: {
      symbol: '£',
      position: 'before'
    },
    regulations: {
      dataRetentionDays: 2555, // 7 years
      requiresConsent: true,
      consentValidityDays: 365
    }
  },
  US: {
    language: 'en-US',
    defaultTimezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'hh:mm A',
    numberFormat: {
      decimal: '.',
      thousand: ',',
      precision: 2
    },
    currencyFormat: {
      symbol: '$',
      position: 'before'
    },
    regulations: {
      dataRetentionDays: 2190, // 6 years
      requiresConsent: true,
      consentValidityDays: 365
    }
  },
  EU: {
    language: 'en-EU',
    defaultTimezone: 'Europe/Brussels',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: ',',
      thousand: '.',
      precision: 2
    },
    currencyFormat: {
      symbol: '€',
      position: 'after'
    },
    regulations: {
      dataRetentionDays: 1825, // 5 years (GDPR)
      requiresConsent: true,
      consentValidityDays: 730 // 2 years
    }
  },
  AU: {
    language: 'en-AU',
    defaultTimezone: 'Australia/Sydney',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: '.',
      thousand: ',',
      precision: 2
    },
    currencyFormat: {
      symbol: '$',
      position: 'before'
    },
    regulations: {
      dataRetentionDays: 2555, // 7 years
      requiresConsent: true,
      consentValidityDays: 365
    }
  },
  NZ: {
    language: 'en-NZ',
    defaultTimezone: 'Pacific/Auckland',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: '.',
      thousand: ',',
      precision: 2
    },
    currencyFormat: {
      symbol: '$',
      position: 'before'
    },
    regulations: {
      dataRetentionDays: 2555, // 7 years
      requiresConsent: true,
      consentValidityDays: 365
    }
  },
  CA: {
    language: 'en-CA',
    defaultTimezone: 'America/Toronto',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: '.',
      thousand: ',',
      precision: 2
    },
    currencyFormat: {
      symbol: '$',
      position: 'before'
    },
    regulations: {
      dataRetentionDays: 2555, // 7 years
      requiresConsent: true,
      consentValidityDays: 365
    }
  }
};

export async function getRegionalConfig(region: Region): Promise<RegionalConfig> {
  return regionalConfigs[region];
}

export function validateRegion(region: string): region is Region {
  return RegionSchema.safeParse(region).success;
}
