import { PrismaClient } from '@prisma/client';
import { AuditService } from '../../audit/services/auditService';
import { EnterpriseAnalyticsService } from './enterpriseAnalyticsService';
import { NotificationService } from '../../../services/notificationService';

interface ReportConfig {
  type: 'COMPLIANCE' | 'QUALITY' | 'INCIDENT' | 'RESOURCE' | 'COMPREHENSIVE';
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON';
  filters?: Record<string, any>;
  recipients?: string[];
}

interface ReportSchedule {
  id: string;
  reportConfig: ReportConfig;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  nextRunDate: Date;
  recipients: string[];
  status: 'ACTIVE' | 'PAUSED';
}

interface ReportMetadata {
  id: string;
  type: string;
  generatedAt: Date;
  period: string;
  format: string;
  size: number;
  url: string;
  expiresAt: Date;
}

export class EnterpriseReportingService {
  private static instance: EnterpriseReportingService;
  private prisma: PrismaClient;
  private auditService: AuditService;
  private analyticsService: EnterpriseAnalyticsService;
  private notificationService: NotificationService;

  private constructor(
    prisma: PrismaClient,
    analyticsService: EnterpriseAnalyticsService,
    notificationService: NotificationService
  ) {
    this.prisma = prisma;
    this.auditService = AuditService.getInstance();
    this.analyticsService = analyticsService;
    this.notificationService = notificationService;
  }

  public static getInstance(
    prisma: PrismaClient,
    analyticsService: EnterpriseAnalyticsService,
    notificationService: NotificationService
  ): EnterpriseReportingService {
    if (!EnterpriseReportingService.instance) {
      EnterpriseReportingService.instance = new EnterpriseReportingService(
        prisma,
        analyticsService,
        notificationService
      );
    }
    return EnterpriseReportingService.instance;
  }

  async generateReport(
    organizationId: string,
    config: ReportConfig
  ): Promise<ReportMetadata> {
    try {
      await this.auditService.logActivity(
        'REPORT',
        organizationId,
        'GENERATE_REPORT',
        'SYSTEM',
        'SYSTEM',
        { config }
      );

      const reportData = await this.gatherReportData(organizationId, config);
      const formattedReport = await this.formatReport(reportData, config.format);
      const metadata = await this.saveReport(organizationId, formattedReport, config);

      if (config.recipients?.length) {
        await this.notifyRecipients(config.recipients, metadata);
      }

      return metadata;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async scheduleReport(
    organizationId: string,
    config: ReportConfig,
    schedule: Omit<ReportSchedule, 'id'>
  ): Promise<ReportSchedule> {
    try {
      const newSchedule = await this.prisma.reportSchedule.create({
        data: {
          organizationId,
          config: config as any,
          frequency: schedule.frequency,
          nextRunDate: schedule.nextRunDate,
          recipients: schedule.recipients,
          status: schedule.status
        }
      });

      await this.auditService.logActivity(
        'REPORT_SCHEDULE',
        organizationId,
        'CREATE_SCHEDULE',
        'SYSTEM',
        'SYSTEM',
        { schedule: newSchedule }
      );

      return newSchedule as ReportSchedule;
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  }

  async getReportHistory(
    organizationId: string,
    filters: {
      type?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ reports: ReportMetadata[]; total: number }> {
    try {
      const [reports, total] = await Promise.all([
        this.prisma.report.findMany({
          where: {
            organizationId,
            type: filters.type,
            generatedAt: {
              gte: filters.startDate,
              lte: filters.endDate
            }
          },
          skip: filters.offset,
          take: filters.limit,
          orderBy: {
            generatedAt: 'desc'
          }
        }),
        this.prisma.report.count({
          where: {
            organizationId,
            type: filters.type,
            generatedAt: {
              gte: filters.startDate,
              lte: filters.endDate
            }
          }
        })
      ]);

      return {
        reports: reports as ReportMetadata[],
        total
      };
    } catch (error) {
      console.error('Error fetching report history:', error);
      throw error;
    }
  }

  async getScheduledReports(
    organizationId: string
  ): Promise<ReportSchedule[]> {
    try {
      const schedules = await this.prisma.reportSchedule.findMany({
        where: {
          organizationId,
          status: 'ACTIVE'
        }
      });

      return schedules as ReportSchedule[];
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      throw error;
    }
  }

  private async gatherReportData(
    organizationId: string,
    config: ReportConfig
  ): Promise<any> {
    switch (config.type) {
      case 'COMPLIANCE':
        return await this.analyticsService.calculateComplianceScores(organizationId);
      case 'QUALITY':
        return await this.analyticsService.generateQualityReport(organizationId);
      case 'COMPREHENSIVE':
        return await this.gatherComprehensiveData(organizationId, config);
      default:
        throw new Error(`Unsupported report type: ${config.type}`);
    }
  }

  private async gatherComprehensiveData(
    organizationId: string,
    config: ReportConfig
  ): Promise<any> {
    const [compliance, quality, metrics] = await Promise.all([
      this.analyticsService.calculateComplianceScores(organizationId),
      this.analyticsService.generateQualityReport(organizationId),
      this.analyticsService.generateOrganizationMetrics(organizationId, config.period)
    ]);

    return {
      compliance,
      quality,
      metrics,
      generatedAt: new Date(),
      period: config.period
    };
  }

  private async formatReport(data: any, format: string): Promise<any> {
    // Implementation for formatting report based on specified format
    return data;
  }

  private async saveReport(
    organizationId: string,
    report: any,
    config: ReportConfig
  ): Promise<ReportMetadata> {
    // Implementation for saving report and generating metadata
    return {} as ReportMetadata;
  }

  private async notifyRecipients(
    recipients: string[],
    metadata: ReportMetadata
  ): Promise<void> {
    try {
      await Promise.all(
        recipients.map(recipient =>
          this.notificationService.sendNotification({
            type: 'REPORT_READY',
            recipient,
            data: {
              reportId: metadata.id,
              type: metadata.type,
              url: metadata.url,
              expiresAt: metadata.expiresAt
            }
          })
        )
      );
    } catch (error) {
      console.error('Error notifying recipients:', error);
      // Don't throw error to prevent report generation from failing
    }
  }
}
