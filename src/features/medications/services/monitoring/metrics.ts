import { Metrics } from '@/lib/metrics';
import { Logger } from '@/lib/logger';
import { Cache } from '@/lib/cache';

class MedicationMetrics {
  private readonly metrics: Metrics;
  private readonly logger: Logger;
  private readonly cache: Cache;

  constructor() {
    this.metrics = new Metrics('medications');
    this.logger = new Logger('MedicationMetrics');
    this.cache = new Cache();
  }

  // Service metrics
  async trackServiceOperation(params: {
    operation: string;
    tenantId: string;
    success: boolean;
    duration: number;
  }): Promise<void> {
    const { operation, tenantId, success, duration } = params;

    this.metrics.increment(`operation.${operation}`, {
      tenantId,
      success: success.toString()
    });

    this.metrics.histogram('operation.duration', duration, {
      operation,
      tenantId
    });

    if (!success) {
      this.metrics.increment('operation.failure', {
        operation,
        tenantId
      });
    }
  }

  // Performance metrics
  async trackDatabaseQuery(params: {
    query: string;
    duration: number;
    success: boolean;
  }): Promise<void> {
    const { query, duration, success } = params;

    this.metrics.histogram('database.query.duration', duration, {
      query
    });

    if (!success) {
      this.metrics.increment('database.query.failure', {
        query
      });
    }
  }

  // Cache metrics
  async trackCacheOperation(params: {
    operation: string;
    hit: boolean;
    duration: number;
  }): Promise<void> {
    const { operation, hit, duration } = params;

    this.metrics.increment(`cache.${operation}`, {
      hit: hit.toString()
    });

    this.metrics.histogram('cache.duration', duration, {
      operation
    });
  }

  // Business metrics
  async trackMedicationActivity(params: {
    activity: string;
    tenantId: string;
    residentId: string;
    success: boolean;
  }): Promise<void> {
    const { activity, tenantId, residentId, success } = params;

    this.metrics.increment(`medication.${activity}`, {
      tenantId,
      success: success.toString()
    });

    // Track unique residents
    await this.trackUniqueResidents(tenantId, residentId);
  }

  // Usage metrics
  async trackApiUsage(params: {
    endpoint: string;
    method: string;
    tenantId: string;
    statusCode: number;
    duration: number;
  }): Promise<void> {
    const { endpoint, method, tenantId, statusCode, duration } = params;

    this.metrics.increment('api.request', {
      endpoint,
      method,
      tenantId,
      statusCode: statusCode.toString()
    });

    this.metrics.histogram('api.duration', duration, {
      endpoint,
      method,
      tenantId
    });

    // Track rate limiting
    await this.trackRateLimiting(tenantId, endpoint);
  }

  // Error metrics
  async trackError(params: {
    type: string;
    message: string;
    tenantId: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }): Promise<void> {
    const { type, message, tenantId, severity } = params;

    this.metrics.increment('error', {
      type,
      tenantId,
      severity
    });

    this.logger.error(message, {
      type,
      tenantId,
      severity
    });
  }

  // Health metrics
  async trackHealthCheck(params: {
    component: string;
    status: 'UP' | 'DOWN';
    duration: number;
  }): Promise<void> {
    const { component, status, duration } = params;

    this.metrics.gauge('health.status', status === 'UP' ? 1 : 0, {
      component
    });

    this.metrics.histogram('health.check.duration', duration, {
      component
    });
  }

  // Integration metrics
  async trackIntegration(params: {
    integration: string;
    operation: string;
    success: boolean;
    duration: number;
  }): Promise<void> {
    const { integration, operation, success, duration } = params;

    this.metrics.increment(`integration.${operation}`, {
      integration,
      success: success.toString()
    });

    this.metrics.histogram('integration.duration', duration, {
      integration,
      operation
    });
  }

  private async trackUniqueResidents(tenantId: string, residentId: string): Promise<void> {
    const key = `metrics:residents:${tenantId}:${this.getCurrentPeriod()}`;
    await this.cache.sadd(key, residentId);
    const count = await this.cache.scard(key);
    
    this.metrics.gauge('residents.active', count, {
      tenantId
    });
  }

  private async trackRateLimiting(tenantId: string, endpoint: string): Promise<void> {
    const key = `metrics:rate:${tenantId}:${endpoint}:${this.getCurrentMinute()}`;
    const count = await this.cache.incr(key);
    await this.cache.expire(key, 60);

    this.metrics.gauge('api.rate', count, {
      tenantId,
      endpoint
    });
  }

  private getCurrentPeriod(): string {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  private getCurrentMinute(): string {
    const date = new Date();
    return `${date.getHours()}:${date.getMinutes()}`;
  }
}

export const medicationMetrics = new MedicationMetrics();


