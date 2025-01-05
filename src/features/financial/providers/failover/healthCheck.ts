import { PaymentMethod } from '../types';
import { ProviderHealth, ProviderMetrics } from './types';
import { Logger } from '@/lib/logger';
import { Redis } from 'ioredis';
import { AlertService } from '@/lib/alerts';

export class HealthCheckService {
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private readonly ERROR_THRESHOLD = 0.1; // 10% error rate threshold
  private readonly RESPONSE_TIME_THRESHOLD = 2000; // 2 seconds
  private readonly CONSECUTIVE_FAILURES_THRESHOLD = 3;
  private readonly METRICS_TTL = 86400; // 24 hours

  private healthCheckInterval: NodeJS.Timeout;
  private logger: Logger;
  private redis: Redis;
  private alertService: AlertService;

  constructor(
    private providers: PaymentMethod[],
    redisUrl: string,
    private onProviderHealthChange?: (health: ProviderHealth) => void
  ) {
    this.logger = new Logger('payment-health');
    this.redis = new Redis(redisUrl);
    this.alertService = new AlertService();
  }

  start(): void {
    this.healthCheckInterval = setInterval(
      () => this.checkAllProviders(),
      this.HEALTH_CHECK_INTERVAL
    );
  }

  stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  async recordSuccess(provider: PaymentMethod, latencyMs: number): Promise<void> {
    const key = `metrics:${provider}`;
    const pipeline = this.redis.pipeline();

    pipeline.hincrby(key, 'successCount', 1);
    pipeline.hincrbyfloat(key, 'totalLatency', latencyMs);
    pipeline.hset(key, 'lastSuccess', new Date().toISOString());
    pipeline.expire(key, this.METRICS_TTL);

    await pipeline.exec();
  }

  async recordFailure(provider: PaymentMethod, error: any): Promise<void> {
    const key = `metrics:${provider}`;
    const pipeline = this.redis.pipeline();

    pipeline.hincrby(key, 'failureCount', 1);
    pipeline.hset(key, 'lastFailure', new Date().toISOString());
    pipeline.hincrby(key, 'consecutiveFailures', 1);
    pipeline.expire(key, this.METRICS_TTL);

    await pipeline.exec();

    // Alert on consecutive failures
    const metrics = await this.getMetrics(provider);
    if (metrics.consecutiveFailures >= this.CONSECUTIVE_FAILURES_THRESHOLD) {
      await this.alertService.sendAlert({
        severity: 'critical',
        title: `Payment Provider ${provider} Critical Failure`,
        message: `Provider has failed ${metrics.consecutiveFailures} times consecutively`,
        metadata: {
          provider,
          error: error?.message,
          metrics
        }
      });
    }
  }

  private async checkAllProviders(): Promise<void> {
    for (const provider of this.providers) {
      try {
        const health = await this.checkProviderHealth(provider);
        
        if (this.onProviderHealthChange) {
          this.onProviderHealthChange(health);
        }

        // Log and alert if provider is unhealthy
        if (!health.isHealthy) {
          this.logger.warn('Provider health check failed', {
            provider,
            metrics: health
          });

          await this.alertService.sendAlert({
            severity: 'warning',
            title: `Payment Provider ${provider} Degraded`,
            message: 'Provider health check indicates degraded performance',
            metadata: health
          });
        }
      } catch (error) {
        this.logger.error('Health check failed', {
          provider,
          error
        });
      }
    }
  }

  private async checkProviderHealth(provider: PaymentMethod): Promise<ProviderHealth> {
    const metrics = await this.getMetrics(provider);
    const totalRequests = metrics.successCount + metrics.failureCount;
    
    const errorRate = totalRequests > 0 
      ? metrics.failureCount / totalRequests 
      : 0;
    
    const avgResponseTime = metrics.successCount > 0 
      ? metrics.totalLatency / metrics.successCount 
      : 0;

    const health: ProviderHealth = {
      provider,
      isHealthy: true,
      lastChecked: new Date(),
      errorRate,
      avgResponseTime,
      consecutiveFailures: metrics.consecutiveFailures || 0
    };

    // Check against thresholds
    if (
      errorRate > this.ERROR_THRESHOLD ||
      avgResponseTime > this.RESPONSE_TIME_THRESHOLD ||
      metrics.consecutiveFailures >= this.CONSECUTIVE_FAILURES_THRESHOLD
    ) {
      health.isHealthy = false;
    }

    return health;
  }

  private async getMetrics(provider: PaymentMethod): Promise<ProviderMetrics> {
    const key = `metrics:${provider}`;
    const data = await this.redis.hgetall(key);

    return {
      successCount: parseInt(data.successCount || '0'),
      failureCount: parseInt(data.failureCount || '0'),
      totalLatency: parseFloat(data.totalLatency || '0'),
      consecutiveFailures: parseInt(data.consecutiveFailures || '0'),
      lastFailure: data.lastFailure ? new Date(data.lastFailure) : undefined,
      lastSuccess: data.lastSuccess ? new Date(data.lastSuccess) : undefined
    };
  }
}


