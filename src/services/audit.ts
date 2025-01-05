/**
 * @fileoverview Audit Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Service for handling audit logging across the application
 */

import { prisma } from '@/lib/prisma';
import { Tenant } from '@/lib/tenant/tenantContext';
import { Prisma, AuditLog } from '@prisma/client';

export enum AuditEventType {
  ACCOUNT_CREATED = 'CREATE',
  ACCOUNT_UPDATED = 'UPDATE',
  TRANSACTION_CREATED = 'CREATE',
  TRANSACTION_POSTED = 'SUBMIT',
  TRANSACTION_VOIDED = 'REJECT',
  RECONCILIATION_PERFORMED = 'SUBMIT',
  RECONCILIATION_ADJUSTED = 'UPDATE'
}

export interface AuditMetadata {
  [key: string]: any;
  accountId?: string;
  transactionId?: string;
  reconciliationId?: string;
  amount?: number;
  beforeState?: any;
  afterState?: any;
  reason?: string;
}

export class AuditService {
  private tenant: Tenant;

  constructor(tenant: Tenant) {
    this.tenant = tenant;
  }

  async logEvent(params: {
    eventType: AuditEventType;
    userId: string;
    metadata: AuditMetadata;
    entityType: string;
    entityId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const { eventType, userId, metadata, entityType, entityId, ipAddress, userAgent } = params;

    const data: Prisma.AuditLogUncheckedCreateInput = {
      organizationId: this.tenant.id,
      entityType,
      entityId,
      action: eventType,
      userId,
      details: metadata as Prisma.JsonObject,
      ipAddress,
      userAgent
    };

    await prisma.auditLog.create({ data });
  }

  async getAuditTrail(params: {
    startDate?: Date;
    endDate?: Date;
    eventTypes?: AuditEventType[];
    userId?: string;
    accountId?: string;
    transactionId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    logs: AuditLog[];
    total: number;
  }> {
    const {
      startDate,
      endDate,
      eventTypes,
      userId,
      accountId,
      transactionId,
      page = 1,
      limit = 50
    } = params;

    const where: Prisma.AuditLogWhereInput = {
      organizationId: this.tenant.id,
      ...(startDate && endDate && {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }),
      ...(eventTypes?.length && {
        action: {
          in: eventTypes
        }
      }),
      ...(userId && { userId }),
      ...(accountId && {
        AND: [
          { entityType: 'ACCOUNT' },
          { entityId: accountId }
        ]
      }),
      ...(transactionId && {
        AND: [
          { entityType: 'JOURNAL_ENTRY' },
          { entityId: transactionId }
        ]
      })
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      logs,
      total
    };
  }

  async getAccountHistory(accountId: string): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: {
        organizationId: this.tenant.id,
        entityType: 'ACCOUNT',
        entityId: accountId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getTransactionHistory(transactionId: string): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: {
        organizationId: this.tenant.id,
        entityType: 'JOURNAL_ENTRY',
        entityId: transactionId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async exportAuditTrail(params: {
    startDate?: Date;
    endDate?: Date;
    eventTypes?: AuditEventType[];
    userId?: string;
    accountId?: string;
    transactionId?: string;
    format: 'CSV' | 'JSON' | 'PDF';
  }): Promise<{
    data: string;
    filename: string;
    contentType: string;
  }> {
    const {
      startDate,
      endDate,
      eventTypes,
      userId,
      accountId,
      transactionId,
      format
    } = params;

    const where: Prisma.AuditLogWhereInput = {
      organizationId: this.tenant.id,
      ...(startDate && endDate && {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }),
      ...(eventTypes?.length && {
        action: {
          in: eventTypes
        }
      }),
      ...(userId && { userId }),
      ...(accountId && {
        AND: [
          { entityType: 'ACCOUNT' },
          { entityId: accountId }
        ]
      }),
      ...(transactionId && {
        AND: [
          { entityType: 'JOURNAL_ENTRY' },
          { entityId: transactionId }
        ]
      })
    };

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    switch (format) {
      case 'CSV': {
        const csvRows = [
          // Header
          ['Timestamp', 'Entity Type', 'Entity ID', 'Action', 'User ID', 'IP Address', 'User Agent', 'Details'].join(','),
          // Data rows
          ...logs.map(log => [
            log.createdAt.toISOString(),
            log.entityType,
            log.entityId,
            log.action,
            log.userId,
            log.ipAddress || '',
            log.userAgent || '',
            JSON.stringify(log.details)
          ].join(','))
        ];

        return {
          data: csvRows.join('\n'),
          filename: `audit_trail_${startDate?.toISOString().split('T')[0]}_${endDate?.toISOString().split('T')[0]}.csv`,
          contentType: 'text/csv'
        };
      }

      case 'JSON': {
        const jsonData = logs.map(log => ({
          timestamp: log.createdAt,
          entityType: log.entityType,
          entityId: log.entityId,
          action: log.action,
          userId: log.userId,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          details: log.details
        }));

        return {
          data: JSON.stringify(jsonData, null, 2),
          filename: `audit_trail_${startDate?.toISOString().split('T')[0]}_${endDate?.toISOString().split('T')[0]}.json`,
          contentType: 'application/json'
        };
      }

      case 'PDF': {
        // Placeholder for PDF generation
        const textContent = logs.map(log => `
          Timestamp: ${log.createdAt.toISOString()}
          Entity Type: ${log.entityType}
          Entity ID: ${log.entityId}
          Action: ${log.action}
          User ID: ${log.userId}
          IP Address: ${log.ipAddress || 'N/A'}
          User Agent: ${log.userAgent || 'N/A'}
          Details: ${JSON.stringify(log.details, null, 2)}
          ------------------------------
        `).join('\n');

        return {
          data: textContent,
          filename: `audit_trail_${startDate?.toISOString().split('T')[0]}_${endDate?.toISOString().split('T')[0]}.txt`,
          contentType: 'text/plain'
        };
      }

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async exportEntityHistory(params: {
    entityType: string;
    entityId: string;
    format: 'CSV' | 'JSON' | 'PDF';
  }): Promise<{
    data: string;
    filename: string;
    contentType: string;
  }> {
    const { entityType, entityId, format } = params;

    const where: Prisma.AuditLogWhereInput = {
      organizationId: this.tenant.id,
      entityType,
      entityId
    };

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    switch (format) {
      case 'CSV': {
        const csvRows = [
          // Header
          ['Timestamp', 'Action', 'User ID', 'IP Address', 'User Agent', 'Details'].join(','),
          // Data rows
          ...logs.map(log => [
            log.createdAt.toISOString(),
            log.action,
            log.userId,
            log.ipAddress || '',
            log.userAgent || '',
            JSON.stringify(log.details)
          ].join(','))
        ];

        return {
          data: csvRows.join('\n'),
          filename: `${entityType.toLowerCase()}_${entityId}_history.csv`,
          contentType: 'text/csv'
        };
      }

      case 'JSON': {
        const jsonData = logs.map(log => ({
          timestamp: log.createdAt,
          action: log.action,
          userId: log.userId,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          details: log.details
        }));

        return {
          data: JSON.stringify(jsonData, null, 2),
          filename: `${entityType.toLowerCase()}_${entityId}_history.json`,
          contentType: 'application/json'
        };
      }

      case 'PDF': {
        // Placeholder for PDF generation
        const textContent = logs.map(log => `
          Timestamp: ${log.createdAt.toISOString()}
          Action: ${log.action}
          User ID: ${log.userId}
          IP Address: ${log.ipAddress || 'N/A'}
          User Agent: ${log.userAgent || 'N/A'}
          Details: ${JSON.stringify(log.details, null, 2)}
          ------------------------------
        `).join('\n');

        return {
          data: textContent,
          filename: `${entityType.toLowerCase()}_${entityId}_history.txt`,
          contentType: 'text/plain'
        };
      }

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
} 