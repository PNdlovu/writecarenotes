import { IPaymentProvider, PaymentProviderConfig, PaymentRequest, PaymentResponse, RefundRequest } from './types';
import { FinancialError } from '../utils/errors';
import { Logger } from '@/lib/logger';
import gocardless from 'gocardless-nodejs';
import { Environments } from 'gocardless-nodejs/constants';

export class GoCardlessProvider implements IPaymentProvider {
  private client: any;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('gocardless-provider');
  }

  async initialize(config: PaymentProviderConfig): Promise<void> {
    try {
      this.client = gocardless(
        config.apiKey,
        config.environment === 'production' 
          ? Environments.Live 
          : Environments.Sandbox
      );

      this.logger.info('GoCardless provider initialized', {
        environment: config.environment
      });
    } catch (error) {
      this.logger.error('Failed to initialize GoCardless provider', error);
      throw new FinancialError(
        'GoCardless initialization failed',
        'GOCARDLESS_INIT_FAILED',
        { error }
      );
    }
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const payment = await this.client.payments.create({
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        metadata: request.metadata,
        links: {
          mandate: request.metadata.mandateId // Requires mandate ID from customer setup
        }
      }, {
        idempotencyKey: request.idempotencyKey
      });

      const response: PaymentResponse = {
        id: payment.id,
        status: this.mapPaymentStatus(payment.status),
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: 'GOCARDLESS',
        providerReference: payment.reference,
        metadata: payment.metadata
      };

      this.logger.info('GoCardless payment created', {
        paymentId: response.id,
        amount: response.amount,
        currency: response.currency
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to create GoCardless payment', error);
      throw new FinancialError(
        'GoCardless payment creation failed',
        'GOCARDLESS_PAYMENT_FAILED',
        { error }
      );
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const payment = await this.client.payments.find(paymentId);

      return {
        id: payment.id,
        status: this.mapPaymentStatus(payment.status),
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: 'GOCARDLESS',
        providerReference: payment.reference,
        metadata: payment.metadata
      };
    } catch (error) {
      this.logger.error('Failed to get GoCardless payment status', error);
      throw new FinancialError(
        'Failed to get GoCardless payment status',
        'GOCARDLESS_STATUS_CHECK_FAILED',
        { error }
      );
    }
  }

  async refundPayment(request: RefundRequest): Promise<PaymentResponse> {
    try {
      const refund = await this.client.refunds.create({
        amount: request.amount,
        total_amount_confirmation: request.amount,
        links: {
          payment: request.paymentId
        },
        metadata: request.metadata
      });

      const response: PaymentResponse = {
        id: refund.id,
        status: this.mapPaymentStatus(refund.status),
        amount: refund.amount,
        currency: 'GBP', // GoCardless refunds are in the same currency as the payment
        paymentMethod: 'GOCARDLESS',
        providerReference: request.paymentId,
        metadata: refund.metadata
      };

      this.logger.info('GoCardless refund processed', {
        refundId: response.id,
        originalPaymentId: request.paymentId,
        amount: response.amount
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to process GoCardless refund', error);
      throw new FinancialError(
        'GoCardless refund failed',
        'GOCARDLESS_REFUND_FAILED',
        { error }
      );
    }
  }

  verifyWebhookSignature(payload: any, signature: string, secret: string): boolean {
    try {
      // GoCardless webhook verification
      const webhookValid = this.client.webhooks.validate(payload, signature);
      return webhookValid;
    } catch (error) {
      this.logger.error('GoCardless webhook validation failed', error);
      return false;
    }
  }

  private mapPaymentStatus(goCardlessStatus: string): PaymentResponse['status'] {
    const statusMap: Record<string, PaymentResponse['status']> = {
      pending: 'pending',
      submitted: 'processing',
      confirmed: 'succeeded',
      paid_out: 'succeeded',
      failed: 'failed',
      cancelled: 'failed'
    };
    return statusMap[goCardlessStatus] || 'processing';
  }
}


