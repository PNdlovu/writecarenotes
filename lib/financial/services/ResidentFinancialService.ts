import { PrismaClient, Prisma } from '@prisma/client';
import {
  ResidentFinancial,
  ResidentFunding,
  FundingSource,
  PaymentMethod,
  FundingSourceType
} from '../types/care';
import { FinancialError } from '../utils/errors';

export class ResidentFinancialService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create or update a resident's financial profile
   */
  async upsertFinancialProfile(
    tenantId: string,
    data: Omit<ResidentFinancial, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
  ): Promise<ResidentFinancial> {
    try {
      return await this.prisma.residentFinancial.upsert({
        where: {
          residentId: data.residentId,
        },
        update: {
          primaryContact: data.primaryContact,
          billingAddress: data.billingAddress as Prisma.JsonValue,
          roomRate: data.roomRate,
          carePackageRate: data.carePackageRate,
          additionalServices: data.additionalServices,
          paymentMethod: data.paymentMethod,
          paymentDetails: data.paymentDetails,
          billingDay: data.billingDay,
          lastBillingDate: data.lastBillingDate,
        },
        create: {
          tenantId,
          ...data,
        },
      });
    } catch (error) {
      throw new FinancialError(
        'Failed to update resident financial profile',
        'RESIDENT_FINANCIAL_UPDATE_FAILED',
        error
      );
    }
  }

  /**
   * Add a funding source for a resident
   */
  async addFundingSource(
    tenantId: string,
    data: Omit<ResidentFunding, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
  ): Promise<ResidentFunding> {
    try {
      // Check for overlapping funding periods
      const overlapping = await this.prisma.residentFunding.findFirst({
        where: {
          residentId: data.residentId,
          fundingSourceId: data.fundingSourceId,
          OR: [
            {
              startDate: {
                lte: data.startDate,
              },
              endDate: {
                gte: data.startDate,
              },
            },
            {
              startDate: {
                lte: data.endDate,
              },
              endDate: {
                gte: data.endDate,
              },
            },
          ],
        },
      });

      if (overlapping) {
        throw new FinancialError(
          'Overlapping funding period exists',
          'FUNDING_PERIOD_OVERLAP'
        );
      }

      return await this.prisma.residentFunding.create({
        data: {
          tenantId,
          ...data,
        },
      });
    } catch (error) {
      if (error instanceof FinancialError) throw error;
      throw new FinancialError(
        'Failed to add funding source',
        'FUNDING_SOURCE_ADD_FAILED',
        error
      );
    }
  }

  /**
   * Update a resident's funding source
   */
  async updateFundingSource(
    id: string,
    data: Partial<Omit<ResidentFunding, 'id' | 'tenantId' | 'residentId' | 'createdAt' | 'updatedAt'>>
  ): Promise<ResidentFunding> {
    try {
      return await this.prisma.residentFunding.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new FinancialError(
        'Failed to update funding source',
        'FUNDING_SOURCE_UPDATE_FAILED',
        error
      );
    }
  }

  /**
   * Get a resident's financial profile with funding sources
   */
  async getFinancialProfile(residentId: string): Promise<ResidentFinancial & { fundingSources: ResidentFunding[] }> {
    try {
      const profile = await this.prisma.residentFinancial.findUnique({
        where: { residentId },
        include: {
          fundingSources: {
            include: {
              fundingSource: true,
            },
          },
        },
      });

      if (!profile) {
        throw new FinancialError(
          'Resident financial profile not found',
          'RESIDENT_FINANCIAL_NOT_FOUND'
        );
      }

      return profile;
    } catch (error) {
      if (error instanceof FinancialError) throw error;
      throw new FinancialError(
        'Failed to get resident financial profile',
        'RESIDENT_FINANCIAL_FETCH_FAILED',
        error
      );
    }
  }

  /**
   * Calculate total weekly funding amount
   */
  async calculateWeeklyFunding(residentId: string, date: Date = new Date()): Promise<number> {
    try {
      const activeFunding = await this.prisma.residentFunding.findMany({
        where: {
          residentId,
          startDate: {
            lte: date,
          },
          OR: [
            {
              endDate: null,
            },
            {
              endDate: {
                gte: date,
              },
            },
          ],
        },
      });

      return activeFunding.reduce(
        (total, funding) => total + Number(funding.weeklyAmount),
        0
      );
    } catch (error) {
      throw new FinancialError(
        'Failed to calculate weekly funding',
        'FUNDING_CALCULATION_FAILED',
        error
      );
    }
  }

  /**
   * Calculate resident contribution
   */
  async calculateResidentContribution(
    residentId: string,
    date: Date = new Date()
  ): Promise<number> {
    try {
      const profile = await this.getFinancialProfile(residentId);
      const totalCost =
        Number(profile.roomRate) + Number(profile.carePackageRate);
      const totalFunding = await this.calculateWeeklyFunding(residentId, date);

      return Math.max(0, totalCost - totalFunding);
    } catch (error) {
      throw new FinancialError(
        'Failed to calculate resident contribution',
        'CONTRIBUTION_CALCULATION_FAILED',
        error
      );
    }
  }

  /**
   * Get funding source history
   */
  async getFundingHistory(
    residentId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ResidentFunding[]> {
    try {
      return await this.prisma.residentFunding.findMany({
        where: {
          residentId,
          ...(startDate && {
            startDate: {
              gte: startDate,
            },
          }),
          ...(endDate && {
            endDate: {
              lte: endDate,
            },
          }),
        },
        include: {
          fundingSource: true,
        },
        orderBy: {
          startDate: 'desc',
        },
      });
    } catch (error) {
      throw new FinancialError(
        'Failed to get funding history',
        'FUNDING_HISTORY_FETCH_FAILED',
        error
      );
    }
  }

  /**
   * Validate payment details based on payment method
   */
  validatePaymentDetails(method: PaymentMethod, details: any): boolean {
    switch (method) {
      case 'DIRECT_DEBIT':
        return (
          details?.accountName &&
          details?.accountNumber &&
          details?.sortCode
        );
      case 'SEPA_DIRECT_DEBIT':
        return (
          details?.accountName &&
          details?.iban &&
          details?.bic
        );
      case 'CARD_PAYMENT':
        return (
          details?.cardType &&
          details?.lastFourDigits &&
          details?.expiryMonth &&
          details?.expiryYear
        );
      default:
        return true;
    }
  }
}
