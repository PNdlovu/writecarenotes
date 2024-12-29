/**
 * @fileoverview Pain Management Performance Monitoring
 * @version 1.0.0
 * @created 2024-03-21
 */

import { metrics } from '@/lib/monitoring';
import { TenantContext } from '@/lib/multi-tenant/types';

export class PerformanceMonitoring {
  constructor(private tenantContext: TenantContext) {}

  trackDatabaseOperation(operation: string, duration: number, success: boolean) {
    metrics.histogram('pain_management_db_operation', duration, {
      operation,
      success: String(success),
      region: this.tenantContext.region
    });
  }

  trackAPILatency(endpoint: string, duration: number, statusCode: number) {
    metrics.histogram('pain_management_api_latency', duration, {
      endpoint,
      status_code: String(statusCode),
      region: this.tenantContext.region
    });
  }

  trackCacheHitRate(operation: string, hit: boolean) {
    metrics.increment('pain_management_cache_access', 1, {
      operation,
      hit: String(hit),
      region: this.tenantContext.region
    });
  }

  trackResourceUsage(resource: string, value: number) {
    metrics.gauge('pain_management_resource_usage', value, {
      resource,
      region: this.tenantContext.region
    });
  }
} 