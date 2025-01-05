import { Region } from '@/lib/types';
import { TenantContext } from '@/lib/tenant/TenantContext';
import { getRegionalConfig, TaxConfig } from '../config/regions';
import { prisma } from '@/lib/prisma';
import { Transaction } from '../types';

export class TaxService {
  private tenantContext: TenantContext;
  private taxConfig: TaxConfig[];

  constructor(tenantContext: TenantContext) {
    this.tenantContext = tenantContext;
    this.taxConfig = getRegionalConfig(tenantContext.region as Region).taxes;
  }

  async calculateTransactionTax(transaction: Transaction): Promise<{
    [key: string]: {
      amount: number;
      rate: number;
      basis: number;
    };
  }> {
    const result: {
      [key: string]: {
        amount: number;
        rate: number;
        basis: number;
      };
    } = {};

    for (const tax of this.taxConfig) {
      if (await this.isTransactionTaxable(transaction, tax)) {
        const basis = await this.calculateTaxBasis(transaction, tax);
        const amount = (basis * tax.rate) / 100;

        result[tax.code] = {
          amount,
          rate: tax.rate,
          basis
        };
      }
    }

    return result;
  }

  private async isTransactionTaxable(
    transaction: Transaction,
    tax: TaxConfig
  ): Promise<boolean> {
    // Check exemptions
    if (tax.rules?.exemptions) {
      const serviceType = await this.getTransactionServiceType(transaction);
      if (tax.rules.exemptions.includes(serviceType)) {
        return false;
      }
    }

    // Check threshold
    if (tax.rules?.threshold) {
      const annualRevenue = await this.calculateAnnualRevenue();
      if (annualRevenue < tax.rules.threshold) {
        return false;
      }
    }

    return true;
  }

  private async getTransactionServiceType(
    transaction: Transaction
  ): Promise<string> {
    // Implement logic to determine service type
    return 'care-services'; // Simplified for example
  }

  private async calculateAnnualRevenue(): Promise<number> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const revenue = await prisma.transaction.aggregate({
      where: {
        tenantId: this.tenantContext.id,
        date: {
          gte: oneYearAgo
        },
        type: 'REVENUE'
      },
      _sum: {
        amount: true
      }
    });

    return revenue._sum.amount || 0;
  }

  private async calculateTaxBasis(
    transaction: Transaction,
    tax: TaxConfig
  ): Promise<number> {
    // Implement tax basis calculation logic
    return transaction.amount || 0; // Simplified for example
  }

  async generateTaxReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    period: { startDate: Date; endDate: Date };
    taxes: {
      [key: string]: {
        taxableAmount: number;
        taxAmount: number;
        transactions: number;
      };
    };
    summary: {
      totalTaxable: number;
      totalTax: number;
      totalTransactions: number;
    };
  }> {
    const transactions = await prisma.transaction.findMany({
      where: {
        tenantId: this.tenantContext.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const report = {
      period: { startDate, endDate },
      taxes: {},
      summary: {
        totalTaxable: 0,
        totalTax: 0,
        totalTransactions: transactions.length
      }
    };

    for (const transaction of transactions) {
      const taxCalculations = await this.calculateTransactionTax(transaction);

      for (const [taxCode, calculation] of Object.entries(taxCalculations)) {
        if (!report.taxes[taxCode]) {
          report.taxes[taxCode] = {
            taxableAmount: 0,
            taxAmount: 0,
            transactions: 0
          };
        }

        report.taxes[taxCode].taxableAmount += calculation.basis;
        report.taxes[taxCode].taxAmount += calculation.amount;
        report.taxes[taxCode].transactions += 1;

        report.summary.totalTaxable += calculation.basis;
        report.summary.totalTax += calculation.amount;
      }
    }

    return report;
  }

  async validateTaxSettings(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Validate tax registration
    const taxRegistration = await prisma.taxRegistration.findFirst({
      where: {
        tenantId: this.tenantContext.id
      }
    });

    if (!taxRegistration) {
      issues.push('Tax registration information missing');
    }

    // Validate tax rates
    for (const tax of this.taxConfig) {
      const configuredRate = await prisma.taxRate.findFirst({
        where: {
          tenantId: this.tenantContext.id,
          code: tax.code
        }
      });

      if (!configuredRate) {
        issues.push(`Tax rate not configured for ${tax.name}`);
      } else if (configuredRate.rate !== tax.rate) {
        issues.push(`Incorrect tax rate configured for ${tax.name}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}


