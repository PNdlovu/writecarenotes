import { prisma } from '@/lib/prisma';
import { Logger } from '@/lib/logger';
import { PaymentTransaction, PaymentMethod, PaymentStatus } from '@prisma/client';
import { 
  CreatePaymentTransactionInput,
  UpdatePaymentTransactionInput,
  PaymentTransactionFilters
} from '../types/financial.types';

export class FinancialRepository {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('financial-repository');
  }

  async createPaymentTransaction(
    input: CreatePaymentTransactionInput
  ): Promise<PaymentTransaction> {
    try {
      return await prisma.paymentTransaction.create({
        data: {
          amount: input.amount,
          currency: input.currency,
          status: input.status || PaymentStatus.PENDING,
          paymentMethod: input.paymentMethod,
          description: input.description,
          metadata: input.metadata,
          organizationId: input.organizationId,
          careHomeId: input.careHomeId,
          residentId: input.residentId,
          externalReference: input.externalReference,
          dueDate: input.dueDate,
          processingFee: input.processingFee,
          refundable: input.refundable ?? true,
          createdBy: input.createdBy
        }
      });
    } catch (error) {
      this.logger.error('Failed to create payment transaction', { error, input });
      throw error;
    }
  }

  async updatePaymentTransaction(
    id: string,
    input: UpdatePaymentTransactionInput
  ): Promise<PaymentTransaction> {
    try {
      return await prisma.paymentTransaction.update({
        where: { id },
        data: {
          status: input.status,
          metadata: input.metadata,
          processingFee: input.processingFee,
          refundedAmount: input.refundedAmount,
          refundReason: input.refundReason,
          completedAt: input.completedAt,
          updatedBy: input.updatedBy
        }
      });
    } catch (error) {
      this.logger.error('Failed to update payment transaction', { error, id, input });
      throw error;
    }
  }

  async getPaymentTransaction(id: string): Promise<PaymentTransaction | null> {
    try {
      return await prisma.paymentTransaction.findUnique({
        where: { id }
      });
    } catch (error) {
      this.logger.error('Failed to get payment transaction', { error, id });
      throw error;
    }
  }

  async getPaymentTransactions(
    filters: PaymentTransactionFilters
  ): Promise<PaymentTransaction[]> {
    try {
      const where: any = {};

      if (filters.organizationId) {
        where.organizationId = filters.organizationId;
      }

      if (filters.careHomeId) {
        where.careHomeId = filters.careHomeId;
      }

      if (filters.residentId) {
        where.residentId = filters.residentId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.paymentMethod) {
        where.paymentMethod = filters.paymentMethod;
      }

      if (filters.startDate && filters.endDate) {
        where.createdAt = {
          gte: filters.startDate,
          lte: filters.endDate
        };
      }

      return await prisma.paymentTransaction.findMany({
        where,
        orderBy: {
          createdAt: filters.orderBy || 'desc'
        },
        take: filters.limit,
        skip: filters.offset
      });
    } catch (error) {
      this.logger.error('Failed to get payment transactions', { error, filters });
      throw error;
    }
  }

  async getPaymentMethodStats(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ method: PaymentMethod; count: number; totalAmount: number }[]> {
    try {
      const stats = await prisma.paymentTransaction.groupBy({
        by: ['paymentMethod'],
        where: {
          organizationId,
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          status: PaymentStatus.COMPLETED
        },
        _count: {
          paymentMethod: true
        },
        _sum: {
          amount: true
        }
      });

      return stats.map(stat => ({
        method: stat.paymentMethod,
        count: stat._count.paymentMethod,
        totalAmount: stat._sum.amount || 0
      }));
    } catch (error) {
      this.logger.error('Failed to get payment method stats', { 
        error, 
        organizationId, 
        startDate, 
        endDate 
      });
      throw error;
    }
  }

  async getUnpaidTransactions(
    organizationId: string,
    daysOverdue?: number
  ): Promise<PaymentTransaction[]> {
    try {
      const where: any = {
        organizationId,
        status: PaymentStatus.PENDING,
        dueDate: {
          lt: new Date()
        }
      };

      if (daysOverdue) {
        where.dueDate = {
          lt: new Date(Date.now() - daysOverdue * 24 * 60 * 60 * 1000)
        };
      }

      return await prisma.paymentTransaction.findMany({
        where,
        orderBy: {
          dueDate: 'asc'
        }
      });
    } catch (error) {
      this.logger.error('Failed to get unpaid transactions', { 
        error, 
        organizationId, 
        daysOverdue 
      });
      throw error;
    }
  }

  async deletePaymentTransaction(id: string): Promise<void> {
    try {
      await prisma.paymentTransaction.delete({
        where: { id }
      });
    } catch (error) {
      this.logger.error('Failed to delete payment transaction', { error, id });
      throw error;
    }
  }
}


