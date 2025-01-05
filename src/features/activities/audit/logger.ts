import { prisma } from '@/lib/prisma';
import { Activity, ActivityType, ActivityStatus } from '../types';
import { logger } from '@/lib/logger';
import { activityTelemetry } from '../monitoring/telemetry';

export interface AuditEvent {
  action: string;
  activityId: string;
  organizationId: string;
  careHomeId: string;
  userId: string;
  details: Record<string, any>;
  timestamp: Date;
}

export interface AuditLogOptions {
  skipTelemetry?: boolean;
  severity?: 'info' | 'warning' | 'error';
  tags?: string[];
}

export class ActivityAuditLogger {
  private static instance: ActivityAuditLogger;

  private constructor() {}

  static getInstance(): ActivityAuditLogger {
    if (!ActivityAuditLogger.instance) {
      ActivityAuditLogger.instance = new ActivityAuditLogger();
    }
    return ActivityAuditLogger.instance;
  }

  async logActivityEvent(
    event: AuditEvent,
    options: AuditLogOptions = {}
  ): Promise<void> {
    const { skipTelemetry = false, severity = 'info', tags = [] } = options;

    try {
      // Store audit log in database
      await prisma.activityAudit.create({
        data: {
          action: event.action,
          activityId: event.activityId,
          organizationId: event.organizationId,
          careHomeId: event.careHomeId,
          userId: event.userId,
          details: event.details,
          timestamp: event.timestamp,
          severity,
          tags
        }
      });

      // Log to application logger
      logger[severity]('Activity audit event', {
        ...event,
        severity,
        tags
      });

      // Send telemetry if enabled
      if (!skipTelemetry) {
        activityTelemetry.recordActivityOperation(
          event.organizationId,
          event.careHomeId,
          event.details.type as ActivityType,
          event.details.status as ActivityStatus
        );
      }
    } catch (error) {
      logger.error('Failed to log audit event', { error, event });
      throw error;
    }
  }

  async logActivityCreated(
    activity: Activity,
    userId: string
  ): Promise<void> {
    await this.logActivityEvent(
      {
        action: 'ACTIVITY_CREATED',
        activityId: activity.id,
        organizationId: activity.organizationId,
        careHomeId: activity.careHomeId,
        userId,
        details: {
          type: activity.type,
          status: activity.status,
          title: activity.title
        },
        timestamp: new Date()
      },
      { tags: ['creation'] }
    );
  }

  async logActivityUpdated(
    activity: Activity,
    userId: string,
    changes: Record<string, any>
  ): Promise<void> {
    await this.logActivityEvent(
      {
        action: 'ACTIVITY_UPDATED',
        activityId: activity.id,
        organizationId: activity.organizationId,
        careHomeId: activity.careHomeId,
        userId,
        details: {
          type: activity.type,
          status: activity.status,
          changes
        },
        timestamp: new Date()
      },
      { tags: ['modification'] }
    );
  }

  async logActivityDeleted(
    activity: Activity,
    userId: string,
    reason?: string
  ): Promise<void> {
    await this.logActivityEvent(
      {
        action: 'ACTIVITY_DELETED',
        activityId: activity.id,
        organizationId: activity.organizationId,
        careHomeId: activity.careHomeId,
        userId,
        details: {
          type: activity.type,
          status: activity.status,
          reason
        },
        timestamp: new Date()
      },
      { 
        severity: 'warning',
        tags: ['deletion']
      }
    );
  }

  async logComplianceViolation(
    activity: Activity,
    userId: string,
    violation: {
      code: string;
      message: string;
      details?: Record<string, any>;
    }
  ): Promise<void> {
    await this.logActivityEvent(
      {
        action: 'COMPLIANCE_VIOLATION',
        activityId: activity.id,
        organizationId: activity.organizationId,
        careHomeId: activity.careHomeId,
        userId,
        details: {
          type: activity.type,
          status: activity.status,
          violation
        },
        timestamp: new Date()
      },
      {
        severity: 'error',
        tags: ['compliance', 'violation']
      }
    );
  }
}

// Export singleton instance
export const activityAuditLogger = ActivityAuditLogger.getInstance();
