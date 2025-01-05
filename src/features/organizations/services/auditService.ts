import { AuditEvent, AuditEventType, AuditLogEntry } from '../types/audit.types';
import { Organization } from '../types/organization.types';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export class AuditService {
  async logEvent(event: AuditEvent): Promise<void> {
    const user = await getCurrentUser();
    const logEntry: AuditLogEntry = {
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      eventType: event.type,
      userId: user?.id,
      organizationId: event.organizationId,
      resourceId: event.resourceId,
      resourceType: event.resourceType,
      action: event.action,
      changes: event.changes,
      metadata: {
        userIp: event.metadata?.userIp,
        userAgent: event.metadata?.userAgent,
        region: event.metadata?.region,
      }
    };

    await db.auditLog.create({ data: logEntry });
  }

  async getAuditLog(organizationId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    eventType?: AuditEventType;
    userId?: string;
  }): Promise<AuditLogEntry[]> {
    return await db.auditLog.findMany({
      where: {
        organizationId,
        ...(filters?.startDate && { timestamp: { gte: filters.startDate } }),
        ...(filters?.endDate && { timestamp: { lte: filters.endDate } }),
        ...(filters?.eventType && { eventType: filters.eventType }),
        ...(filters?.userId && { userId: filters.userId }),
      },
      orderBy: { timestamp: 'desc' },
    });
  }
}


