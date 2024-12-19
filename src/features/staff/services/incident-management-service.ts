import { prisma } from '@/lib/prisma';
import { MonitoringService } from './monitoring-service';
import { AuditService } from './audit-service';

interface IncidentReport {
  id: string;
  type: string;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  location: string;
  dateTime: Date;
  reportedBy: string;
  involvedResidents: string[];
  involvedStaff: string[];
  witnesses: string[];
  immediateActions: string[];
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  notificationsSent: boolean;
  safeguardingReferral: boolean;
  cqcReportable: boolean;
}

interface Investigation {
  id: string;
  incidentId: string;
  investigator: string;
  findings: string[];
  rootCauses: string[];
  recommendations: string[];
  preventiveMeasures: string[];
  dateCompleted?: Date;
}

export class IncidentManagementService {
  private static readonly REPORTABLE_INCIDENTS = [
    'MEDICATION_ERROR',
    'FALL_WITH_INJURY',
    'ABUSE_ALLEGATION',
    'UNEXPECTED_DEATH',
    'SERIOUS_INJURY',
    'INFECTIOUS_OUTBREAK',
    'MISSING_PERSON',
    'RESTRAINT_USE',
  ];

  private static readonly NOTIFICATION_REQUIREMENTS = {
    CRITICAL: ['CQC', 'MANAGEMENT', 'NOK', 'SAFEGUARDING'],
    MAJOR: ['MANAGEMENT', 'NOK'],
    MINOR: ['MANAGEMENT'],
  };

  static async reportIncident(
    organizationId: string,
    data: Omit<IncidentReport, 'id' | 'status' | 'notificationsSent'>
  ): Promise<IncidentReport> {
    try {
      // Create incident report
      const incident = await prisma.incident.create({
        data: {
          ...data,
          organizationId,
          status: 'reported',
          notificationsSent: false,
        },
      });

      // Determine if CQC reporting is required
      const cqcReportable = this.REPORTABLE_INCIDENTS.includes(data.type);

      // Handle immediate notifications
      await this.handleNotifications(incident, organizationId);

      // Create safeguarding referral if needed
      if (data.safeguardingReferral) {
        await this.createSafeguardingReferral(incident, organizationId);
      }

      // Log audit trail
      await AuditService.log({
        action: 'INCIDENT_REPORTED',
        module: 'incidents',
        entityId: incident.id,
        entityType: 'incident',
        details: { type: data.type, severity: data.severity },
      });

      // Track incident
      MonitoringService.trackEvent({
        category: 'incidents',
        action: 'report_incident',
        metadata: {
          type: data.type,
          severity: data.severity,
          cqcReportable,
        },
      });

      return incident;
    } catch (error) {
      MonitoringService.trackError(error as Error, {
        metadata: { operation: 'report_incident' },
      });
      throw error;
    }
  }

  static async startInvestigation(
    incidentId: string,
    investigator: string
  ): Promise<Investigation> {
    try {
      const investigation = await prisma.investigation.create({
        data: {
          incidentId,
          investigator,
          status: 'in_progress',
        },
      });

      await prisma.incident.update({
        where: { id: incidentId },
        data: { status: 'investigating' },
      });

      await AuditService.log({
        action: 'INVESTIGATION_STARTED',
        module: 'incidents',
        entityId: investigation.id,
        entityType: 'investigation',
        details: { investigator },
      });

      return investigation;
    } catch (error) {
      MonitoringService.trackError(error as Error, {
        metadata: { operation: 'start_investigation' },
      });
      throw error;
    }
  }

  static async updateInvestigation(
    investigationId: string,
    updates: Partial<Investigation>
  ): Promise<Investigation> {
    try {
      const investigation = await prisma.investigation.update({
        where: { id: investigationId },
        data: updates,
      });

      await AuditService.log({
        action: 'INVESTIGATION_UPDATED',
        module: 'incidents',
        entityId: investigation.id,
        entityType: 'investigation',
        details: updates,
      });

      return investigation;
    } catch (error) {
      MonitoringService.trackError(error as Error, {
        metadata: { operation: 'update_investigation' },
      });
      throw error;
    }
  }

