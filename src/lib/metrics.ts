/**
 * @fileoverview Metrics tracking service
 * @version 1.0.0
 * @created 2024-03-21
 */

export class Metrics {
  private namespace: string;
  private metrics: Map<string, number>;

  constructor(namespace: string) {
    this.namespace = namespace;
    this.metrics = new Map();
  }

  increment(metric: string, value: number = 1, tags: Record<string, string> = {}): void {
    const key = this.formatMetricKey(metric, tags);
    const currentValue = this.metrics.get(key) || 0;
    this.metrics.set(key, currentValue + value);
    
    // Log metric for debugging
    console.debug(`[Metrics] ${key}: ${currentValue + value}`);
  }

  gauge(metric: string, value: number, tags: Record<string, string> = {}): void {
    const key = this.formatMetricKey(metric, tags);
    this.metrics.set(key, value);
    
    // Log gauge for debugging
    console.debug(`[Metrics] ${key}: ${value}`);
  }

  recordTiming(metric: string, duration: number, tags: Record<string, string> = {}): void {
    const key = this.formatMetricKey(metric, tags);
    this.metrics.set(key, duration);
    
    // Log timing for debugging
    console.debug(`[Metrics] ${key}: ${duration}ms`);
  }

  private formatMetricKey(metric: string, tags: Record<string, string>): string {
    const tagString = Object.entries(tags)
      .map(([key, value]) => `${key}:${value}`)
      .join(',');
    return `${this.namespace}.${metric}${tagString ? `,${tagString}` : ''}`;
  }

  // Get current value of a metric
  getValue(metric: string, tags: Record<string, string> = {}): number {
    const key = this.formatMetricKey(metric, tags);
    return this.metrics.get(key) || 0;
  }

  // Reset a specific metric
  reset(metric: string, tags: Record<string, string> = {}): void {
    const key = this.formatMetricKey(metric, tags);
    this.metrics.delete(key);
  }

  // Reset all metrics
  resetAll(): void {
    this.metrics.clear();
  }
}

// Create and export default metrics instance
export const metrics = new Metrics('writecarenotes');

// Export metric types
export type MetricTags = Record<string, string>;

export interface MetricValue {
  value: number;
  timestamp: number;
  tags?: MetricTags;
}
