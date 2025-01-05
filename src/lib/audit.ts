/**
 * WriteCareNotes.com
 * @fileoverview Audit Logging Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { prisma } from './prisma'
import { AuditLog } from '@prisma/client'
import { ApiError } from './errors'

interface AuditLogInput {
  userId: string
  action: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

interface AuditQuery {
  userId?: string
  action?: string
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
}

class AuditService {
  private static instance: AuditService;

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Create an audit log entry
   */
  async log(data: AuditLogInput): Promise<AuditLog> {
    try {
      const auditLog = await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          details: data.details || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      return auditLog;
    } catch (error) {
      throw ApiError.internal('Failed to create audit log');
    }
  }

  /**
   * Query audit logs with filtering and pagination
   */
  async queryAuditLogs(query: AuditQuery) {
    try {
      const {
        userId,
        action,
        startDate,
        endDate,
        page = 1,
        limit = 50,
      } = query;

      const where = {
        ...(userId && { userId }),
        ...(action && { action }),
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      };

      const [total, logs] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      return {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw ApiError.internal('Failed to query audit logs');
    }
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(userId: string, limit = 50) {
    try {
      const logs = await prisma.auditLog.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });

      return logs;
    } catch (error) {
      throw ApiError.internal('Failed to fetch user audit logs');
    }
  }

  /**
   * Get audit logs for a specific action type
   */
  async getActionAuditLogs(action: string, limit = 50) {
    try {
      const logs = await prisma.auditLog.findMany({
        where: { action },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });

      return logs;
    } catch (error) {
      throw ApiError.internal('Failed to fetch action audit logs');
    }
  }

  /**
   * Export audit logs to JSON
   */
  async exportAuditLogs(query: AuditQuery) {
    try {
      const { logs } = await this.queryAuditLogs({
        ...query,
        limit: 1000, // Increased limit for export
      });

      return logs.map(log => ({
        id: log.id,
        userId: log.userId,
        action: log.action,
        details: log.details,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      }));
    } catch (error) {
      throw ApiError.internal('Failed to export audit logs');
    }
  }

  /**
   * Clean up old audit logs
   * Note: This should be run as a scheduled job
   */
  async cleanupOldAuditLogs(retentionDays: number) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const { count } = await prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      return { deletedCount: count };
    } catch (error) {
      throw ApiError.internal('Failed to cleanup audit logs');
    }
  }
}

export const auditService = AuditService.getInstance();


