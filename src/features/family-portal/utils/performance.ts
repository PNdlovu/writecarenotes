/**
 * Performance Monitoring Utilities
 * 
 * Tracks and reports performance metrics for the family portal.
 */

import { metrics } from '@/lib/metrics';

interface PerformanceMetric {
  name: string;
  value: number;
  tags: Record<string, string>;
}

export const performance = {
  // Track component render time
  trackRender(componentName: string, duration: number): void {
    metrics.timing('render_duration', duration, {
      component: componentName,
      module: 'family-portal'
    });
  },

  // Track API response time
  trackApiLatency(endpoint: string, duration: number): void {
    metrics.timing('api_latency', duration, {
      endpoint,
      module: 'family-portal'
    });
  },

  // Track resource loading
  trackResourceLoad(resourceType: string, size: number): void {
    metrics.gauge('resource_size', size, {
      type: resourceType,
      module: 'family-portal'
    });
  },

  // Report custom metric
  reportMetric(metric: PerformanceMetric): void {
    metrics.gauge(metric.name, metric.value, {
      ...metric.tags,
      module: 'family-portal'
    });
  }
};


