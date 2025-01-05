/**
 * @fileoverview Payment Service for financial operations
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';
import { metrics } from '@/lib/metrics';

export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'DIRECT_DEBIT' | 'CASH';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface PaymentDetails {
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference: string;
  description?: string;
  metadata?: Record<string, any>;
}

export class PaymentService {
  private static instance: PaymentService;

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async createPayment(
    organizationId: string,
    details: PaymentDetails
  ) {
    try {
      const payment = await prisma.payment.create({
        data: {
          organizationId,
          amount: details.amount,
          currency: details.currency,
          method: details.method,
          reference: details.reference,
          description: details.description,
          metadata: details.metadata,
          status: 'PENDING'
        }
      });

      metrics.increment('payment.create.success', 1, {
        method: details.method,
        currency: details.currency
      });

      return payment;
    } catch (error) {
      metrics.increment('payment.create.error');
      throw error;
    }
  }

  async processPayment(id: string, organizationId: string) {
    try {
      const payment = await prisma.payment.update({
        where: {
          id,
          organizationId
        },
        data: {
          status: 'PROCESSING',
          processedAt: new Date()
        }
      });

      // TODO: Integrate with actual payment gateway
      // This is a placeholder for payment processing logic
      const success = Math.random() > 0.1; // 90% success rate for demo

      if (success) {
        await this.completePayment(id, organizationId);
      } else {
        await this.failPayment(id, organizationId, 'Payment processing failed');
      }

      return payment;
    } catch (error) {
      metrics.increment('payment.process.error');
      throw error;
    }
  }

  async completePayment(id: string, organizationId: string) {
    try {
      const payment = await prisma.payment.update({
        where: {
          id,
          organizationId
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      metrics.increment('payment.complete.success');
      return payment;
    } catch (error) {
      metrics.increment('payment.complete.error');
      throw error;
    }
  }

  async failPayment(id: string, organizationId: string, reason: string) {
    try {
      const payment = await prisma.payment.update({
        where: {
          id,
          organizationId
        },
        data: {
          status: 'FAILED',
          failureReason: reason,
          failedAt: new Date()
        }
      });

      metrics.increment('payment.fail');
      return payment;
    } catch (error) {
      metrics.increment('payment.fail.error');
      throw error;
    }
  }

  async refundPayment(id: string, organizationId: string, reason: string) {
    try {
      const payment = await prisma.payment.update({
        where: {
          id,
          organizationId,
          status: 'COMPLETED'
        },
        data: {
          status: 'REFUNDED',
          refundReason: reason,
          refundedAt: new Date()
        }
      });

      metrics.increment('payment.refund.success');
      return payment;
    } catch (error) {
      metrics.increment('payment.refund.error');
      throw error;
    }
  }

  async getPaymentHistory(
    organizationId: string,
    filters?: {
      status?: PaymentStatus;
      method?: PaymentMethod;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    return prisma.payment.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.method && { method: filters.method }),
        ...(filters?.startDate && {
          createdAt: {
            gte: filters.startDate
          }
        }),
        ...(filters?.endDate && {
          createdAt: {
            lte: filters.endDate
          }
        })
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
} 