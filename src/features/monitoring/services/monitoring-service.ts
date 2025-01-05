/**
 * @writecarenotes.com
 * @fileoverview Enterprise monitoring service for SLA tracking and performance monitoring
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Enterprise-grade monitoring service providing comprehensive SLA tracking,
 * performance monitoring, and health checks for the Write Care Notes platform.
 */

import { Logger } from '@/lib/logger';
import { Metrics } from '@/lib/metrics';
import { NetworkStatus } from '@/lib/network';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, ComponentHealth>;
  lastCheck: Date;
  message?: string;
}

interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  lastCheck: Date;
  message?: string;
}

interface SLAMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  availabilityScore: number;
}

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  loadAverage: number[];
  networkLatency: number;
  apiLatency: Record<string, number>;
}

export class MonitoringService {
  private healthStatus: HealthStatus = {
    status: 'healthy',
    components: {},
    lastCheck: new Date()
  };

  private slaMetrics: SLAMetrics = {
    uptime: 100,
    responseTime: 0,
    errorRate: 0,
    availabilityScore: 100
  };

  private performanceMetrics: PerformanceMetrics = {
    cpu: 0,
    memory: 0,
    loadAverage: [0, 0, 0],
    networkLatency: 0,
    apiLatency: {}
  };

  private readonly checkInterval = 60000; // 1 minute
  private readonly slaThresholds = {
    responseTime: 1000, // 1 second
    errorRate: 1, // 1%
    availability: 99.9 // 99.9%
  };

  private logger: Logger;
  private metrics: Metrics;
  private networkStatus: NetworkStatus;

  constructor() {
    this.logger = new Logger('MonitoringService');
    this.metrics = new Metrics('monitoring');
    this.networkStatus = new NetworkStatus();

    this.initialize();
  }

