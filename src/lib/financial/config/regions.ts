import { Region } from '@/lib/types';

export interface TaxConfig {
  name: string;
  rate: number;
  code: string;
  rules?: {
    threshold?: number;
    exemptions?: string[];
  };
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
  format: string;
}

export interface AccountingStandard {
  name: string;
  code: string;
  description: string;
  chartOfAccounts: {
    [key: string]: {
      code: string;
      name: string;
      type: string;
      category: string;
    };
  };
}

export interface RegionalConfig {
  region: Region;
  currency: CurrencyConfig;
  taxes: TaxConfig[];
  accountingStandard: AccountingStandard;
  fiscalYear: {
    startMonth: number;
    startDay: number;
  };
  reportingRequirements: {
    frequency: 'monthly' | 'quarterly' | 'annually';
    deadlines: {
      [key: string]: string;
    };
    mandatoryReports: string[];
  };
  regulatoryBody: {
    name: string;
    code: string;
    requirements: string[];
  };
}

// England Configuration
const englandConfig: RegionalConfig = {
  region: 'england',
  currency: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimals: 2,
    format: '£#,##0.00'
  },
  taxes: [
    {
      name: 'Value Added Tax',
      code: 'VAT',
      rate: 20,
      rules: {
        threshold: 85000,
        exemptions: ['medical-services', 'care-services']
      }
    }
  ],
  accountingStandard: {
    name: 'UK GAAP',
    code: 'FRS102',
    description: 'Financial Reporting Standard 102',
    chartOfAccounts: {
      '1000': {
        code: '1000',
        name: 'Cash and Bank',
        type: 'asset',
        category: 'current-asset'
      }
    }
  },
  fiscalYear: {
    startMonth: 4, // April
    startDay: 1
  },
  reportingRequirements: {
    frequency: 'quarterly',
    deadlines: {
      'vat': '1 month and 7 days after period end',
      'annual-accounts': '9 months after year end',
      'cqc-returns': 'Annually by April 30th'
    },
    mandatoryReports: [
      'VAT Return',
      'Annual Accounts',
      'CQC Financial Return',
      'Corporation Tax Return'
    ]
  },
  regulatoryBody: {
    name: 'Care Quality Commission',
    code: 'CQC',
    requirements: [
      'Annual Financial Return',
      'Market Oversight Submission',
      'Provider Information Return'
    ]
  }
};

// Scotland Configuration
const scotlandConfig: RegionalConfig = {
  region: 'scotland',
  currency: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimals: 2,
    format: '£#,##0.00'
  },
  taxes: [
    {
      name: 'Value Added Tax',
      code: 'VAT',
      rate: 20,
      rules: {
        threshold: 85000,
        exemptions: ['medical-services', 'care-services']
      }
    }
  ],
  accountingStandard: {
    name: 'UK GAAP',
    code: 'FRS102',
    description: 'Financial Reporting Standard 102',
    chartOfAccounts: {
      '1000': {
        code: '1000',
        name: 'Cash and Bank',
        type: 'asset',
        category: 'current-asset'
      }
    }
  },
  fiscalYear: {
    startMonth: 4,
    startDay: 1
  },
  reportingRequirements: {
    frequency: 'quarterly',
    deadlines: {
      'vat': '1 month and 7 days after period end',
      'annual-accounts': '9 months after year end',
      'care-inspectorate-returns': 'Annually by May 31st'
    },
    mandatoryReports: [
      'VAT Return',
      'Annual Accounts',
      'Care Inspectorate Financial Return',
      'Corporation Tax Return'
    ]
  },
  regulatoryBody: {
    name: 'Care Inspectorate Scotland',
    code: 'CIS',
    requirements: [
      'Annual Financial Return',
      'Provider Service Information Return',
      'Financial Viability Statement'
    ]
  }
};

