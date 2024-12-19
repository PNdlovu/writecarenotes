import { prisma } from './prisma';
import { AuditLogAction, AuditLogStatus, AuditLogActorType } from '@/types/audit';

export interface AuditLogOptions {
  actorId: string;
  actorType?: AuditLogActorType;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export interface AuditLogEntry {
  entityType: string;
  entityId: string;
  action: AuditLogAction;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
}

export class AuditService {
  private static instance: AuditService;

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  async log(entry: AuditLogEntry, options: AuditLogOptions): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          entityType: entry.entityType,
          entityId: entry.entityId,
          action: entry.action,
          actorId: options.actorId,
          actorType: options.actorType || 'USER',
          changes: entry.changes,
          details: options.details,
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
          status: 'SUCCESS',
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Still try to log the error
      await this.logError(entry, options, error);
    }
  }

  async logError(
    entry: AuditLogEntry,
    options: AuditLogOptions,
    error: any
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          entityType: entry.entityType,
          entityId: entry.entityId,
          action: entry.action,
          actorId: options.actorId,
          actorType: options.actorType || 'USER',
          changes: entry.changes,
          details: options.details,
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
          status: 'FAILURE',
          errorDetails: error.message || JSON.stringify(error),
        },
      });
    } catch (secondaryError) {
      console.error('Failed to create error audit log:', secondaryError);
    }
  }

  async getAuditLogs(params: {
    entityType?: string;
    entityId?: string;
    action?: AuditLogAction;
    actorId?: string;
    status?: AuditLogStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (params.entityType) where.entityType = params.entityType;
    if (params.entityId) where.entityId = params.entityId;
    if (params.action) where.action = params.action;
    if (params.actorId) where.actorId = params.actorId;
    if (params.status) where.status = params.status;
    if (params.startDate || params.endDate) {
      where.timestamp = {};
      if (params.startDate) where.timestamp.gte = params.startDate;
      if (params.endDate) where.timestamp.lte = params.endDate;
    }

    return await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: params.limit || 50,
      skip: params.offset || 0,
    });
  }

  async archiveOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const oldLogs = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    if (oldLogs.length === 0) return 0;

    await prisma.$transaction(async (tx) => {
      // Move to archive
      await tx.auditLogArchive.createMany({
        data: oldLogs.map(log => ({
          ...log,
          archivedAt: new Date(),
        })),
      });

      // Delete from main table
      await tx.auditLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });
    });

    return oldLogs.length;
  }

  async getEntityHistory(entityType: string, entityId: string) {
    const [current, archived] = await Promise.all([
      prisma.auditLog.findMany({
        where: { entityType, entityId },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLogArchive.findMany({
        where: { entityType, entityId },
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    return [...current, ...archived].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }
}


