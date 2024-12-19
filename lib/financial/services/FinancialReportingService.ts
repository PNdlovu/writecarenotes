import { PrismaClient, Prisma } from '@prisma/client';
import { FinancialError } from '../utils/errors';

export interface FinancialSummary {
  totalRoomRate: number;
  totalCarePackageRate: number;
  totalFunding: number;
  totalResidentContribution: number;
  fundingBreakdown: {
    type: string;
    amount: number;
    count: number;
  }[];
}

export interface ResidentStatement {
  residentId: string;
  period: {
    start: Date;
    end: Date;
  };
  charges: {
    type: string;
    description: string;
    amount: number;
    date: Date;
  }[];
  funding: {
    source: string;
    amount: number;
    period: string;
  }[];
  totalCharges: number;
  totalFunding: number;
  balance: number;
}

export class FinancialReportingService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Generate a financial summary for a specific tenant
   */
  async generateFinancialSummary(
    tenantId: string,
    date: Date = new Date()
  ): Promise<FinancialSummary> {
    try {
      // Get all active resident financials
      const residents = await this.prisma.residentFinancial.findMany({
        where: {
          tenantId,
        },
        include: {
          fundingSources: {
            where: {
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
            include: {
              fundingSource: true,
            },
          },
        },
      });

      // Calculate totals
      const summary: FinancialSummary = {
        totalRoomRate: 0,
        totalCarePackageRate: 0,
        totalFunding: 0,
        totalResidentContribution: 0,
        fundingBreakdown: [],
      };

      const fundingMap = new Map<string, { amount: number; count: number }>();

      residents.forEach((resident) => {
        summary.totalRoomRate += Number(resident.roomRate);
        summary.totalCarePackageRate += Number(resident.carePackageRate);

        const residentFunding = resident.fundingSources.reduce(
          (total, funding) => total + Number(funding.weeklyAmount),
          0
        );

        summary.totalFunding += residentFunding;

        // Calculate resident contribution
        const totalCost =
          Number(resident.roomRate) + Number(resident.carePackageRate);
        summary.totalResidentContribution += Math.max(
          0,
          totalCost - residentFunding
        );

        // Build funding breakdown
        resident.fundingSources.forEach((funding) => {
          const type = funding.fundingSource.type;
          const current = fundingMap.get(type) || { amount: 0, count: 0 };
          fundingMap.set(type, {
            amount: current.amount + Number(funding.weeklyAmount),
            count: current.count + 1,
          });
        });
      });

      // Convert funding map to array
      summary.fundingBreakdown = Array.from(fundingMap.entries()).map(
        ([type, data]) => ({
          type,
          amount: data.amount,
          count: data.count,
        })
      );

      return summary;
    } catch (error) {
      throw new FinancialError(
        'Failed to generate financial summary',
        'FINANCIAL_SUMMARY_GENERATION_FAILED',
        error
      );
    }
  }

  /**
   * Generate a resident statement for a specific period
   */
  async generateResidentStatement(
    residentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ResidentStatement> {
    try {
      const resident = await this.prisma.residentFinancial.findUnique({
        where: { residentId },
        include: {
          fundingSources: {
            include: {
              fundingSource: true,
            },
          },
        },
      });

      if (!resident) {
        throw new Error('Resident not found');
      }

      // Initialize statement
      const statement: ResidentStatement = {
        residentId,
        period: {
          start: startDate,
          end: endDate,
        },
        charges: [],
        funding: [],
        totalCharges: 0,
        totalFunding: 0,
        balance: 0,
      };

      // Add room rate charges
      const weeks = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );

      statement.charges.push({
        type: 'ROOM_RATE',
        description: 'Weekly Room Rate',
        amount: Number(resident.roomRate) * weeks,
        date: startDate,
      });

      statement.charges.push({
        type: 'CARE_PACKAGE',
        description: 'Care Package Rate',
        amount: Number(resident.carePackageRate) * weeks,
        date: startDate,
      });

      // Calculate funding for the period
      resident.fundingSources.forEach((funding) => {
        if (
          funding.startDate <= endDate &&
          (!funding.endDate || funding.endDate >= startDate)
        ) {
          statement.funding.push({
            source: funding.fundingSource.type,
            amount: Number(funding.weeklyAmount) * weeks,
            period: 'Weekly',
          });
        }
      });

      // Calculate totals
      statement.totalCharges = statement.charges.reduce(
        (total, charge) => total + charge.amount,
        0
      );
      statement.totalFunding = statement.funding.reduce(
        (total, funding) => total + funding.amount,
        0
      );
      statement.balance = statement.totalCharges - statement.totalFunding;

      return statement;
    } catch (error) {
      throw new FinancialError(
        'Failed to generate resident statement',
        'RESIDENT_STATEMENT_GENERATION_FAILED',
        error
      );
    }
  }

  /**
   * Generate funding forecast for the next period
   */
  async generateFundingForecast(
    tenantId: string,
    months: number = 12
  ): Promise<{
    monthly: { date: Date; amount: number }[];
    total: number;
  }> {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);

      const residents = await this.prisma.residentFinancial.findMany({
        where: {
          tenantId,
        },
        include: {
          fundingSources: {
            where: {
              OR: [
                { endDate: null },
                { endDate: { gte: startDate } },
              ],
            },
            include: {
              fundingSource: true,
            },
          },
        },
      });

      const monthlyForecast: { date: Date; amount: number }[] = [];
      let totalForecast = 0;

      for (let i = 0; i < months; i++) {
        const monthDate = new Date(startDate);
        monthDate.setMonth(monthDate.getMonth() + i);

        let monthlyAmount = 0;

        residents.forEach((resident) => {
          const totalCost =
            Number(resident.roomRate) + Number(resident.carePackageRate);

          const fundingAmount = resident.fundingSources.reduce(
            (total, funding) => {
              if (
                (!funding.endDate || funding.endDate >= monthDate) &&
                funding.startDate <= monthDate
              ) {
                return total + Number(funding.weeklyAmount);
              }
              return total;
            },
            0
          );

          monthlyAmount += totalCost - Math.min(totalCost, fundingAmount);
        });

        monthlyForecast.push({
          date: monthDate,
          amount: monthlyAmount * 4.33, // Average weeks per month
        });

        totalForecast += monthlyAmount * 4.33;
      }

      return {
        monthly: monthlyForecast,
        total: totalForecast,
      };
    } catch (error) {
      throw new FinancialError(
        'Failed to generate funding forecast',
        'FUNDING_FORECAST_GENERATION_FAILED',
        error
      );
    }
  }
}
