import { PaymentMethod, PaymentProviderConfig, PaymentRequest, PaymentResponse, IPaymentProvider } from '../types';
import { FailoverStrategy, FailoverEvent } from './types';
import { HealthCheckService } from './healthCheck';
import { PaymentProviderFactory } from '../index';
import { Logger } from '@/lib/logger';
import { Redis } from 'ioredis';
import { sleep } from '@/lib/utils';

export class FailoverManager {
  private readonly EVENT_TTL = 604800; // 7 days
  private logger: Logger;
  private redis: Redis;
  private healthCheck: HealthCheckService;
  private activeProviders: Map<PaymentMethod, boolean> = new Map();

  constructor(
    private config: Record<PaymentMethod, PaymentProviderConfig>,
    private strategy: FailoverStrategy,
    redisUrl: string
  ) {
    this.logger = new Logger('payment-failover');
    this.redis = new Redis(redisUrl);
    
    // Initialize health check service
    this.healthCheck = new HealthCheckService(
      Object.keys(config) as PaymentMethod[],
      redisUrl,
      this.handleHealthChange.bind(this)
    );

    // Initialize all providers as active
    Object.keys(config).forEach(provider => {
      this.activeProviders.set(provider as PaymentMethod, true);
    });
  }

  async start(): Promise<void> {
    // Initialize all providers
    for (const [method, config] of Object.entries(this.config)) {
      try {
        const provider = PaymentProviderFactory.getProvider(method as PaymentMethod);
        await provider.initialize(config);
      } catch (error) {
        this.logger.error('Failed to initialize provider', {
          provider: method,
          error
        });
        this.activeProviders.set(method as PaymentMethod, false);
      }
    }

    // Start health monitoring
    this.healthCheck.start();
  }

  async stop(): Promise<void> {
    this.healthCheck.stop();
  }

  async processPayment(
    preferredProvider: PaymentMethod,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    let lastError: any;
    let attempts = 0;
    let currentProvider = preferredProvider;
    const startTime = Date.now();

    while (attempts < this.strategy.maxRetries) {
      try {
        // Check if current provider is active
        if (!this.activeProviders.get(currentProvider)) {
          currentProvider = this.selectFailoverProvider(currentProvider);
          if (!currentProvider) {
            throw new Error('No available payment providers');
          }
        }

        const provider = PaymentProviderFactory.getProvider(currentProvider);
        const response = await provider.createPayment(request);
        
        // Record success metrics
        const latency = Date.now() - startTime;
        await this.healthCheck.recordSuccess(currentProvider, latency);

        return response;
      } catch (error) {
        lastError = error;
        await this.healthCheck.recordFailure(currentProvider, error);

        // Log failover event
        await this.recordFailoverEvent({
          timestamp: new Date(),
          originalProvider: currentProvider,
          failoverProvider: this.selectFailoverProvider(currentProvider),
          reason: error.message,
          paymentRequest: request,
          error
        });

        // Select next provider for failover
        const nextProvider = this.selectFailoverProvider(currentProvider);
        if (nextProvider) {
          this.logger.info('Failing over to backup provider', {
            from: currentProvider,
            to: nextProvider,
            attempt: attempts + 1
          });
          currentProvider = nextProvider;
        } else {
          this.logger.error('No more failover providers available', {
            attempts,
            lastError
          });
          break;
        }

        // Apply exponential backoff
        const delay = this.strategy.retryDelayMs * Math.pow(this.strategy.backoffFactor, attempts);
        await sleep(delay);
        attempts++;
      }
    }

    throw new Error(`Payment processing failed after ${attempts} attempts: ${lastError.message}`);
  }

  private selectFailoverProvider(currentProvider: PaymentMethod): PaymentMethod | null {
    const availableProviders = this.strategy.failoverProviders
      .filter(provider => 
        provider !== currentProvider && 
        this.activeProviders.get(provider)
      );

    return availableProviders[0] || null;
  }

  private async recordFailoverEvent(event: FailoverEvent): Promise<void> {
    const key = `failover:events:${Date.now()}`;
    await this.redis.setex(
      key,
      this.EVENT_TTL,
      JSON.stringify(event)
    );
  }

  private handleHealthChange(health: { provider: PaymentMethod; isHealthy: boolean }): void {
    this.activeProviders.set(health.provider, health.isHealthy);
    
    this.logger.info('Provider health status changed', {
      provider: health.provider,
      isHealthy: health.isHealthy
    });
  }

  async getFailoverEvents(
    startTime: Date,
    endTime: Date
  ): Promise<FailoverEvent[]> {
    const keys = await this.redis.keys('failover:events:*');
    const events: FailoverEvent[] = [];

    for (const key of keys) {
      const eventJson = await this.redis.get(key);
      if (eventJson) {
        const event: FailoverEvent = JSON.parse(eventJson);
        if (event.timestamp >= startTime && event.timestamp <= endTime) {
          events.push(event);
        }
      }
    }

    return events;
  }
}


