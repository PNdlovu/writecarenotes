import { IPaymentProvider, PaymentProviderConfig, PaymentRequest, PaymentResponse, RefundRequest } from './types';
import { FinancialError } from '../utils/errors';
import { Logger } from '@/lib/logger';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

export class PayPalProvider implements IPaymentProvider {
  private client: any;
  private environment: any;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('paypal-provider');
  }

  async initialize(config: PaymentProviderConfig): Promise<void> {
    try {
      // Set up PayPal environment
      this.environment = config.environment === 'production'
        ? new checkoutNodeJssdk.core.LiveEnvironment(
            config.merchantId!,
            config.apiKey
          )
        : new checkoutNodeJssdk.core.SandboxEnvironment(
            config.merchantId!,
            config.apiKey
          );

      // Create PayPal client
      this.client = new checkoutNodeJssdk.core.PayPalHttpClient(this.environment);

      this.logger.info('PayPal provider initialized', {
        environment: config.environment
      });
    } catch (error) {
      this.logger.error('Failed to initialize PayPal provider', error);
      throw new FinancialError(
        'PayPal initialization failed',
        'PAYPAL_INIT_FAILED',
        { error }
      );
    }
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const order = new checkoutNodeJssdk.orders.OrdersCreateRequest();
      order.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: request.currency,
            value: (request.amount / 100).toString() // Convert from cents to dollars
          },
          description: request.description,
          custom_id: request.reference,
          soft_descriptor: 'CAREAPP*PAYMENT'
        }],
        application_context: {
          brand_name: 'Care App',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW'
        }
      });

      const response = await this.client.execute(order);

      const payment: PaymentResponse = {
        id: response.result.id,
        status: this.mapPaymentStatus(response.result.status),
        amount: request.amount,
        currency: request.currency,
        paymentMethod: 'PAYPAL',
        providerReference: response.result.id,
        metadata: {
          ...request.metadata,
          paypalOrderId: response.result.id
        }
      };

      this.logger.info('PayPal payment created', {
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency
      });

      return payment;
    } catch (error) {
      this.logger.error('Failed to create PayPal payment', error);
      throw new FinancialError(
        'PayPal payment creation failed',
        'PAYPAL_PAYMENT_FAILED',
        { error }
      );
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const request = new checkoutNodeJssdk.orders.OrdersGetRequest(paymentId);
      const response = await this.client.execute(request);

      return {
        id: response.result.id,
        status: this.mapPaymentStatus(response.result.status),
        amount: this.convertToCents(response.result.purchase_units[0].amount.value),
        currency: response.result.purchase_units[0].amount.currency_code,
        paymentMethod: 'PAYPAL',
        providerReference: response.result.id,
        metadata: {
          paypalOrderId: response.result.id
        }
      };
    } catch (error) {
      this.logger.error('Failed to get PayPal payment status', error);
      throw new FinancialError(
        'Failed to get PayPal payment status',
        'PAYPAL_STATUS_CHECK_FAILED',
        { error }
      );
    }
  }

  async refundPayment(request: RefundRequest): Promise<PaymentResponse> {
    try {
      const captureId = request.metadata.captureId;
      if (!captureId) {
        throw new Error('Capture ID is required for refund');
      }

      const refundRequest = new checkoutNodeJssdk.payments.CapturesRefundRequest(captureId);
      refundRequest.requestBody({
        amount: {
          value: (request.amount / 100).toString(),
          currency_code: 'GBP'
        },
        note_to_payer: request.reason
      });

      const response = await this.client.execute(refundRequest);

      const refund: PaymentResponse = {
        id: response.result.id,
        status: this.mapPaymentStatus(response.result.status),
        amount: request.amount,
        currency: 'GBP',
        paymentMethod: 'PAYPAL',
        providerReference: request.paymentId,
        metadata: {
          ...request.metadata,
          refundId: response.result.id
        }
      };

      this.logger.info('PayPal refund processed', {
        refundId: refund.id,
        originalPaymentId: request.paymentId,
        amount: refund.amount
      });

      return refund;
    } catch (error) {
      this.logger.error('Failed to process PayPal refund', error);
      throw new FinancialError(
        'PayPal refund failed',
        'PAYPAL_REFUND_FAILED',
        { error }
      );
    }
  }

  verifyWebhookSignature(payload: any, signature: string, secret: string): boolean {
    try {
      const verifyRequest = new checkoutNodeJssdk.notifications.VerifyWebhookSignatureRequest();
      verifyRequest.requestBody({
        auth_algo: signature.split(',')[0],
        cert_url: signature.split(',')[1],
        transmission_id: signature.split(',')[2],
        transmission_sig: signature.split(',')[3],
        transmission_time: signature.split(',')[4],
        webhook_id: secret,
        webhook_event: payload
      });

      const response = this.client.execute(verifyRequest);
      return response.result.verification_status === 'SUCCESS';
    } catch (error) {
      this.logger.error('PayPal webhook validation failed', error);
      return false;
    }
  }

  private mapPaymentStatus(paypalStatus: string): PaymentResponse['status'] {
    const statusMap: Record<string, PaymentResponse['status']> = {
      CREATED: 'pending',
      SAVED: 'pending',
      APPROVED: 'processing',
      VOIDED: 'failed',
      COMPLETED: 'succeeded',
      PAYER_ACTION_REQUIRED: 'pending'
    };
    return statusMap[paypalStatus] || 'processing';
  }

  private convertToCents(amount: string): number {
    return Math.round(parseFloat(amount) * 100);
  }
}


