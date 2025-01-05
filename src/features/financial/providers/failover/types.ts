import { PaymentMethod, PaymentProviderConfig, PaymentRequest, PaymentResponse } from '../types';

export interface FailoverStrategy {
  maxRetries: number;
  retryDelayMs: number;
  backoffFactor: number;
  failoverProviders: PaymentMethod[];
}

export interface ProviderHealth {
  provider: PaymentMethod;
  isHealthy: boolean;
  lastChecked: Date;
  errorRate: number;
  avgResponseTime: number;
  consecutiveFailures: number;
}

export interface FailoverEvent {
  timestamp: Date;
  originalProvider: PaymentMethod;
  failoverProvider: PaymentMethod;
  reason: string;
  paymentRequest: PaymentRequest;
  error?: any;
}

export interface ProviderMetrics {
  successCount: number;
  failureCount: number;
  totalLatency: number;
  lastFailure?: Date;
  lastSuccess?: Date;
}


