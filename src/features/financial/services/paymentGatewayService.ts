import { PaymentProvider } from '../types/payment.types';
import { FinancialError } from '../utils/errors';
import { encryptData } from '../utils/encryption';
import { Logger } from '@/lib/logger';

export class PaymentGatewayService {
  private logger: Logger;

  constructor(
    private provider: PaymentProvider,
    private apiKey: string,
    private webhookSecret: string
  ) {
    this.logger = new Logger('payment-gateway');
  }

  async processPayment(data: {
    amount: number;
    currency: string;
    paymentMethod: string;
    description: string;
    metadata: Record<string, any>;
  }) {
    try {
      // Encrypt sensitive data
      const encryptedData = encryptData({
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        metadata: data.metadata
      });

      // Process payment through provider
      const result = await this.provider.createPayment({
        ...data,
        idempotencyKey: `${Date.now()}-${Math.random()}`,
        encryptedData
      });

      this.logger.info('Payment processed successfully', {
        amount: data.amount,
        currency: data.currency,
        paymentId: result.id
      });

      return result;
    } catch (error) {
      this.logger.error('Payment processing failed', error);
      throw new FinancialError(
        'Payment processing failed',
        'PAYMENT_PROCESSING_FAILED',
        { error }
      );
    }
  }

  async createSubscription(data: {
    customerId: string;
    planId: string;
    billingCycle: string;
    metadata: Record<string, any>;
  }) {
    try {
      const result = await this.provider.createSubscription({
        ...data,
        startDate: new Date()
      });

      this.logger.info('Subscription created successfully', {
        customerId: data.customerId,
        planId: data.planId,
        subscriptionId: result.id
      });

      return result;
    } catch (error) {
      this.logger.error('Subscription creation failed', error);
      throw new FinancialError(
        'Subscription creation failed',
        'SUBSCRIPTION_CREATION_FAILED',
        { error }
      );
    }
  }

  async refundPayment(data: {
    paymentId: string;
    amount: number;
    reason: string;
    metadata: Record<string, any>;
  }) {
    try {
      const result = await this.provider.createRefund({
        ...data,
        idempotencyKey: `${Date.now()}-${Math.random()}`
      });

      this.logger.info('Refund processed successfully', {
        paymentId: data.paymentId,
        amount: data.amount,
        refundId: result.id
      });

      return result;
    } catch (error) {
      this.logger.error('Refund processing failed', error);
      throw new FinancialError(
        'Refund processing failed',
        'REFUND_PROCESSING_FAILED',
        { error }
      );
    }
  }

  async handleWebhook(
    payload: any,
    signature: string
  ) {
    try {
      // Verify webhook signature
      const isValid = this.provider.verifyWebhookSignature(
        payload,
        signature,
        this.webhookSecret
      );

      if (!isValid) {
        throw new FinancialError(
          'Invalid webhook signature',
          'INVALID_WEBHOOK_SIGNATURE'
        );
      }

      // Process webhook event
      switch (payload.type) {
        case 'payment.succeeded':
          await this.handlePaymentSucceeded(payload.data);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(payload.data);
          break;
        case 'subscription.created':
          await this.handleSubscriptionCreated(payload.data);
          break;
        case 'subscription.updated':
          await this.handleSubscriptionUpdated(payload.data);
          break;
        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(payload.data);
          break;
        default:
          this.logger.warn('Unhandled webhook event', {
            type: payload.type
          });
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook processing failed', error);
      throw new FinancialError(
        'Webhook processing failed',
        'WEBHOOK_PROCESSING_FAILED',
        { error }
      );
    }
  }

  private async handlePaymentSucceeded(data: any) {
    // Implement payment success logic
  }

  private async handlePaymentFailed(data: any) {
    // Implement payment failure logic
  }

  private async handleSubscriptionCreated(data: any) {
    // Implement subscription creation logic
  }

  private async handleSubscriptionUpdated(data: any) {
    // Implement subscription update logic
  }

  private async handleSubscriptionCancelled(data: any) {
    // Implement subscription cancellation logic
  }
}


