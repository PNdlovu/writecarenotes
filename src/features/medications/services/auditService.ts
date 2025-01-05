import { prisma } from '@/lib/db';
import { Cache } from '@/lib/cache';
import { Logger } from '@/lib/logger';
import { ApiError } from '@/lib/errors';
import { tenantService } from './tenantService';

export class AuditService {
  private readonly cache: Cache;
  private readonly logger: Logger;

  constructor() {
    this.cache = new Cache();
    this.logger = new Logger('AuditService');
  }

  async logActivity(data: {
    tenantId: string;
    userId: string;
    activity: string;
    category: string;
    details: any;
    metadata?: any;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          ...data,
          timestamp: new Date(),
          ipAddress: this.getClientIp(),
          userAgent: this.getUserAgent()
        }
      });
    } catch (error) {
      this.logger.error('Failed to log activity', { error, data });
      // Don't throw error to prevent blocking main operations
    }
  }

  async getAuditTrail(params: {
    tenantId: string;
    startDate: Date;
    endDate: Date;
    category?: string;
    userId?: string;
    activity?: string;
    page?: number;
    pageSize?: number;
  }): Promise<any> {
    const { tenantId, startDate, endDate, category, userId, activity, page = 1, pageSize = 50 } = params;

    try {
      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where: {
            tenantId,
            timestamp: {
              gte: startDate,
              lte: endDate
            },
            ...(category && { category }),
            ...(userId && { userId }),
            ...(activity && { activity })
          },
          orderBy: {
            timestamp: 'desc'
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }),
        prisma.auditLog.count({
          where: {
            tenantId,
            timestamp: {
              gte: startDate,
              lte: endDate
            },
            ...(category && { category }),
            ...(userId && { userId }),
            ...(activity && { activity })
          }
        })
      ]);

      return {
        logs,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      };
    } catch (error) {
      this.logger.error('Failed to get audit trail', { error, params });
      throw new ApiError('Failed to get audit trail', error);
    }
  }

  async generateAuditReport(params: {
    tenantId: string;
    startDate: Date;
    endDate: Date;
    format: 'PDF' | 'CSV' | 'EXCEL';
    filters?: any;
  }): Promise<string> {
    const { tenantId, startDate, endDate, format, filters } = params;
    const config = await tenantService.getTenantConfig(tenantId);

    try {
      const logs = await this.getFilteredAuditLogs(params);
      const report = await this.formatAuditReport(logs, format, config);
      
      // Store report in secure storage
      const reportUrl = await this.storeReport(report, tenantId, format);
      
      await this.logActivity({
        tenantId,
        userId: 'SYSTEM',
        activity: 'GENERATE_AUDIT_REPORT',
        category: 'AUDIT',
        details: { format, filters, reportUrl }
      });

      return reportUrl;
    } catch (error) {
      this.logger.error('Failed to generate audit report', { error, params });
      throw new ApiError('Failed to generate audit report', error);
    }
  }

  private async getFilteredAuditLogs(params: any): Promise<any[]> {
    // Implement filtered log retrieval
    return [];
  }

  private async formatAuditReport(logs: any[], format: string, config: any): Promise<any> {
    // Implement report formatting
    return {};
  }

  private async storeReport(report: any, tenantId: string, format: string): Promise<string> {
    // Implement report storage
    return '';
  }

  private getClientIp(): string {
    // Implement IP retrieval
    return '';
  }

  private getUserAgent(): string {
    // Implement user agent retrieval
    return '';
  }
}

export const auditService = new AuditService();


