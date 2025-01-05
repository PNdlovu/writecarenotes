import { Organization } from '../types/organization.types';
import { Metric, MetricType } from '../types/telemetry.types';
import { getCurrentUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

export class TelemetryService {
  private static instance: TelemetryService;
  private metricsQueue: Metric[] = [];
  private flushInterval: NodeJS.Timeout;

  private constructor() {
    this.flushInterval = setInterval(() => this.flushMetrics(), 5000);
  }

  static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  async trackEvent(type: MetricType, data: Record<string, any>): Promise<void> {
    const user = await getCurrentUser();
    const metric: Metric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      userId: user?.id,
      data,
    };

    this.metricsQueue.push(metric);
    logger.debug('Metric queued', { metric });
  }

  async trackError(error: Error, context?: Record<string, any>): Promise<void> {
    const user = await getCurrentUser();
    const errorMetric: Metric = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'error',
      userId: user?.id,
      data: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...context,
      },
    };

    this.metricsQueue.push(errorMetric);
    logger.error('Error tracked', { error: errorMetric });
  }

  async trackPerformance(name: string, duration: number, context?: Record<string, any>): Promise<void> {
    const performanceMetric: Metric = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'performance',
      data: {
        name,
        duration,
        ...context,
      },
    };

    this.metricsQueue.push(performanceMetric);
    logger.debug('Performance metric tracked', { metric: performanceMetric });
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricsQueue.length === 0) return;

    const metrics = [...this.metricsQueue];
    this.metricsQueue = [];

    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics }),
      });
      logger.info('Metrics flushed', { count: metrics.length });
    } catch (error) {
      logger.error('Failed to flush metrics', { error });
      // Put the metrics back in the queue
      this.metricsQueue = [...metrics, ...this.metricsQueue];
    }
  }

  dispose(): void {
    clearInterval(this.flushInterval);
  }
}