  static async completeInvestigation(
    investigationId: string,
    findings: Investigation['findings'],
    recommendations: Investigation['recommendations']
  ): Promise<void> {
    try {
      const investigation = await prisma.investigation.update({
        where: { id: investigationId },
        data: {
          findings,
          recommendations,
          dateCompleted: new Date(),
          status: 'completed',
        },
        include: { incident: true },
      });

      // Update incident status
      await prisma.incident.update({
        where: { id: investigation.incident.id },
        data: { status: 'resolved' },
      });

      // Create action items from recommendations
      await this.createActionItems(investigation);

      await AuditService.log({
        action: 'INVESTIGATION_COMPLETED',
        module: 'incidents',
        entityId: investigationId,
        entityType: 'investigation',
        details: { findings, recommendations },
      });
    } catch (error) {
      MonitoringService.trackError(error as Error, {
        metadata: { operation: 'complete_investigation' },
      });
      throw error;
    }
  }

  static async generateIncidentReport(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalIncidents: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    averageResolutionTime: number;
    cqcReportable: number;
    safeguardingReferrals: number;
    openInvestigations: number;
    trends: Array<{
      type: string;
      count: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
  }> {
    try {
      const incidents = await prisma.incident.findMany({
        where: {
          organizationId,
          dateTime: { gte: startDate, lte: endDate },
        },
        include: {
          investigation: true,
        },
      });

      // Calculate statistics
      const bySeverity = this.groupBy(incidents, 'severity');
      const byType = this.groupBy(incidents, 'type');
      
      const resolutionTimes = incidents
        .filter(i => i.status === 'resolved')
        .map(i => {
          const resolution = new Date(i.investigation?.dateCompleted || i.dateTime);
          return resolution.getTime() - new Date(i.dateTime).getTime();
        });

      const averageResolutionTime = resolutionTimes.length
        ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        : 0;

      // Calculate trends
      const trends = await this.calculateTrends(organizationId, startDate, endDate);

      return {
        totalIncidents: incidents.length,
        bySeverity,
        byType,
        averageResolutionTime,
        cqcReportable: incidents.filter(i => i.cqcReportable).length,
        safeguardingReferrals: incidents.filter(i => i.safeguardingReferral).length,
        openInvestigations: incidents.filter(i => 
          i.status === 'investigating' || i.status === 'reported'
        ).length,
        trends,
      };
    } catch (error) {
      MonitoringService.trackError(error as Error, {
        metadata: { operation: 'generate_incident_report' },
      });
      throw error;
    }
  }

  private static async handleNotifications(
    incident: IncidentReport,
    organizationId: string
  ): Promise<void> {
    const notifications = this.NOTIFICATION_REQUIREMENTS[incident.severity];

    for (const recipient of notifications) {
      await prisma.notification.create({
        data: {
          type: 'INCIDENT',
          recipient,
          organizationId,
          incidentId: incident.id,
          status: 'pending',
        },
      });
    }

    // Update incident
    await prisma.incident.update({
      where: { id: incident.id },
      data: { notificationsSent: true },
    });
  }

  private static async createSafeguardingReferral(
    incident: IncidentReport,
    organizationId: string
  ): Promise<void> {
    await prisma.safeguardingReferral.create({
      data: {
        incidentId: incident.id,
        organizationId,
        status: 'pending',
        priority: incident.severity,
      },
    });
  }

  private static async createActionItems(
    investigation: Investigation & { incident: IncidentReport }
  ): Promise<void> {
    const actionItems = investigation.recommendations.map(recommendation => ({
      description: recommendation,
      status: 'pending',
      priority: investigation.incident.severity,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      assignedTo: investigation.investigator,
      investigationId: investigation.id,
    }));

    await prisma.actionItem.createMany({
      data: actionItems,
    });
  }

  private static async calculateTrends(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Get incidents from previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);

    const [currentPeriod, previousPeriod] = await Promise.all([
      prisma.incident.groupBy({
        by: ['type'],
        where: {
          organizationId,
          dateTime: { gte: startDate, lte: endDate },
        },
        _count: true,
      }),
      prisma.incident.groupBy({
        by: ['type'],
        where: {
          organizationId,
          dateTime: { gte: previousStartDate, lte: startDate },
        },
        _count: true,
      }),
    ]);

    return currentPeriod.map(current => {
      const previous = previousPeriod.find(p => p.type === current.type);
      const previousCount = previous?._count || 0;
      const trend = current._count > previousCount
        ? 'increasing'
        : current._count < previousCount
        ? 'decreasing'
        : 'stable';

      return {
        type: current.type,
        count: current._count,
        trend,
      };
    });
  }

  private static groupBy(items: any[], key: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }
}


