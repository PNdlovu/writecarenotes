/**
 * @fileoverview Regional Compliance Validation Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Handles regional-specific compliance validation for accounting operations
 */

import { z } from 'zod';

// Regional Configuration Types
export type Region = 'en-GB' | 'cy-GB' | 'gd-GB' | 'ga-IE';

interface RegionalConfig {
  vatRate: number;
  currency: string;
  dateFormat: string;
  regulators: string[];
  complianceRules: ComplianceRules;
}

interface ComplianceRules {
  vatThreshold: number;
  reportingFrequency: 'monthly' | 'quarterly' | 'annual';
  digitalRecordKeeping: boolean;
  retentionPeriod: number; // in months
  requiresAudit: boolean;
  auditThreshold: number;
}

// Regional Configurations
const regionalConfigs: Record<Region, RegionalConfig> = {
  'en-GB': {
    vatRate: 0.20,
    currency: 'GBP',
    dateFormat: 'DD/MM/YYYY',
    regulators: ['HMRC', 'Companies House'],
    complianceRules: {
      vatThreshold: 85000,
      reportingFrequency: 'quarterly',
      digitalRecordKeeping: true, // MTD requirement
      retentionPeriod: 72, // 6 years
      requiresAudit: true,
      auditThreshold: 10200000 // turnover threshold
    }
  },
  'cy-GB': {
    vatRate: 0.20,
    currency: 'GBP',
    dateFormat: 'DD/MM/YYYY',
    regulators: ['HMRC', 'Companies House', 'CIW'],
    complianceRules: {
      vatThreshold: 85000,
      reportingFrequency: 'quarterly',
      digitalRecordKeeping: true,
      retentionPeriod: 72,
      requiresAudit: true,
      auditThreshold: 10200000
    }
  },
  'gd-GB': {
    vatRate: 0.20,
    currency: 'GBP',
    dateFormat: 'DD/MM/YYYY',
    regulators: ['HMRC', 'Companies House', 'Care Inspectorate Scotland'],
    complianceRules: {
      vatThreshold: 85000,
      reportingFrequency: 'quarterly',
      digitalRecordKeeping: true,
      retentionPeriod: 72,
      requiresAudit: true,
      auditThreshold: 10200000
    }
  },
  'ga-IE': {
    vatRate: 0.23,
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    regulators: ['Revenue', 'CRO', 'HIQA'],
    complianceRules: {
      vatThreshold: 75000, // services threshold
      reportingFrequency: 'bi-monthly',
      digitalRecordKeeping: true,
      retentionPeriod: 72, // 6 years
      requiresAudit: true,
      auditThreshold: 12000000 // turnover threshold
    }
  }
};

// Validation Schemas
const VATReturnSchema = z.object({
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  vatDueSales: z.number().min(0),
  vatDueAcquisitions: z.number().min(0),
  totalVatDue: z.number(),
  vatReclaimedCurrPeriod: z.number().min(0),
  netVatDue: z.number(),
  totalValueSalesExVAT: z.number().min(0),
  totalValuePurchasesExVAT: z.number().min(0),
  totalValueGoodsSuppliedExVAT: z.number().min(0),
  totalAcquisitionsExVAT: z.number().min(0)
});

export class RegionalComplianceService {
  private region: Region;
  private config: RegionalConfig;

  constructor(region: Region) {
    this.region = region;
    this.config = regionalConfigs[region];
  }

  /**
   * Validate VAT return based on regional rules
   */
  async validateVATReturn(vatReturn: z.infer<typeof VATReturnSchema>) {
    try {
      // Basic schema validation
      const validated = VATReturnSchema.parse(vatReturn);

      // Regional specific validations
      const errors: string[] = [];

      // Check VAT calculations
      const calculatedTotalVAT = validated.vatDueSales + validated.vatDueAcquisitions;
      if (Math.abs(calculatedTotalVAT - validated.totalVatDue) > 0.01) {
        errors.push('Total VAT due does not match calculations');
      }

      // Check net VAT calculation
      const calculatedNetVAT = validated.totalVatDue - validated.vatReclaimedCurrPeriod;
      if (Math.abs(calculatedNetVAT - validated.netVatDue) > 0.01) {
        errors.push('Net VAT due does not match calculations');
      }

      // Check reporting period
      const periodStart = new Date(validated.period.start);
      const periodEnd = new Date(validated.period.end);
      if (!this.isValidReportingPeriod(periodStart, periodEnd)) {
        errors.push(`Invalid reporting period for ${this.region}`);
      }

      if (errors.length > 0) {
        throw new Error(`VAT return validation failed: ${errors.join(', ')}`);
      }

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid VAT return data: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Check if organization requires VAT registration
   */
  requiresVATRegistration(annualTurnover: number): boolean {
    return annualTurnover >= this.config.complianceRules.vatThreshold;
  }

  /**
   * Check if organization requires statutory audit
   */
  requiresStatutoryAudit(annualTurnover: number): boolean {
    return this.config.complianceRules.requiresAudit && 
           annualTurnover >= this.config.complianceRules.auditThreshold;
  }

  /**
   * Validate reporting period based on regional frequency
   */
  private isValidReportingPeriod(start: Date, end: Date): boolean {
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + 
                      (end.getMonth() - start.getMonth());

    switch (this.config.complianceRules.reportingFrequency) {
      case 'monthly':
        return monthsDiff === 1;
      case 'quarterly':
        return monthsDiff === 3;
      case 'annual':
        return monthsDiff === 12;
      default:
        return false;
    }
  }

  /**
   * Get regional configuration
   */
  getConfig(): RegionalConfig {
    return this.config;
  }

  /**
   * Format currency amount according to regional settings
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat(this.region, {
      style: 'currency',
      currency: this.config.currency
    }).format(amount);
  }

  /**
   * Format date according to regional settings
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat(this.region).format(date);
  }

  /**
   * Get retention period in months
   */
  getRetentionPeriod(): number {
    return this.config.complianceRules.retentionPeriod;
  }

  /**
   * Check if digital record keeping is required
   */
  requiresDigitalRecordKeeping(): boolean {
    return this.config.complianceRules.digitalRecordKeeping;
  }

  /**
   * Get list of regulatory bodies
   */
  getRegulatoryBodies(): string[] {
    return this.config.regulators;
  }
}

// Export singleton instances for each region
export const regionalCompliance = {
  'en-GB': new RegionalComplianceService('en-GB'),
  'cy-GB': new RegionalComplianceService('cy-GB'),
  'gd-GB': new RegionalComplianceService('gd-GB'),
  'ga-IE': new RegionalComplianceService('ga-IE')
}; 