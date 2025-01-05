/**
 * @fileoverview Audit Logger Service
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'EXPORT'
  | 'IMPORT'
  | 'POST'
  | 'VOID';

export type AuditEntityType =
  | 'ACCOUNT'
  | 'JOURNAL_ENTRY'
  | 'VAT_RETURN'
  | 'RECONCILIATION'
  | 'COST_CENTER';

export interface AuditLogEntry {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  userId: string;
  organizationId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLoggerService {
  async log(entry: AuditLogEntry) {
    return prisma.auditLog.create({
      data: {
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        userId: entry.userId,
        organizationId: entry.organizationId,
        metadata: entry.metadata,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        timestamp: new Date()
      }
    });
  }

  async getAuditLogs(
    organizationId: string,
    filters?: {
      entityType?: AuditEntityType;
      entityId?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      action?: AuditAction;
    }
  ) {
    return prisma.auditLog.findMany({
      where: {
        organizationId,
        ...(filters?.entityType && { entityType: filters.entityType }),
        ...(filters?.entityId && { entityId: filters.entityId }),
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.startDate && {
          timestamp: {
            gte: filters.startDate
          }
        }),
        ...(filters?.endDate && {
          timestamp: {
            lte: filters.endDate
          }
        }),
        ...(filters?.action && { action: filters.action })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
  }

  async getEntityHistory(
    entityType: AuditEntityType,
    entityId: string,
    organizationId: string
  ) {
    return prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
        organizationId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
  }

  async getUserActivity(
    userId: string,
    organizationId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    return prisma.auditLog.findMany({
      where: {
        userId,
        organizationId,
        ...(startDate && {
          timestamp: {
            gte: startDate
          }
        }),
        ...(endDate && {
          timestamp: {
            lte: endDate
          }
        })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
  }
} 