import { Payment, PaymentMethod, PaymentStatus } from '../types';
import { FinancialDB } from '../db';

export class PaymentService {
  private gatewayConfig: { provider: string; apiKey: string } | null = null;

  constructor(private db: FinancialDB) {}

  async configureGateway(provider: string, apiKey: string): Promise<void> {
    this.gatewayConfig = { provider, apiKey };
  }

  async processPayment(data: Omit<Payment, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    // Create initial payment record
    let payment = await this.db.createPayment({
      ...data,
      status: PaymentStatus.PENDING
    });

    // Simulate payment processing
    try {
      if (this.gatewayConfig) {
        // In a real implementation, this would integrate with the payment gateway
        await this.simulatePaymentProcessing(payment);
      }

      payment = await this.updatePaymentStatus(payment.id, PaymentStatus.COMPLETED);
    } catch (error) {
      payment = await this.updatePaymentStatus(payment.id, PaymentStatus.FAILED);
      payment = await this.db.updatePayment(payment.id, {
        metadata: { error: error.message }
      });
    }

    return payment;
  }

  private async simulatePaymentProcessing(payment: Payment): Promise<void> {
    // Simulate payment gateway processing
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Simulate success rate
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Payment processing failed'));
        }
      }, 1000);
    });
  }

  async getPayment(id: string): Promise<Payment | null> {
    return this.db.getPayment(id);
  }

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment> {
    return this.db.updatePayment(id, { status });
  }

  async refundPayment(id: string): Promise<Payment> {
    const payment = await this.getPayment(id);
    if (!payment) {
      throw new Error(`Payment not found: ${id}`);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new Error(`Cannot refund payment with status: ${payment.status}`);
    }

    // In a real implementation, this would integrate with the payment gateway
    await this.simulatePaymentProcessing(payment);

    return this.updatePaymentStatus(id, PaymentStatus.REFUNDED);
  }

  async validatePaymentMethod(method: PaymentMethod): Promise<boolean> {
    // Add validation logic based on payment method
    switch (method) {
      case PaymentMethod.DIRECT_DEBIT:
        return !!this.gatewayConfig;
      case PaymentMethod.CARD:
        return !!this.gatewayConfig;
      case PaymentMethod.BANK_TRANSFER:
        return true;
      case PaymentMethod.CASH:
        return true;
      case PaymentMethod.CHECK:
        return true;
      default:
        return false;
    }
  }

  async getPaymentsByStatus(status: PaymentStatus): Promise<Payment[]> {
    return this.db.getPaymentsByStatus(status);
  }
}
