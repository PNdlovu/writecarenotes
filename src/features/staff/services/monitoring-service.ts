/**
 * @writecarenotes.com
 * @fileoverview Staff metrics tracking and monitoring service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for tracking staff-related metrics, events and errors.
 * Handles monitoring of staff scheduling, attendance, and performance metrics.
 * Integrates with Sentry for error tracking and reporting.
 */

import { captureException, addBreadcrumb } from '@sentry/nextjs';
import { MetricsService } from '@/lib/metrics';

interface MonitoringEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface ErrorContext {
  user?: {
    id: string;
    organizationId: string;
  };
  metadata?: Record<string, any>;
}

export class StaffMetricsService {
  private static readonly STAFF_MODULE = 'staff_module';

  static trackEvent({ category, action, label, value, metadata }: MonitoringEvent) {
    // Track event in analytics
    MetricsService.trackEvent({
      category: `${this.STAFF_MODULE}_${category}`,
      action,
      label,
      value,
      metadata,
    });

    // Add breadcrumb for error tracking
    addBreadcrumb({
      category,
      message: action,
      level: 'info',
      data: metadata,
    });
  }

  static trackError(error: Error, context?: ErrorContext) {
    captureException(error, {
      tags: {
        module: this.STAFF_MODULE,
        userId: context?.user?.id,
        organizationId: context?.user?.organizationId,
      },
      extra: context?.metadata,
    });
  }

  static trackPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
    MetricsService.trackTiming({
      category: this.STAFF_MODULE,
      variable: operation,
      value: duration,
      metadata,
    });
  }

  static trackSchedulingMetrics(metrics: {
    totalShifts: number;
    unassignedShifts: number;
    conflictCount: number;
    organizationId: string;
  }) {
    const { totalShifts, unassignedShifts, conflictCount, organizationId } = metrics;

    MetricsService.gauge('staff.shifts.total', totalShifts, { organizationId });
    MetricsService.gauge('staff.shifts.unassigned', unassignedShifts, { organizationId });
    MetricsService.gauge('staff.shifts.conflicts', conflictCount, { organizationId });
    
    const assignmentRate = ((totalShifts - unassignedShifts) / totalShifts) * 100;
    MetricsService.gauge('staff.shifts.assignment_rate', assignmentRate, { organizationId });
  }
}


