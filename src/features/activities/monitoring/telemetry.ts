import { OpenTelemetryProvider, metrics, trace } from '@/lib/telemetry';
import { ActivityStatus, ActivityType } from '../types';

const METRICS_PREFIX = 'activities';

export class ActivityTelemetry {
  private static instance: ActivityTelemetry;
  private meter: metrics.Meter;
  private tracer: trace.Tracer;

  private activityCounter: metrics.Counter;
  private syncDurationHistogram: metrics.Histogram;
  private errorCounter: metrics.Counter;

  private constructor() {
    this.meter = metrics.getMeter(METRICS_PREFIX);
    this.tracer = trace.getTracer(METRICS_PREFIX);

    // Initialize metrics
    this.activityCounter = this.meter.createCounter('activity_operations', {
      description: 'Count of activity operations by type and status'
    });

    this.syncDurationHistogram = this.meter.createHistogram('sync_duration', {
      description: 'Duration of sync operations in milliseconds'
    });

    this.errorCounter = this.meter.createCounter('errors', {
      description: 'Count of errors by type'
    });
  }

  static getInstance(): ActivityTelemetry {
    if (!ActivityTelemetry.instance) {
      ActivityTelemetry.instance = new ActivityTelemetry();
    }
    return ActivityTelemetry.instance;
  }

  recordActivityOperation(
    organizationId: string,
    careHomeId: string,
    type: ActivityType,
    status: ActivityStatus
  ): void {
    this.activityCounter.add(1, {
      organizationId,
      careHomeId,
      type,
      status
    });
  }

  recordSyncDuration(durationMs: number, success: boolean): void {
    this.syncDurationHistogram.record(durationMs, {
      success: success.toString()
    });
  }

  recordError(
    errorType: string,
    organizationId?: string,
    careHomeId?: string
  ): void {
    this.errorCounter.add(1, {
      errorType,
      organizationId: organizationId || 'unknown',
      careHomeId: careHomeId || 'unknown'
    });
  }

  async startSpan<T>(
    name: string,
    fn: (span: trace.Span) => Promise<T>
  ): Promise<T> {
    return this.tracer.startActiveSpan(name, async (span) => {
      try {
        const result = await fn(span);
        span.setStatus({ code: trace.SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: trace.SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }
}

// Export singleton instance
export const activityTelemetry = ActivityTelemetry.getInstance();