  private initialize(): void {
    // Start health checks
    setInterval(() => this.performHealthCheck(), this.checkInterval);

    // Start performance monitoring
    setInterval(() => this.collectPerformanceMetrics(), this.checkInterval);

    // Start SLA monitoring
    setInterval(() => this.updateSLAMetrics(), this.checkInterval);

    // Listen for performance entries
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePerformanceEntry(entry);
        }
      });

      observer.observe({ entryTypes: ['resource', 'navigation', 'longtask'] });
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      // Check core components
      const components: Record<string, ComponentHealth> = {
        api: await this.checkAPIHealth(),
        database: await this.checkDatabaseHealth(),
        cache: await this.checkCacheHealth(),
        storage: await this.checkStorageHealth()
      };

      // Update overall health status
      const status = this.calculateOverallHealth(components);
      
      this.healthStatus = {
        status,
        components,
        lastCheck: new Date()
      };

      this.metrics.gauge('health_status', status === 'healthy' ? 1 : 0);
      this.logger.info('Health check completed', { status });
    } catch (error) {
      this.logger.error('Health check failed', { error });
      this.metrics.increment('health_check_failures');
    }
  }

  private async collectPerformanceMetrics(): Promise<void> {
    try {
      // Collect system metrics
      const performance = await this.getSystemPerformance();
      
      this.performanceMetrics = {
        ...this.performanceMetrics,
        ...performance
      };

      // Record metrics
      Object.entries(performance).forEach(([key, value]) => {
        if (typeof value === 'number') {
          this.metrics.gauge(`performance_${key}`, value);
        }
      });

      this.logger.debug('Performance metrics collected', { metrics: performance });
    } catch (error) {
      this.logger.error('Failed to collect performance metrics', { error });
      this.metrics.increment('performance_collection_failures');
    }
  }

  private async updateSLAMetrics(): Promise<void> {
    try {
      const currentMetrics = await this.calculateSLAMetrics();
      
      this.slaMetrics = {
        ...this.slaMetrics,
        ...currentMetrics
      };

      // Check for SLA violations
      this.checkSLAViolations(currentMetrics);

      // Record metrics
      Object.entries(currentMetrics).forEach(([key, value]) => {
        this.metrics.gauge(`sla_${key}`, value);
      });

      this.logger.debug('SLA metrics updated', { metrics: currentMetrics });
    } catch (error) {
      this.logger.error('Failed to update SLA metrics', { error });
      this.metrics.increment('sla_update_failures');
    }
  }

  private handlePerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'resource':
        this.handleResourceTiming(entry as PerformanceResourceTiming);
        break;
      case 'navigation':
        this.handleNavigationTiming(entry as PerformanceNavigationTiming);
        break;
      case 'longtask':
        this.handleLongTask(entry);
        break;
    }
  }

  private async checkAPIHealth(): Promise<ComponentHealth> {
    try {
      const start = performance.now();
      const response = await fetch('/api/health');
      const latency = performance.now() - start;

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        latency,
        lastCheck: new Date(),
        message: response.ok ? undefined : 'API health check failed'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: 0,
        lastCheck: new Date(),
        message: 'API health check failed'
      };
    }
  }

  private async checkDatabaseHealth(): Promise<ComponentHealth> {
    // Implement database health check
    return {
      status: 'healthy',
      latency: 0,
      lastCheck: new Date()
    };
  }

  private async checkCacheHealth(): Promise<ComponentHealth> {
    // Implement cache health check
    return {
      status: 'healthy',
      latency: 0,
      lastCheck: new Date()
    };
  }

  private async checkStorageHealth(): Promise<ComponentHealth> {
    // Implement storage health check
    return {
      status: 'healthy',
      latency: 0,
      lastCheck: new Date()
    };
  }

  private calculateOverallHealth(components: Record<string, ComponentHealth>): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = Object.values(components).map(c => c.status);
    
    if (statuses.some(s => s === 'unhealthy')) {
      return 'unhealthy';
    }
    
    if (statuses.some(s => s === 'degraded')) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  private async getSystemPerformance(): Promise<Partial<PerformanceMetrics>> {
    const metrics: Partial<PerformanceMetrics> = {};

    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.memory = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }

    // Network latency
    metrics.networkLatency = await this.measureNetworkLatency();

    // API latency
    metrics.apiLatency = this.calculateAPILatency();

    return metrics;
  }

  private async calculateSLAMetrics(): Promise<SLAMetrics> {
    // Calculate uptime
    const uptime = await this.calculateUptime();

    // Calculate response time
    const responseTime = this.calculateAverageResponseTime();

    // Calculate error rate
    const errorRate = this.calculateErrorRate();

    // Calculate availability score
    const availabilityScore = this.calculateAvailabilityScore(uptime, responseTime, errorRate);

    return {
      uptime,
      responseTime,
      errorRate,
      availabilityScore
    };
  }

  private checkSLAViolations(metrics: SLAMetrics): void {
    if (metrics.responseTime > this.slaThresholds.responseTime) {
      this.logger.warn('SLA violation: Response time threshold exceeded', {
        current: metrics.responseTime,
        threshold: this.slaThresholds.responseTime
      });
      this.metrics.increment('sla_violations_response_time');
    }

    if (metrics.errorRate > this.slaThresholds.errorRate) {
      this.logger.warn('SLA violation: Error rate threshold exceeded', {
        current: metrics.errorRate,
        threshold: this.slaThresholds.errorRate
      });
      this.metrics.increment('sla_violations_error_rate');
    }

    if (metrics.availabilityScore < this.slaThresholds.availability) {
      this.logger.warn('SLA violation: Availability threshold not met', {
        current: metrics.availabilityScore,
        threshold: this.slaThresholds.availability
      });
      this.metrics.increment('sla_violations_availability');
    }
  }

  private handleResourceTiming(entry: PerformanceResourceTiming): void {
    const timing = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      request: entry.responseStart - entry.requestStart,
      response: entry.responseEnd - entry.responseStart,
      total: entry.duration
    };

    this.metrics.histogram('resource_timing', timing.total, {
      resource: entry.name
    });
  }

  private handleNavigationTiming(entry: PerformanceNavigationTiming): void {
    const timing = {
      fcp: entry.firstContentfulPaint,
      lcp: entry.largestContentfulPaint,
      tti: entry.timeToInteractive,
      tbt: entry.totalBlockingTime
    };

    Object.entries(timing).forEach(([key, value]) => {
      this.metrics.histogram(`navigation_${key}`, value);
    });
  }

  private handleLongTask(entry: PerformanceEntry): void {
    this.metrics.histogram('long_task_duration', entry.duration);
  }

  private async measureNetworkLatency(): Promise<number> {
    try {
      const start = performance.now();
      await fetch('/api/ping');
      return performance.now() - start;
    } catch {
      return 0;
    }
  }

  private calculateAPILatency(): Record<string, number> {
    const latencies: Record<string, number> = {};
    const entries = performance.getEntriesByType('resource');

    for (const entry of entries) {
      if (entry.name.includes('/api/')) {
        const endpoint = new URL(entry.name).pathname;
        latencies[endpoint] = entry.duration;
      }
    }

    return latencies;
  }

  private async calculateUptime(): Promise<number> {
    // Implement uptime calculation
    return 100;
  }

  private calculateAverageResponseTime(): number {
    const entries = performance.getEntriesByType('resource');
    if (entries.length === 0) return 0;

    const total = entries.reduce((sum, entry) => sum + entry.duration, 0);
    return total / entries.length;
  }

  private calculateErrorRate(): number {
    // Implement error rate calculation
    return 0;
  }

  private calculateAvailabilityScore(uptime: number, responseTime: number, errorRate: number): number {
    // Implement availability score calculation
    return 100;
  }

  // Public API
  getHealthStatus(): HealthStatus {
    return { ...this.healthStatus };
  }

  getSLAMetrics(): SLAMetrics {
    return { ...this.slaMetrics };
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }
}

export const monitoringService = new MonitoringService(); 