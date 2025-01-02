/**
 * @fileoverview VAT Calculator Service
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';

interface VATRates {
  standard: number;
  reduced: number;
  zero: number;
}

const UK_VAT_RATES: VATRates = {
  standard: 0.20,
  reduced: 0.05,
  zero: 0
};

const IRELAND_VAT_RATES: VATRates = {
  standard: 0.23,
  reduced: 0.135,
  zero: 0
};

export class VATCalculatorService {
  private getVATRates(countryCode: string): VATRates {
    switch (countryCode.toUpperCase()) {
      case 'IE':
        return IRELAND_VAT_RATES;
      case 'GB':
      default:
        return UK_VAT_RATES;
    }
  }

  calculateVAT(amount: number, rate: keyof VATRates, countryCode: string): number {
    const rates = this.getVATRates(countryCode);
    return amount * rates[rate];
  }

  async calculatePeriodVAT(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ) {
    const entries = await prisma.journalEntryLine.findMany({
      where: {
        journalEntry: {
          organizationId,
          date: {
            gte: startDate,
            lte: endDate
          },
          status: 'POSTED'
        }
      },
      include: {
        account: {
          select: {
            vatCode: true
          }
        }
      }
    });

    const vatTotals = {
      output: 0, // VAT charged on sales
      input: 0,  // VAT paid on purchases
      net: 0     // Net VAT due
    };

    entries.forEach(entry => {
      if (entry.account.vatCode) {
        const amount = (entry.debit || 0) - (entry.credit || 0);
        if (amount > 0) {
          vatTotals.input += amount;
        } else {
          vatTotals.output += Math.abs(amount);
        }
      }
    });

    vatTotals.net = vatTotals.output - vatTotals.input;

    return vatTotals;
  }

  async generateVATReturn(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ) {
    const vatTotals = await this.calculatePeriodVAT(
      organizationId,
      startDate,
      endDate
    );

    return prisma.vatReturn.create({
      data: {
        organizationId,
        periodStart: startDate,
        periodEnd: endDate,
        vatDue: vatTotals.net,
        outputVAT: vatTotals.output,
        inputVAT: vatTotals.input,
        status: 'DRAFT'
      }
    });
  }

  async validateVATNumber(vatNumber: string, countryCode: string): Promise<boolean> {
    // TODO: Implement VAT number validation using VIES API
    // This is a placeholder implementation
    const vatRegex = {
      GB: /^GB[0-9]{9}$/,
      IE: /^IE[0-9][A-Z0-9+*][0-9]{5}[A-Z]$/
    };

    return vatRegex[countryCode]?.test(vatNumber) || false;
  }
} 