import { IPaymentProvider, PaymentProviderConfig, PaymentRequest, PaymentResponse, RefundRequest } from './types';
import { FinancialError } from '../utils/errors';
import { Logger } from '@/lib/logger';
import Stripe from 'stripe';

export class StripeProvider implements IPaymentProvider {
  private client: Stripe;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('stripe-provider');
  }

  async initialize(config: PaymentProviderConfig): Promise<void> {
    try {
      this.client = new Stripe(config.apiKey, {
        apiVersion: '2023-10-16',
        typescript: true
      });

      this.logger.info('Stripe provider initialized', {
        environment: config.environment
      });
    } catch (error) {
      this.logger.error('Failed to initialize Stripe provider', error);
      throw new FinancialError(
        'Stripe initialization failed',
        'STRIPE_INIT_FAILED',
        { error }
      );
    }
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const paymentIntent = await this.client.paymentIntents.create({
        amount: request.amount,
        currency: request.currency.toLowerCase(),
        description: request.description,
        metadata: request.metadata,
        customer: request.customerId,
        payment_method_types: ['card'],
        idempotency_key: request.idempotencyKey
      });

      const payment: PaymentResponse = {
        id: paymentIntent.id,
        status: this.mapPaymentStatus(paymentIntent.status),
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        paymentMethod: 'STRIPE',
        providerReference: paymentIntent.id,
        metadata: paymentIntent.metadata
      };

      this.logger.info('Stripe payment created', {
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency
      });

      return payment;
    } catch (error) {
      this.logger.error('Failed to create Stripe payment', error);
      throw new FinancialError(
        'Stripe payment creation failed',
        'STRIPE_PAYMENT_FAILED',
        { error }
      );
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const paymentIntent = await this.client.paymentIntents.retrieve(paymentId);

      return {
        id: paymentIntent.id,
        status: this.mapPaymentStatus(paymentIntent.status),
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        paymentMethod: 'STRIPE',
        providerReference: paymentIntent.id,
        metadata: paymentIntent.metadata
      };
    } catch (error) {
      this.logger.error('Failed to get Stripe payment status', error);
      throw new FinancialError(
        'Failed to get Stripe payment status',
        'STRIPE_STATUS_CHECK_FAILED',
        { error }
      );
    }
  }

  async refundPayment(request: RefundRequest): Promise<PaymentResponse> {
    try {
      const refund = await this.client.refunds.create({
        payment_intent: request.paymentId,
        amount: request.amount,
        reason: this.mapRefundReason(request.reason),
        metadata: request.metadata
      });

      const response: PaymentResponse = {
        id: refund.id,
        status: this.mapPaymentStatus(refund.status),
        amount: refund.amount,
        currency: refund.currency.toUpperCase(),
        paymentMethod: 'STRIPE',
        providerReference: request.paymentId,
        metadata: refund.metadata
      };

      this.logger.info('Stripe refund processed', {
        refundId: response.id,
        originalPaymentId: request.paymentId,
        amount: response.amount
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to process Stripe refund', error);
      throw new FinancialError(
        'Stripe refund failed',
        'STRIPE_REFUND_FAILED',
        { error }
      );
    }
  }

  verifyWebhookSignature(payload: any, signature: string, secret: string): boolean {
    try {
      const event = this.client.webhooks.constructEvent(
        payload,
        signature,
        secret
      );
      return !!event;
    } catch (error) {
      this.logger.error('Stripe webhook validation failed', error);
      return false;
    }
  }

  private mapPaymentStatus(stripeStatus: string): PaymentResponse['status'] {
    const statusMap: Record<string, PaymentResponse['status']> = {
      requires_payment_method: 'pending',
      requires_confirmation: 'pending',
      requires_action: 'pending',
      processing: 'processing',
      succeeded: 'succeeded',
      canceled: 'failed',
      requires_capture: 'processing'
    };
    return statusMap[stripeStatus] || 'processing';
  }

  private mapRefundReason(reason: string): Stripe.RefundCreateParams.Reason {
    const reasonMap: Record<string, Stripe.RefundCreateParams.Reason> = {
      duplicate: 'duplicate',
      fraudulent: 'fraudulent',
      requested_by_customer: 'requested_by_customer'
    };
    return reasonMap[reason.toLowerCase()] || 'requested_by_customer';
  }
}