// Wales Configuration
const walesConfig: RegionalConfig = {
  region: 'wales',
  currency: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimals: 2,
    format: '£#,##0.00'
  },
  taxes: [
    {
      name: 'Value Added Tax',
      code: 'VAT',
      rate: 20,
      rules: {
        threshold: 85000,
        exemptions: ['medical-services', 'care-services']
      }
    }
  ],
  accountingStandard: {
    name: 'UK GAAP',
    code: 'FRS102',
    description: 'Financial Reporting Standard 102',
    chartOfAccounts: {
      '1000': {
        code: '1000',
        name: 'Cash and Bank',
        type: 'asset',
        category: 'current-asset'
      }
    }
  },
  fiscalYear: {
    startMonth: 4,
    startDay: 1
  },
  reportingRequirements: {
    frequency: 'quarterly',
    deadlines: {
      'vat': '1 month and 7 days after period end',
      'annual-accounts': '9 months after year end',
      'ciw-returns': 'Annually by April 30th'
    },
    mandatoryReports: [
      'VAT Return',
      'Annual Accounts',
      'CIW Financial Return',
      'Corporation Tax Return'
    ]
  },
  regulatoryBody: {
    name: 'Care Inspectorate Wales',
    code: 'CIW',
    requirements: [
      'Annual Financial Return',
      'Statement of Purpose',
      'Financial Viability Assessment'
    ]
  }
};

// Belfast (Northern Ireland) Configuration
const belfastConfig: RegionalConfig = {
  region: 'belfast',
  currency: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimals: 2,
    format: '£#,##0.00'
  },
  taxes: [
    {
      name: 'Value Added Tax',
      code: 'VAT',
      rate: 20,
      rules: {
        threshold: 85000,
        exemptions: ['medical-services', 'care-services']
      }
    }
  ],
  accountingStandard: {
    name: 'UK GAAP',
    code: 'FRS102',
    description: 'Financial Reporting Standard 102',
    chartOfAccounts: {
      '1000': {
        code: '1000',
        name: 'Cash and Bank',
        type: 'asset',
        category: 'current-asset'
      }
    }
  },
  fiscalYear: {
    startMonth: 4,
    startDay: 1
  },
  reportingRequirements: {
    frequency: 'quarterly',
    deadlines: {
      'vat': '1 month and 7 days after period end',
      'annual-accounts': '9 months after year end',
      'rqia-returns': 'Annually by April 30th'
    },
    mandatoryReports: [
      'VAT Return',
      'Annual Accounts',
      'RQIA Financial Return',
      'Corporation Tax Return'
    ]
  },
  regulatoryBody: {
    name: 'Regulation and Quality Improvement Authority',
    code: 'RQIA',
    requirements: [
      'Annual Financial Return',
      'Statement of Purpose',
      'Financial Viability Assessment'
    ]
  }
};

// Dublin (Ireland) Configuration
const dublinConfig: RegionalConfig = {
  region: 'dublin',
  currency: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimals: 2,
    format: '€#,##0.00'
  },
  taxes: [
    {
      name: 'Value Added Tax',
      code: 'VAT',
      rate: 23,
      rules: {
        threshold: 75000, // Service threshold in EUR
        exemptions: ['medical-services', 'care-services']
      }
    }
  ],
  accountingStandard: {
    name: 'FRS 102',
    code: 'FRS102',
    description: 'Financial Reporting Standard 102 (Ireland)',
    chartOfAccounts: {
      '1000': {
        code: '1000',
        name: 'Cash and Bank',
        type: 'asset',
        category: 'current-asset'
      }
    }
  },
  fiscalYear: {
    startMonth: 1, // January
    startDay: 1
  },
  reportingRequirements: {
    frequency: 'quarterly',
    deadlines: {
      'vat': '19th of the month after period end',
      'annual-accounts': '9 months after year end',
      'hiqa-returns': 'Annually by March 31st'
    },
    mandatoryReports: [
      'VAT Return',
      'Annual Accounts',
      'HIQA Financial Return',
      'Corporation Tax Return'
    ]
  },
  regulatoryBody: {
    name: 'Health Information and Quality Authority',
    code: 'HIQA',
    requirements: [
      'Annual Financial Return',
      'Statement of Purpose',
      'Financial Viability Assessment'
    ]
  }
};

// Regional configurations map
export const regionalConfigs: { [key in Region]: RegionalConfig } = {
  england: englandConfig,
  scotland: scotlandConfig,
  wales: walesConfig,
  belfast: belfastConfig,
  dublin: dublinConfig
};

export const getRegionalConfig = (region: Region): RegionalConfig => {
  const config = regionalConfigs[region];
  if (!config) {
    throw new Error(`Configuration not found for region: ${region}`);
  }
  return config;
};


