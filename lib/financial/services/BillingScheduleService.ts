import { PrismaClient } from '@prisma/client';
import {
  BillingSchedule,
  BillingScheduleType,
  BillingFrequency
} from '../types/care';
import { FinancialError } from '../utils/errors';

export class BillingScheduleService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new billing schedule
   */
  async createSchedule(
    tenantId: string,
    data: Omit<BillingSchedule, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
  ): Promise<BillingSchedule> {
    try {
      // Validate schedule parameters based on frequency
      this.validateScheduleParameters(data.frequency, data.dayOfMonth, data.dayOfWeek);

      return await this.prisma.billingSchedule.create({
        data: {
          tenantId,
          ...data,
        },
      });
    } catch (error) {
      throw new FinancialError(
        'Failed to create billing schedule',
        'FUNDING_SOURCE_ADD_FAILED',
        error
      );
    }
  }

  /**
   * Update a billing schedule
   */
  async updateSchedule(
    id: string,
    data: Partial<Omit<BillingSchedule, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>
  ): Promise<BillingSchedule> {
    try {
      if (data.frequency) {
        this.validateScheduleParameters(
          data.frequency,
          data.dayOfMonth,
          data.dayOfWeek
        );
      }

      return await this.prisma.billingSchedule.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new FinancialError(
        'Failed to update billing schedule',
        'FUNDING_SOURCE_UPDATE_FAILED',
        error
      );
    }
  }

  /**
   * Get all billing schedules for a resident
   */
  async getResidentSchedules(residentId: string): Promise<BillingSchedule[]> {
    try {
      return await this.prisma.billingSchedule.findMany({
        where: {
          residentId,
          isActive: true,
        },
        orderBy: {
          nextRun: 'asc',
        },
      });
    } catch (error) {
      throw new FinancialError(
        'Failed to get resident billing schedules',
        'RESIDENT_FINANCIAL_FETCH_FAILED',
        error
      );
    }
  }

  /**
   * Get all schedules due for processing
   */
  async getDueSchedules(date: Date = new Date()): Promise<BillingSchedule[]> {
    try {
      return await this.prisma.billingSchedule.findMany({
        where: {
          isActive: true,
          nextRun: {
            lte: date,
          },
        },
        orderBy: {
          nextRun: 'asc',
        },
      });
    } catch (error) {
      throw new FinancialError(
        'Failed to get due billing schedules',
        'RESIDENT_FINANCIAL_FETCH_FAILED',
        error
      );
    }
  }

  /**
   * Calculate the next run date for a schedule
   */
  calculateNextRunDate(
    frequency: BillingFrequency,
    dayOfMonth?: number,
    dayOfWeek?: number,
    baseDate: Date = new Date()
  ): Date {
    const nextDate = new Date(baseDate);

    switch (frequency) {
      case 'WEEKLY':
        if (dayOfWeek === undefined) throw new Error('Day of week required for weekly schedule');
        const currentDay = nextDate.getDay();
        const daysToAdd = (dayOfWeek - currentDay + 7) % 7;
        nextDate.setDate(nextDate.getDate() + daysToAdd);
        break;

      case 'MONTHLY':
        if (dayOfMonth === undefined) throw new Error('Day of month required for monthly schedule');
        nextDate.setDate(1); // Move to first of month
        nextDate.setMonth(nextDate.getMonth() + 1); // Move to next month
        nextDate.setDate(Math.min(dayOfMonth, this.getDaysInMonth(nextDate))); // Set to specified day
        break;

      case 'QUARTERLY':
        if (dayOfMonth === undefined) throw new Error('Day of month required for quarterly schedule');
        nextDate.setDate(1); // Move to first of month
        nextDate.setMonth(nextDate.getMonth() + 3); // Move ahead 3 months
        nextDate.setDate(Math.min(dayOfMonth, this.getDaysInMonth(nextDate))); // Set to specified day
        break;

      case 'ANNUALLY':
        if (dayOfMonth === undefined) throw new Error('Day of month required for annual schedule');
        nextDate.setDate(1); // Move to first of month
        nextDate.setFullYear(nextDate.getFullYear() + 1); // Move to next year
        nextDate.setDate(Math.min(dayOfMonth, this.getDaysInMonth(nextDate))); // Set to specified day
        break;

      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }

    return nextDate;
  }

  /**
   * Update the next run date for a schedule
   */
  async updateNextRunDate(id: string): Promise<BillingSchedule> {
    try {
      const schedule = await this.prisma.billingSchedule.findUnique({
        where: { id },
      });

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      const nextRun = this.calculateNextRunDate(
        schedule.frequency,
        schedule.dayOfMonth ?? undefined,
        schedule.dayOfWeek ?? undefined
      );

      return await this.prisma.billingSchedule.update({
        where: { id },
        data: {
          lastRun: new Date(),
          nextRun,
        },
      });
    } catch (error) {
      throw new FinancialError(
        'Failed to update next run date',
        'FUNDING_SOURCE_UPDATE_FAILED',
        error
      );
    }
  }

  private validateScheduleParameters(
    frequency: BillingFrequency,
    dayOfMonth?: number | null,
    dayOfWeek?: number | null
  ): void {
    switch (frequency) {
      case 'WEEKLY':
        if (dayOfWeek === undefined || dayOfWeek === null) {
          throw new Error('Day of week is required for weekly schedules');
        }
        if (dayOfWeek < 0 || dayOfWeek > 6) {
          throw new Error('Day of week must be between 0 and 6');
        }
        break;

      case 'MONTHLY':
      case 'QUARTERLY':
      case 'ANNUALLY':
        if (dayOfMonth === undefined || dayOfMonth === null) {
          throw new Error(`Day of month is required for ${frequency.toLowerCase()} schedules`);
        }
        if (dayOfMonth < 1 || dayOfMonth > 31) {
          throw new Error('Day of month must be between 1 and 31');
        }
        break;
    }
  }

  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }
}
