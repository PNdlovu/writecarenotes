import { Metrics } from '@/lib/metrics';
import { TenantContext } from '@/lib/multi-tenant/types';

export class PayrollMetrics {
  private readonly metrics: Metrics;
  private readonly tenantId: string;

  constructor(tenantContext: TenantContext) {
    this.metrics = new Metrics('payroll');
    this.tenantId = tenantContext.tenant.id;
  }

  startCalculation() {
    return this.metrics.startTimer('payroll_calculation', {
      tenantId: this.tenantId
    });
  }

  recordCacheHit(type: 'tax_bands' | 'translations') {
    this.metrics.increment('cache_hit', {
      tenantId: this.tenantId,
      type
    });
  }

  recordCacheMiss(type: 'tax_bands' | 'translations') {
    this.metrics.increment('cache_miss', {
      tenantId: this.tenantId,
      type
    });
  }

  recordSyncAttempt(success: boolean) {
    this.metrics.increment('sync_attempt', {
      tenantId: this.tenantId,
      success: success.toString()
    });
  }

  recordOfflineOperation(type: string) {
    this.metrics.increment('offline_operation', {
      tenantId: this.tenantId,
      type
    });
  }

  recordCalculationError(errorType: string) {
    this.metrics.increment('calculation_error', {
      tenantId: this.tenantId,
      errorType
    });
  }

  recordPayrollSize(employeeCount: number) {
    this.metrics.gauge('payroll_size', employeeCount, {
      tenantId: this.tenantId
    });
  }

  recordProcessingTime(operation: string, timeMs: number) {
    this.metrics.histogram('processing_time', timeMs, {
      tenantId: this.tenantId,
      operation
    });
  }

  // Track memory usage
  recordMemoryUsage() {
    if (typeof process !== 'undefined') {
      const usage = process.memoryUsage();
      this.metrics.gauge('memory_usage_heap', usage.heapUsed, {
        tenantId: this.tenantId
      });
      this.metrics.gauge('memory_usage_total', usage.rss, {
        tenantId: this.tenantId
      });
    }
  }

  // Track queue sizes
  recordQueueSize(queueName: string, size: number) {
    this.metrics.gauge('queue_size', size, {
      tenantId: this.tenantId,
      queue: queueName
    });
  }

  // Track API latencies
  recordAPILatency(endpoint: string, latencyMs: number) {
    this.metrics.histogram('api_latency', latencyMs, {
      tenantId: this.tenantId,
      endpoint
    });
  }
}
