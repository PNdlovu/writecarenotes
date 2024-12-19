import { RegionalConfig } from '../types';

const regions: Record<string, RegionalConfig> = {
  england: {
    currency: {
      code: 'GBP',
      symbol: '£',
      position: 'prefix'
    },
    regulatoryBody: {
      name: 'Care Quality Commission (CQC)',
      website: 'https://www.cqc.org.uk',
      requirements: [
        'Financial viability assessments',
        'Transparent fee structures',
        'Accurate financial records',
        'Regular financial reporting'
      ]
    },
    tax: {
      name: 'VAT',
      defaultRate: 20,
      codes: {
        standard: 20,
        reduced: 5,
        zero: 0
      }
    },
    dateFormat: 'DD/MM/YYYY',
    fiscalYear: {
      defaultStart: '04-06',
      defaultEnd: '04-05'
    }
  },
  scotland: {
    currency: {
      code: 'GBP',
      symbol: '£',
      position: 'prefix'
    },
    regulatoryBody: {
      name: 'Care Inspectorate',
      website: 'https://www.careinspectorate.com',
      requirements: [
        'Financial management systems',
        'Service cost transparency',
        'Financial monitoring',
        'Annual returns'
      ]
    },
    tax: {
      name: 'VAT',
      defaultRate: 20,
      codes: {
        standard: 20,
        reduced: 5,
        zero: 0
      }
    },
    dateFormat: 'DD/MM/YYYY',
    fiscalYear: {
      defaultStart: '04-06',
      defaultEnd: '04-05'
    }
  },
  wales: {
    currency: {
      code: 'GBP',
      symbol: '£',
      position: 'prefix'
    },
    regulatoryBody: {
      name: 'Care Inspectorate Wales (CIW)',
      website: 'https://careinspectorate.wales',
      requirements: [
        'Financial stability evidence',
        'Fee transparency',
        'Financial records maintenance',
        'Regular financial reviews'
      ]
    },
    tax: {
      name: 'VAT',
      defaultRate: 20,
      codes: {
        standard: 20,
        reduced: 5,
        zero: 0
      }
    },
    dateFormat: 'DD/MM/YYYY',
    fiscalYear: {
      defaultStart: '04-06',
      defaultEnd: '04-05'
    }
  },
  belfast: {
    currency: {
      code: 'GBP',
      symbol: '£',
      position: 'prefix'
    },
    regulatoryBody: {
      name: 'Regulation and Quality Improvement Authority (RQIA)',
      website: 'https://www.rqia.org.uk',
      requirements: [
        'Financial systems review',
        'Fee structure transparency',
        'Financial records accuracy',
        'Regular financial audits'
      ]
    },
    tax: {
      name: 'VAT',
      defaultRate: 20,
      codes: {
        standard: 20,
        reduced: 5,
        zero: 0
      }
    },
    dateFormat: 'DD/MM/YYYY',
    fiscalYear: {
      defaultStart: '04-06',
      defaultEnd: '04-05'
    }
  },
  dublin: {
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'prefix'
    },
    regulatoryBody: {
      name: 'Health Information and Quality Authority (HIQA)',
      website: 'https://www.hiqa.ie',
      requirements: [
        'Financial management policies',
        'Transparent charging',
        'Financial records maintenance',
        'Regular financial reporting'
      ]
    },
    tax: {
      name: 'VAT',
      defaultRate: 23,
      codes: {
        standard: 23,
        reduced: 13.5,
        secondReduced: 9,
        zero: 0
      }
    },
    dateFormat: 'DD/MM/YYYY',
    fiscalYear: {
      defaultStart: '01-01',
      defaultEnd: '12-31'
    }
  }
};

export const getRegionalConfig = (region: string): RegionalConfig => {
  const config = regions[region.toLowerCase()];
  if (!config) {
    throw new Error(`Regional configuration not found for: ${region}`);
  }
  return config;
};
