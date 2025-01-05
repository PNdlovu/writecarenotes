import { prisma } from '@/lib/prisma';
import { Payment, PaymentMethod, PaymentStatus } from './types';
import { TenantContext } from '@/lib/tenant/TenantContext';
import { InvoicingService } from './invoicing';

export class PaymentService {
  private tenantContext: TenantContext;
  private invoicingService: InvoicingService;

  constructor(tenantContext: TenantContext) {
    this.tenantContext = tenantContext;
    this.invoicingService = new InvoicingService(tenantContext);
  }

  async processPayment(data: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
  }): Promise<Payment> {
    const { invoiceId, amount, method, reference } = data;

    // Verify invoice exists and belongs to tenant
    const invoice = await this.invoicingService.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Create payment record
    const payment = await prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.payment.create({
        data: {
          tenantId: this.tenantContext.id,
          invoiceId,
          amount,
          date: new Date(),
          method,
          reference,
          status: PaymentStatus.PENDING
        }
      });

      // Update invoice if payment is successful
      if (payment.status === PaymentStatus.COMPLETED) {
        await this.invoicingService.markAsPaid(invoiceId);
      }

      return payment;
    });

    return payment;
  }

  async getPayment(id: string): Promise<Payment | null> {
    return prisma.payment.findFirst({
      where: {
        id,
        tenantId: this.tenantContext.id
      }
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment> {
    const payment = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: {
          id,
          tenantId: this.tenantContext.id
        },
        data: { status }
      });

      // Update invoice status based on payment status
      if (status === PaymentStatus.COMPLETED) {
        await this.invoicingService.markAsPaid(payment.invoiceId);
      }

      return payment;
    });

    return payment;
  }

  async listPayments(params: {
    invoiceId?: string;
    method?: PaymentMethod;
    status?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ payments: Payment[]; total: number }> {
    const { invoiceId, method, status, startDate, endDate, page = 1, limit = 10 } = params;

    const where = {
      tenantId: this.tenantContext.id,
      ...(invoiceId && { invoiceId }),
      ...(method && { method }),
      ...(status && { status }),
      ...(startDate && endDate && {
        date: {
          gte: startDate,
          lte: endDate
        }
      })
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          date: 'desc'
        }
      }),
      prisma.payment.count({ where })
    ]);

    return { payments, total };
  }

  async refundPayment(id: string, reason: string): Promise<Payment> {
    const payment = await prisma.$transaction(async (tx) => {
      // Get original payment
      const originalPayment = await tx.payment.findFirst({
        where: {
          id,
          tenantId: this.tenantContext.id
        }
      });

      if (!originalPayment) {
        throw new Error('Payment not found');
      }

      // Create refund record
      const refund = await tx.payment.create({
        data: {
          tenantId: this.tenantContext.id,
          invoiceId: originalPayment.invoiceId,
          amount: -originalPayment.amount,
          date: new Date(),
          method: originalPayment.method,
          reference: `Refund for ${originalPayment.id}: ${reason}`,
          status: PaymentStatus.COMPLETED
        }
      });

      // Update original payment status
      await tx.payment.update({
        where: { id },
        data: { status: PaymentStatus.REFUNDED }
      });

      return refund;
    });

    return payment;
  }

  async getPaymentReconciliation(startDate: Date, endDate: Date): Promise<{
    totalReceived: number;
    totalRefunded: number;
    netAmount: number;
    paymentsByMethod: Record<PaymentMethod, number>;
  }> {
    const payments = await prisma.payment.findMany({
      where: {
        tenantId: this.tenantContext.id,
        date: {
          gte: startDate,
          lte: endDate
        },
        status: PaymentStatus.COMPLETED
      }
    });

    const totalReceived = payments
      .filter(p => p.amount > 0)
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRefunded = Math.abs(
      payments
        .filter(p => p.amount < 0)
        .reduce((sum, p) => sum + p.amount, 0)
    );

    const netAmount = totalReceived - totalRefunded;

    const paymentsByMethod = payments.reduce((acc, payment) => {
      if (!acc[payment.method]) {
        acc[payment.method] = 0;
      }
      acc[payment.method] += payment.amount;
      return acc;
    }, {} as Record<PaymentMethod, number>);

    return {
      totalReceived,
      totalRefunded,
      netAmount,
      paymentsByMethod
    };
  }
}


