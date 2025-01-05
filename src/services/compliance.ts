/**
 * @fileoverview Regional Compliance Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Service for handling regional compliance, validation, and formatting
 */

export type Region = 'GB-ENG' | 'GB-WLS' | 'GB-SCT' | 'GB-NIR' | 'IRL';

interface RegionalConfig {
  vatThreshold: number;
  auditThreshold: number;
  recordRetentionYears: number;
  requiresDigitalRecordKeeping: boolean;
  vatRates: {
    standard: number;
    reduced: number;
    zero: number;
  };
  regulatoryBody: string;
  currency: string;
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousand: string;
    precision: number;
  };
}

const REGIONAL_CONFIGS: Record<Region, RegionalConfig> = {
  'GB-ENG': {
    vatThreshold: 85000,
    auditThreshold: 10200000,
    recordRetentionYears: 6,
    requiresDigitalRecordKeeping: true,
    vatRates: {
      standard: 20,
      reduced: 5,
      zero: 0
    },
    regulatoryBody: 'HMRC',
    currency: 'GBP',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: '.',
      thousand: ',',
      precision: 2
    }
  },
  'GB-WLS': {
    vatThreshold: 85000,
    auditThreshold: 10200000,
    recordRetentionYears: 6,
    requiresDigitalRecordKeeping: true,
    vatRates: {
      standard: 20,
      reduced: 5,
      zero: 0
    },
    regulatoryBody: 'HMRC',
    currency: 'GBP',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: '.',
      thousand: ',',
      precision: 2
    }
  },
  'GB-SCT': {
    vatThreshold: 85000,
    auditThreshold: 10200000,
    recordRetentionYears: 6,
    requiresDigitalRecordKeeping: true,
    vatRates: {
      standard: 20,
      reduced: 5,
      zero: 0
    },
    regulatoryBody: 'HMRC',
    currency: 'GBP',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: '.',
      thousand: ',',
      precision: 2
    }
  },
  'GB-NIR': {
    vatThreshold: 85000,
    auditThreshold: 10200000,
    recordRetentionYears: 6,
    requiresDigitalRecordKeeping: true,
    vatRates: {
      standard: 20,
      reduced: 5,
      zero: 0
    },
    regulatoryBody: 'HMRC',
    currency: 'GBP',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: '.',
      thousand: ',',
      precision: 2
    }
  },
  'IRL': {
    vatThreshold: 75000,
    auditThreshold: 12000000,
    recordRetentionYears: 6,
    requiresDigitalRecordKeeping: false,
    vatRates: {
      standard: 23,
      reduced: 13.5,
      zero: 0
    },
    regulatoryBody: 'Revenue',
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: '.',
      thousand: ',',
      precision: 2
    }
  }
};

export class RegionalComplianceService {
  private config: RegionalConfig;

  constructor(private region: Region) {
    this.config = REGIONAL_CONFIGS[region];
  }

  /**
   * Gets the regional configuration
   */
  getConfig(): RegionalConfig {
    return this.config;
  }

  /**
   * Checks if VAT registration is required based on turnover
   */
  isVATRegistrationRequired(annualTurnover: number): boolean {
    return annualTurnover >= this.config.vatThreshold;
  }

  /**
   * Checks if statutory audit is required based on turnover
   */
  isStatutoryAuditRequired(annualTurnover: number): boolean {
    return annualTurnover >= this.config.auditThreshold;
  }

  /**
   * Gets the record retention period in years
   */
  getRecordRetentionPeriod(): number {
    return this.config.recordRetentionYears;
  }

  /**
   * Checks if digital record keeping is required
   */
  requiresDigitalRecordKeeping(): boolean {
    return this.config.requiresDigitalRecordKeeping;
  }

  /**
   * Gets the VAT rate for a given type
   */
  getVATRate(type: 'standard' | 'reduced' | 'zero'): number {
    return this.config.vatRates[type];
  }

  /**
   * Gets the regulatory body
   */
  getRegulatoryBody(): string {
    return this.config.regulatoryBody;
  }

  /**
   * Formats a currency amount according to regional settings
   */
  formatCurrency(amount: number): string {
    const formatter = new Intl.NumberFormat(this.region === 'IRL' ? 'en-IE' : 'en-GB', {
      style: 'currency',
      currency: this.config.currency,
      minimumFractionDigits: this.config.numberFormat.precision,
      maximumFractionDigits: this.config.numberFormat.precision
    });

    return formatter.format(amount);
  }

  /**
   * Formats a date according to regional settings
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat(this.region === 'IRL' ? 'en-IE' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  /**
   * Formats a number according to regional settings
   */
  formatNumber(number: number): string {
    const formatter = new Intl.NumberFormat(this.region === 'IRL' ? 'en-IE' : 'en-GB', {
      minimumFractionDigits: this.config.numberFormat.precision,
      maximumFractionDigits: this.config.numberFormat.precision,
      useGrouping: true
    });

    return formatter.format(number);
  }

  /**
   * Validates a VAT return period
   */
  validateVATReturnPeriod(startDate: Date, endDate: Date): boolean {
    // Check if the period is valid (e.g., quarterly, monthly)
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());

    // Allow monthly or quarterly returns
    return months === 1 || months === 3;
  }

  /**
   * Gets the next VAT return due date
   */
  getNextVATReturnDueDate(periodEndDate: Date): Date {
    // VAT returns are typically due one month and seven days after the period end
    const dueDate = new Date(periodEndDate);
    dueDate.setMonth(dueDate.getMonth() + 1);
    dueDate.setDate(dueDate.getDate() + 7);
    return dueDate;
  }

  /**
   * Validates a journal entry based on regional requirements
   */
  validateJournalEntry(entry: {
    date: Date;
    totalDebit: number;
    totalCredit: number;
    lines: Array<{ vatAmount?: number; vatRate?: number }>;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if the entry date is within the allowed range
    const today = new Date();
    const maxPastDate = new Date();
    maxPastDate.setFullYear(today.getFullYear() - this.config.recordRetentionYears);

    if (entry.date < maxPastDate) {
      errors.push(`Journal entries cannot be dated more than ${this.config.recordRetentionYears} years in the past`);
    }

    // Check if debits equal credits
    if (Math.abs(entry.totalDebit - entry.totalCredit) > 0.01) {
      errors.push('Total debits must equal total credits');
    }

    // Validate VAT calculations if applicable
    entry.lines.forEach((line, index) => {
      if (line.vatAmount && line.vatRate) {
        const expectedVAT = (line.vatAmount * line.vatRate) / 100;
        if (Math.abs(line.vatAmount - expectedVAT) > 0.01) {
          errors.push(`Invalid VAT amount in line ${index + 1}`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 