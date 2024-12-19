// src/features/incidents/services/incident-management-service.ts
/**
 * @fileoverview Incident management service implementation
 * @version 1.0.0
 * @created 2024-12-14
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { auditService } from '@/features/audit';
import { NotFoundError, ValidationError, InternalError, DatabaseError } from '@/lib/errors';
import { offlineManager } from '@/lib/offline';
import { i18n } from '@/lib/i18n';
import { Region } from '@/types/region';
import { analyticsService } from '@/lib/analytics';
import { notificationService } from '@/lib/notifications';
import { complianceService } from '@/lib/compliance';
import { exportService } from '@/lib/export';
import { encryptionService } from '@/lib/encryption';
import { 
  Incident, 
  IncidentType, 
  IncidentStatus, 
  IncidentSeverity,
  Investigation,
  SafeguardingReferral,
  IncidentActionItem,
  IncidentNotification,
  IncidentAnalytics,
  IncidentReport
} from '../types/incident.types';

export interface OfstedNotifiable {
  childSafeguarding: boolean;
  seriousChildhoodIllness: boolean;
  foodPoisoning: boolean;
  seriousAccident: boolean;
  significantChange: boolean;
  childProtectionReferral: boolean;
}

export class IncidentManagementService {
  /**
   * Create a new incident report with offline support
   */
  static async createIncident(
    organizationId: string,
    data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ): Promise<Incident> {
    try {
      // Handle offline mode
      if (offlineManager.isOffline()) {
        return await offlineManager.queueOperation('createIncident', {
          organizationId,
          data,
          timestamp: new Date(),
        });
      }

      // Create incident record
      const incident = await prisma.incident.create({
        data: {
          ...data,
          organizationId,
          status: IncidentStatus.REPORTED,
        },
      });

      // Create initial history entry with localized description
      await prisma.incidentHistory.create({
        data: {
          incidentId: incident.id,
          type: 'STATUS_CHANGE',
          description: i18n.t('incident.status.reported', { region: data.region }),
          user: data.reportedBy,
          timestamp: new Date(),
        },
      });

      // Handle high severity incidents
      if (data.severity === IncidentSeverity.CRITICAL) {
        await this.handleCriticalIncident(incident);
      }

      // Log audit trail
      await auditService.log({
        action: 'INCIDENT_CREATED',
        module: 'incidents',
        entityId: incident.id,
        entityType: 'incident',
        details: {
          type: data.type,
          severity: data.severity,
          location: data.location,
        },
      });

      return incident;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get incident by ID
   */
  static async getIncident(id: string, organizationId: string): Promise<Incident> {
    try {
      const incident = await prisma.incident.findFirst({
        where: { id, organizationId },
        include: {
          investigation: true,
          attachments: true,
          history: true,
          notifications: true,
          actionItems: true,
          safeguardingReferral: true,
        },
      });

      if (!incident) {
        throw new NotFoundError('Incident not found');
      }

      return incident;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update incident details
   */
  static async updateIncident(
    id: string,
    organizationId: string,
    data: Partial<Incident>
  ): Promise<Incident> {
    try {
      const incident = await prisma.incident.findFirst({
        where: { id, organizationId },
      });

      if (!incident) {
        throw new NotFoundError('Incident not found');
      }

      // Update incident record
      const updatedIncident = await prisma.incident.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
          version: { increment: 1 },
        },
      });

      // Log audit trail
      await auditService.log({
        action: 'INCIDENT_UPDATED',
        module: 'incidents',
        entityId: id,
        entityType: 'incident',
        details: {
          changes: data,
        },
      });

      return updatedIncident;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Start incident investigation
   */
  static async startInvestigation(
    incidentId: string,
    organizationId: string,
    data: Omit<Investigation, 'id' | 'incidentId'>
  ): Promise<Investigation> {
    try {
      const incident = await prisma.incident.findFirst({
        where: { id: incidentId, organizationId },
      });

      if (!incident) {
        throw new NotFoundError('Incident not found');
      }

      // Create investigation record
      const investigation = await prisma.investigation.create({
        data: {
          ...data,
          incidentId,
          status: 'IN_PROGRESS',
        },
      });

      // Update incident status
      await prisma.incident.update({
        where: { id: incidentId },
        data: {
          status: IncidentStatus.INVESTIGATING,
          updatedAt: new Date(),
          version: { increment: 1 },
        },
      });

      // Log audit trail
      await auditService.log({
        action: 'INVESTIGATION_STARTED',
        module: 'incidents',
        entityId: investigation.id,
        entityType: 'investigation',
        details: {
          incidentId,
          investigator: data.investigator,
        },
      });

      return investigation;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Complete incident investigation
   */
  static async completeInvestigation(
    investigationId: string,
    organizationId: string,
    data: Partial<Investigation>
  ): Promise<Investigation> {
    try {
      const investigation = await prisma.investigation.findFirst({
        where: {
          id: investigationId,
          incident: { organizationId },
        },
      });

      if (!investigation) {
        throw new NotFoundError('Investigation not found');
      }

      // Update investigation record
      const updatedInvestigation = await prisma.investigation.update({
        where: { id: investigationId },
        data: {
          ...data,
          status: 'COMPLETED',
          completedDate: new Date(),
        },
      });

      // Create action items for recommendations
      if (data.recommendations) {
        await this.createActionItems(investigation.incidentId, data.recommendations);
      }

      // Log audit trail
      await auditService.log({
        action: 'INVESTIGATION_COMPLETED',
        module: 'incidents',
        entityId: investigationId,
        entityType: 'investigation',
        details: {
          findings: data.findings,
          recommendations: data.recommendations,
        },
      });

      return updatedInvestigation;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create safeguarding referral
   */
  static async createSafeguardingReferral(
    incidentId: string,
    organizationId: string,
    data: Omit<SafeguardingReferral, 'id' | 'incidentId'>
  ): Promise<SafeguardingReferral> {
    try {
      const incident = await prisma.incident.findFirst({
        where: { id: incidentId, organizationId },
      });

      if (!incident) {
        throw new NotFoundError('Incident not found');
      }

      // Create referral record
      const referral = await prisma.safeguardingReferral.create({
        data: {
          ...data,
          incidentId,
          status: 'PENDING',
        },
      });

      // Update incident record
      await prisma.incident.update({
        where: { id: incidentId },
        data: {
          safeguardingReferral: true,
          updatedAt: new Date(),
          version: { increment: 1 },
        },
      });

      // Log audit trail
      await auditService.log({
        action: 'SAFEGUARDING_REFERRAL_CREATED',
        module: 'incidents',
        entityId: referral.id,
        entityType: 'safeguarding_referral',
        details: {
          incidentId,
          priority: data.priority,
          submittedTo: data.submittedTo,
        },
      });

      return referral;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate incident report for specified timeframe
   */
  static async generateReport(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalIncidents: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    averageResolutionTime: number;
    safeguardingReferrals: number;
    cqcReports: number;
    openInvestigations: number;
    completedInvestigations: number;
  }> {
    try {
      const incidents = await prisma.incident.findMany({
        where: {
          organizationId,
          dateTime: { gte: startDate, lte: endDate },
        },
        include: {
          investigation: true,
          safeguardingReferral: true,
        },
      });

      const byType = this.groupBy(incidents, 'type');
      const bySeverity = this.groupBy(incidents, 'severity');

      const completedIncidents = incidents.filter(
        i => i.status === IncidentStatus.CLOSED
      );
      const totalResolutionTime = completedIncidents.reduce((acc, incident) => {
        const resolutionTime = incident.updatedAt.getTime() - incident.dateTime.getTime();
        return acc + resolutionTime;
      }, 0);

      const averageResolutionTime = completedIncidents.length
        ? totalResolutionTime / completedIncidents.length
        : 0;

      return {
        totalIncidents: incidents.length,
        byType,
        bySeverity,
        averageResolutionTime,
        safeguardingReferrals: incidents.filter(i => i.safeguardingReferral).length,
        cqcReports: incidents.filter(i => i.cqcReportable).length,
        openInvestigations: incidents.filter(
          i => i.investigation?.status === 'IN_PROGRESS'
        ).length,
        completedInvestigations: incidents.filter(
          i => i.investigation?.status === 'COMPLETED'
        ).length,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate analytics report for incidents
   */
  static async generateAnalytics(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IncidentAnalytics> {
    try {
      const incidents = await prisma.incident.findMany({
        where: {
          organizationId,
          dateTime: { gte: startDate, lte: endDate },
        },
        include: {
          investigation: true,
          safeguardingReferral: true,
          actionItems: true,
        },
      });

      const analytics = await analyticsService.analyze('incidents', {
        data: incidents,
        metrics: [
          'incidentsByType',
          'incidentsBySeverity',
          'averageResolutionTime',
          'regulatoryCompliance',
          'staffInvolvement',
          'residentImpact',
          'trendAnalysis'
        ],
        filters: {
          organizationId,
          dateRange: { startDate, endDate }
        }
      });

      return analytics;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export incident data in various formats
   */
  static async exportIncidents(
    organizationId: string,
    format: 'PDF' | 'CSV' | 'EXCEL',
    filters?: {
      startDate?: Date;
      endDate?: Date;
      types?: IncidentType[];
      severity?: IncidentSeverity[];
      status?: IncidentStatus[];
    }
  ): Promise<Buffer> {
    try {
      const incidents = await prisma.incident.findMany({
        where: {
          organizationId,
          ...(filters?.startDate && filters?.endDate && {
            dateTime: { gte: filters.startDate, lte: filters.endDate }
          }),
          ...(filters?.types && { type: { in: filters.types } }),
          ...(filters?.severity && { severity: { in: filters.severity } }),
          ...(filters?.status && { status: { in: filters.status } })
        },
        include: {
          investigation: true,
          safeguardingReferral: true,
          actionItems: true,
          history: true,
        },
      });

      const report = await exportService.generateReport('incidents', {
        data: incidents,
        format,
        template: 'incident-report',
        metadata: {
          organizationId,
          generatedAt: new Date(),
          filters
        }
      });

      return report;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate compliance report for regulatory bodies
   */
  static async generateComplianceReport(
    organizationId: string,
    reportType: 'CQC' | 'OFSTED' | 'CIW' | 'CI' | 'RQIA',
    period: { start: Date; end: Date }
  ): Promise<IncidentReport> {
    try {
      const incidents = await prisma.incident.findMany({
        where: {
          organizationId,
          dateTime: { gte: period.start, lte: period.end },
          OR: [
            { cqcReportable: true },
            { safeguardingReferral: true }
          ]
        },
        include: {
          investigation: true,
          safeguardingReferral: true,
          actionItems: true,
          history: true,
        },
      });

      const report = await complianceService.generateReport({
        type: reportType,
        data: incidents,
        period,
        organizationId,
        metrics: [
          'notifiableIncidents',
          'timelinessOfReporting',
          'investigationOutcomes',
          'correctiveActions',
          'lessonLearned'
        ]
      });

      return report;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Archive old incidents with encryption
   */
  static async archiveIncidents(
    organizationId: string,
    cutoffDate: Date
  ): Promise<void> {
    try {
      const incidentsToArchive = await prisma.incident.findMany({
        where: {
          organizationId,
          dateTime: { lt: cutoffDate },
          status: IncidentStatus.CLOSED
        },
        include: {
          investigation: true,
          safeguardingReferral: true,
          actionItems: true,
          history: true,
          attachments: true
        }
      });

      // Encrypt sensitive data before archiving
      const encryptedIncidents = await Promise.all(
        incidentsToArchive.map(async incident => ({
          ...incident,
          sensitiveData: await encryptionService.encrypt(
            JSON.stringify({
              involvedResidents: incident.involvedResidents,
              witnesses: incident.witnesses,
              investigation: incident.investigation
            })
          )
        }))
      );

      // Store encrypted data in archive
      await prisma.archivedIncident.createMany({
        data: encryptedIncidents.map(incident => ({
          originalId: incident.id,
          organizationId: incident.organizationId,
          archivedData: incident.sensitiveData,
          archivalDate: new Date(),
          retentionPeriod: '7_YEARS' // As per healthcare data retention requirements
        }))
      });

      // Delete original records
      await prisma.incident.deleteMany({
        where: {
          id: { in: incidentsToArchive.map(i => i.id) }
        }
      });

      // Log audit trail
      await auditService.log({
        action: 'INCIDENTS_ARCHIVED',
        module: 'incidents',
        details: {
          count: incidentsToArchive.length,
          cutoffDate,
          retentionPeriod: '7_YEARS'
        }
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle critical severity incidents with localization support
   */
  private static async handleCriticalIncident(incident: Incident): Promise<void> {
    try {
      // Create notifications with localized templates
      const notifications: Omit<IncidentNotification, 'id'>[] = [
        {
          incidentId: incident.id,
          type: 'MANAGEMENT',
          recipient: 'care.manager@organization.com',
          status: 'PENDING',
        },
      ];

      if (incident.safeguardingReferral) {
        const safeguardingEmail = this.getSafeguardingEmail(incident.region);
        notifications.push({
          incidentId: incident.id,
          type: 'SAFEGUARDING',
          recipient: safeguardingEmail,
          status: 'PENDING',
        });
      }

      if (incident.cqcReportable) {
        const regulatorEmail = this.getRegulatorEmail(incident.region);
        notifications.push({
          incidentId: incident.id,
          type: 'CQC',
          recipient: regulatorEmail,
          status: 'PENDING',
        });
      }

      // Handle Ofsted notifications for England region and child-related incidents
      if (incident.region === Region.ENGLAND && this.isOfstedNotifiable(incident)) {
        notifications.push({
          incidentId: incident.id,
          type: 'OFSTED',
          recipient: 'enquiries@ofsted.gov.uk',
          status: 'PENDING',
          metadata: {
            notificationType: this.getOfstedNotificationType(incident),
            timeframe: '24 hours', // Ofsted requires notification within 24 hours for serious incidents
            reference: `OFSTED-${incident.id}`,
          }
        });

        // Add Ofsted-specific action items
        await prisma.incidentActionItem.createMany({
          data: [
            {
              incidentId: incident.id,
              title: i18n.t('incident.actions.ofsted_notification', { region: incident.region }),
              description: i18n.t('incident.actions.ofsted_notification_desc', { region: incident.region }),
              priority: 'HIGH',
              status: 'PENDING',
              assignedTo: incident.reportedBy,
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
              metadata: {
                regulatoryBody: 'OFSTED',
                requirement: 'STATUTORY',
                timeframe: '24_HOURS'
              }
            }
          ]
        });
      }

      await prisma.incidentNotification.createMany({
        data: notifications,
      });

      // Create high-priority action items with localized content
      await prisma.incidentActionItem.createMany({
        data: [
          {
            incidentId: incident.id,
            title: i18n.t('incident.actions.review_immediate', { region: incident.region }),
            description: i18n.t('incident.actions.review_immediate_desc', { region: incident.region }),
            priority: 'HIGH',
            status: 'PENDING',
            assignedTo: incident.reportedBy,
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
          {
            incidentId: incident.id,
            title: i18n.t('incident.actions.risk_assessment', { region: incident.region }),
            description: i18n.t('incident.actions.risk_assessment_desc', { region: incident.region }),
            priority: 'HIGH',
            status: 'PENDING',
            assignedTo: incident.reportedBy,
            dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
          },
        ],
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create action items from investigation recommendations
   */
  private static async createActionItems(
    incidentId: string,
    recommendations: string[]
  ): Promise<void> {
    const actionItems = recommendations.map(recommendation => ({
      incidentId,
      title: `Implement recommendation: ${recommendation.substring(0, 50)}...`,
      description: recommendation,
      priority: 'HIGH',
      status: 'PENDING',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }));

    await prisma.incidentActionItem.createMany({
      data: actionItems,
    });
  }

  /**
   * Get appropriate safeguarding email based on region
   */
  private static getSafeguardingEmail(region: Region): string {
    switch (region) {
      case Region.ENGLAND:
        return 'safeguarding@local.gov.uk';
      case Region.WALES:
        return 'diogelu@cymru.gov.uk';
      case Region.SCOTLAND:
        return 'safeguarding@scotland.gov.uk';
      case Region.NORTHERN_IRELAND:
        return 'safeguarding@health-ni.gov.uk';
      default:
        return 'safeguarding@authority.gov.uk';
    }
  }

  /**
   * Get appropriate regulator email based on region
   */
  private static getRegulatorEmail(region: Region): string {
    switch (region) {
      case Region.ENGLAND:
        return 'notifications@cqc.org.uk';
      case Region.WALES:
        return 'notifications@ciw.gov.wales';
      case Region.SCOTLAND:
        return 'notifications@careinspectorate.gov.scot';
      case Region.NORTHERN_IRELAND:
        return 'notifications@rqia.org.uk';
      default:
        return 'notifications@regulator.gov.uk';
    }
  }

  /**
   * Check if an incident requires Ofsted notification
   */
  private static isOfstedNotifiable(incident: Incident): boolean {
    // Check if incident involves children or young people
    const isChildRelated = incident.involvedResidents.some(resident => 
      resident.metadata?.age && resident.metadata.age < 18
    );

    if (!isChildRelated) return false;

    const ofstedCriteria: OfstedNotifiable = {
      childSafeguarding: incident.type === IncidentType.ABUSE_ALLEGATION,
      seriousChildhoodIllness: incident.type === IncidentType.SERIOUS_INJURY && incident.severity === IncidentSeverity.CRITICAL,
      foodPoisoning: incident.type === 'FOOD_POISONING',
      seriousAccident: incident.severity === IncidentSeverity.CRITICAL,
      significantChange: incident.type === 'SIGNIFICANT_CHANGE',
      childProtectionReferral: incident.safeguardingReferral
    };

    return Object.values(ofstedCriteria).some(criterion => criterion === true);
  }

  /**
   * Get the appropriate Ofsted notification type
   */
  private static getOfstedNotificationType(incident: Incident): string {
    if (incident.type === IncidentType.ABUSE_ALLEGATION) {
      return 'CHILD_PROTECTION_CONCERN';
    } else if (incident.type === IncidentType.SERIOUS_INJURY) {
      return 'SERIOUS_ACCIDENT_OR_ILLNESS';
    } else if (incident.type === 'FOOD_POISONING') {
      return 'FOOD_POISONING';
    } else if (incident.safeguardingReferral) {
      return 'CHILD_PROTECTION_REFERRAL';
    } else {
      return 'SIGNIFICANT_EVENT';
    }
  }

  /**
   * Group array of objects by key
   */
  private static groupBy(items: any[], key: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Handle and transform errors
   */
  private static handleError(error: unknown): Error {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      return error;
    }

    if (error instanceof Error) {
      return new InternalError(error.message);
    }

    return new DatabaseError('An unexpected error occurred');
  }

  /**
   * Batch process multiple incidents
   */
  static async batchProcessIncidents(
    organizationId: string,
    operations: Array<{
      incidentId: string;
      action: 'UPDATE_STATUS' | 'ASSIGN_INVESTIGATOR' | 'ADD_ACTION_ITEM' | 'CLOSE';
      data: any;
    }>
  ): Promise<{ succeeded: string[]; failed: Array<{ id: string; error: string }> }> {
    const results = {
      succeeded: [] as string[],
      failed: [] as Array<{ id: string; error: string }>
    };

    try {
      await prisma.$transaction(async (tx) => {
        for (const op of operations) {
          try {
            switch (op.action) {
              case 'UPDATE_STATUS':
                await tx.incident.update({
                  where: { id: op.incidentId },
                  data: { status: op.data.status }
                });
                break;
              case 'ASSIGN_INVESTIGATOR':
                await tx.investigation.update({
                  where: { incidentId: op.incidentId },
                  data: { investigator: op.data.investigator }
                });
                break;
              case 'ADD_ACTION_ITEM':
                await tx.incidentActionItem.create({
                  data: {
                    ...op.data,
                    incidentId: op.incidentId
                  }
                });
                break;
              case 'CLOSE':
                await tx.incident.update({
                  where: { id: op.incidentId },
                  data: { 
                    status: IncidentStatus.CLOSED,
                    closedAt: new Date(),
                    closedBy: op.data.userId
                  }
                });
                break;
            }
            results.succeeded.push(op.incidentId);
          } catch (error) {
            results.failed.push({
              id: op.incidentId,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      });

      // Log batch operation
      await auditService.log({
        action: 'BATCH_PROCESS_INCIDENTS',
        module: 'incidents',
        details: {
          totalOperations: operations.length,
          succeeded: results.succeeded.length,
          failed: results.failed.length
        }
      });

      return results;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Configure and manage incident workflows
   */
  static async configureWorkflow(
    organizationId: string,
    workflowConfig: {
      type: IncidentType;
      steps: Array<{
        name: string;
        order: number;
        requiredActions: string[];
        autoNotifications?: boolean;
        escalationRules?: {
          condition: string;
          action: string;
        }[];
      }>;
      autoAssignment?: {
        roles: string[];
        roundRobin?: boolean;
      };
      slaConfig?: {
        responseTime: number;
        resolutionTime: number;
        escalationLevels: number;
      };
    }
  ): Promise<void> {
    try {
      await prisma.incidentWorkflow.upsert({
        where: {
          organizationId_type: {
            organizationId,
            type: workflowConfig.type
          }
        },
        create: {
          organizationId,
          type: workflowConfig.type,
          config: workflowConfig
        },
        update: {
          config: workflowConfig
        }
      });

      // Validate and update existing incidents
      await this.updateExistingIncidentsWorkflow(organizationId, workflowConfig);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Perform risk assessment for an incident
   */
  static async performRiskAssessment(
    incidentId: string,
    assessmentData: {
      likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
      impact: 'HIGH' | 'MEDIUM' | 'LOW';
      mitigationMeasures: string[];
      assessedBy: {
        id: string;
        name: string;
        role: string;
      };
      reviewDate: Date;
    }
  ): Promise<void> {
    try {
      const incident = await prisma.incident.findUnique({
        where: { id: incidentId }
      });

      if (!incident) {
        throw new NotFoundError('Incident not found');
      }

      // Calculate risk score
      const riskMatrix = {
        HIGH: { HIGH: 'CRITICAL', MEDIUM: 'HIGH', LOW: 'MEDIUM' },
        MEDIUM: { HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW' },
        LOW: { HIGH: 'MEDIUM', MEDIUM: 'LOW', LOW: 'LOW' }
      };

      const riskScore = riskMatrix[assessmentData.likelihood][assessmentData.impact];

      // Create risk assessment record
      await prisma.incidentRiskAssessment.create({
        data: {
          incidentId,
          likelihood: assessmentData.likelihood,
          impact: assessmentData.impact,
          riskScore,
          mitigationMeasures: assessmentData.mitigationMeasures,
          assessedBy: assessmentData.assessedBy,
          reviewDate: assessmentData.reviewDate,
          status: 'ACTIVE'
        }
      });

      // Update incident if risk is high
      if (riskScore === 'CRITICAL' || riskScore === 'HIGH') {
        await this.handleHighRiskIncident(incidentId, riskScore);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Integrate with external incident reporting systems
   */
  static async syncWithExternalSystem(
    organizationId: string,
    system: 'NHS' | 'SOCIAL_SERVICES' | 'PUBLIC_HEALTH' | 'LOCAL_AUTHORITY',
    config: {
      apiKey: string;
      endpoint: string;
      syncDirection: 'PUSH' | 'PULL' | 'BIDIRECTIONAL';
      filters?: {
        types?: IncidentType[];
        severity?: IncidentSeverity[];
        dateRange?: { start: Date; end: Date };
      };
    }
  ): Promise<void> {
    try {
      // Validate configuration
      await this.validateExternalSystemConfig(config);

      // Store integration configuration
      await prisma.externalIntegration.upsert({
        where: {
          organizationId_system: {
            organizationId,
            system
          }
        },
        create: {
          organizationId,
          system,
          config: {
            ...config,
            apiKey: await encryptionService.encrypt(config.apiKey)
          },
          status: 'ACTIVE',
          lastSync: new Date()
        },
        update: {
          config: {
            ...config,
            apiKey: await encryptionService.encrypt(config.apiKey)
          },
          status: 'ACTIVE'
        }
      });

      // Initialize sync process
      await this.initializeExternalSync(organizationId, system, config);

      // Log integration setup
      await auditService.log({
        action: 'EXTERNAL_SYSTEM_INTEGRATION',
        module: 'incidents',
        details: {
          system,
          syncDirection: config.syncDirection,
          organizationId
        }
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle high risk incidents
   */
  private static async handleHighRiskIncident(
    incidentId: string,
    riskScore: string
  ): Promise<void> {
    try {
      const incident = await prisma.incident.update({
        where: { id: incidentId },
        data: {
          severity: IncidentSeverity.CRITICAL,
          status: IncidentStatus.REQUIRES_REVIEW
        },
        include: {
          investigation: true
        }
      });

      // Create urgent action items
      await prisma.incidentActionItem.createMany({
        data: [
          {
            incidentId,
            title: i18n.t('incident.actions.urgent_risk_review'),
            description: i18n.t('incident.actions.urgent_risk_review_desc', { riskScore }),
            priority: 'HIGH',
            status: 'PENDING',
            dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
          },
          {
            incidentId,
            title: i18n.t('incident.actions.risk_mitigation'),
            description: i18n.t('incident.actions.risk_mitigation_desc'),
            priority: 'HIGH',
            status: 'PENDING',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          }
        ]
      });

      // Notify relevant parties
      await notificationService.sendUrgentNotifications('HIGH_RISK_INCIDENT', {
        incidentId,
        riskScore,
        type: incident.type,
        location: incident.location
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }
}


