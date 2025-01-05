export type PaymentMethod = 'DIRECT_DEBIT' | 'GOCARDLESS' | 'PAYPAL' | 'STRIPE';

export interface PaymentProviderConfig {
  apiKey: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
  merchantId?: string;
  additionalConfig?: Record<string, any>;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  reference: string;
  description: string;
  metadata: Record<string, any>;
  customerId?: string;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
  metadata: Record<string, any>;
}

export interface PaymentResponse {
  id: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  providerReference: string;
  metadata: Record<string, any>;
  error?: {
    code: string;
    message: string;
  };
}

export interface IPaymentProvider {
  initialize(config: PaymentProviderConfig): Promise<void>;
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  getPaymentStatus(paymentId: string): Promise<PaymentResponse>;
  refundPayment(request: RefundRequest): Promise<PaymentResponse>;
  verifyWebhookSignature(payload: any, signature: string, secret: string): boolean;
}


