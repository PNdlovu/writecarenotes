import { RegionalTaxConfig, TaxRegion } from '../types';

export class TaxConfigService {
  private readonly taxConfigs: RegionalTaxConfig[] = [
    {
      region: TaxRegion.UK,
      taxYear: '2023-2024',
      brackets: [
        { threshold: 0, rate: 0, name: 'Personal Allowance' },
        { threshold: 12570, rate: 0.2, name: 'Basic rate' },
        { threshold: 50270, rate: 0.4, name: 'Higher rate' },
        { threshold: 125140, rate: 0.45, name: 'Additional rate' }
      ],
      personalAllowance: {
        base: 12570,
        maxIncome: 125140,
        taperRate: 0.5 // Reduces by £1 for every £2 earned over £100,000
      },
      nationalInsurance: {
        employeeThresholds: [
          { threshold: 242, rate: 0, name: 'Below Primary Threshold (weekly)' },
          { threshold: 967, rate: 0.12, name: 'Primary Threshold to UEL (weekly)' },
          { threshold: Infinity, rate: 0.02, name: 'Above UEL (weekly)' }
        ],
        employerThresholds: [
          { threshold: 175, rate: 0, name: 'Below Secondary Threshold (weekly)' },
          { threshold: Infinity, rate: 0.138, name: 'Above Secondary Threshold (weekly)' }
        ]
      }
    },
    {
      region: TaxRegion.SCOTLAND,
      taxYear: '2023-2024',
      brackets: [
        { threshold: 0, rate: 0, name: 'Personal Allowance' },
        { threshold: 12570, rate: 0.19, name: 'Starter rate' },
        { threshold: 14732, rate: 0.20, name: 'Basic rate' },
        { threshold: 25688, rate: 0.21, name: 'Intermediate rate' },
        { threshold: 43662, rate: 0.42, name: 'Higher rate' },
        { threshold: 125140, rate: 0.47, name: 'Top rate' }
      ],
      personalAllowance: {
        base: 12570,
        maxIncome: 125140,
        taperRate: 0.5
      },
      nationalInsurance: {
        employeeThresholds: [
          { threshold: 242, rate: 0, name: 'Below Primary Threshold (weekly)' },
          { threshold: 967, rate: 0.12, name: 'Primary Threshold to UEL (weekly)' },
          { threshold: Infinity, rate: 0.02, name: 'Above UEL (weekly)' }
        ],
        employerThresholds: [
          { threshold: 175, rate: 0, name: 'Below Secondary Threshold (weekly)' },
          { threshold: Infinity, rate: 0.138, name: 'Above Secondary Threshold (weekly)' }
        ]
      }
    },
    {
      region: TaxRegion.IRELAND,
      taxYear: '2023-2024',
      brackets: [
        { threshold: 0, rate: 0.2, name: 'Standard rate' },
        { threshold: 40000, rate: 0.4, name: 'Higher rate' }
      ],
      personalAllowance: {
        base: 1775, // Personal tax credit (single person)
        maxIncome: Infinity,
        taperRate: 0
      }
      // Ireland uses PRSI instead of National Insurance, handled separately
    }
  ];

  getConfig(region: TaxRegion, taxYear: string): RegionalTaxConfig | undefined {
    return this.taxConfigs.find(
      config => config.region === region && config.taxYear === taxYear
    );
  }

  getAllConfigs(): RegionalTaxConfig[] {
    return this.taxConfigs;
  }

  getCurrentTaxYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Tax year starts in April for UK, January for Ireland
    if (month < 3) { // Before April
      return `${year-1}-${year}`;
    }
    return `${year}-${year+1}`;
  }

  calculatePersonalAllowance(config: RegionalTaxConfig, annualIncome: number): number {
    const { base, maxIncome, taperRate } = config.personalAllowance;
    
    if (annualIncome <= maxIncome) {
      return base;
    }

    // Calculate reduction in personal allowance
    const reduction = Math.min(
      base,
      Math.floor((annualIncome - maxIncome) * taperRate)
    );

    return Math.max(0, base - reduction);
  }
}


