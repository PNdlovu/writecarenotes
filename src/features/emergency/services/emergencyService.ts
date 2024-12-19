import { prisma } from '@/lib/prisma';
import { 
  EmergencyIncident, 
  EmergencyProtocol, 
  EmergencyAction,
  EmergencyNotification,
  EmergencyAccess,
  EmergencyReport,
  EmergencyType,
  EmergencyStatus,
  EmergencySeverity
} from '../types';
import { NotificationService } from '@/features/notifications/services/notificationService';
import { AccessManagementService } from '@/features/access-management/services/accessManagementService';
import { StaffService } from '@/features/staff/services/staffService';
import { AuditService } from '@/features/audit/services/auditService';
import { getProtocolTemplate, validateProtocolCompletion, checkProtocolEscalation } from '../utils/protocolUtils';

export class EmergencyService {
  private notificationService: NotificationService;
  private accessManagementService: AccessManagementService;
  private staffService: StaffService;
  private auditService: AuditService;

  constructor() {
    this.notificationService = new NotificationService();
    this.accessManagementService = new AccessManagementService();
    this.staffService = new StaffService();
    this.auditService = new AuditService();
  }

  async declareEmergency(
    type: EmergencyType, 
    location: string, 
    details: string
  ): Promise<EmergencyIncident> {
    const protocol = getProtocolTemplate(type);
    const incident: EmergencyIncident = {
      id: uuidv4(),
      type,
      status: 'ACTIVE',
      location,
      details,
      protocol,
      startTime: new Date(),
      currentEscalationLevel: protocol.escalationPath[0],
      lastUpdated: new Date()
    };

    await this.notificationService.notifyEmergencyDeclared(incident);
    await this.accessManagementService.grantEmergencyAccess(incident);
    await this.auditService.logEmergencyAction({
      incidentId: incident.id,
      type: 'DECLARE',
      details: `Emergency declared: ${type} at ${location}`,
      timestamp: new Date()
    });

    // Auto-notify required roles
    await Promise.all(protocol.autoNotify.map(role =>
      this.notificationService.notifyRole(role, {
        type: 'EMERGENCY_NOTIFICATION',
        title: `Emergency: ${type}`,
        message: `New emergency declared at ${location}. Your immediate attention is required.`,
        priority: 'HIGH'
      })
    ));

    return incident;
  }

  async updateEmergencyStatus(
    incidentId: string,
    status: EmergencyStatus,
    updatedBy: string
  ): Promise<EmergencyIncident> {
    const incident = await prisma.emergencyIncident.update({
      where: { id: incidentId },
      data: {
        status,
        updatedAt: new Date(),
        resolvedAt: status === 'RESOLVED' ? new Date() : undefined,
      },
    });

    // Handle status-specific actions
    if (status === 'RESOLVED') {
      await this.handleEmergencyResolution(incident);
    }

    // Audit trail
    await this.auditService.log('EMERGENCY_STATUS_UPDATED', {
      incidentId,
      updatedBy,
      newStatus: status,
    });

    return incident;
  }

  async recordAction(incidentId: string, action: EmergencyAction): Promise<void> {
    const incident = await this.getIncident(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    // Validate and record the action
    await this.auditService.logEmergencyAction(action);

    // Check protocol completion and escalation
    const actions = await this.getIncidentActions(incidentId);
    const escalation = checkProtocolEscalation(incident, [...actions, action]);

    if (escalation.shouldEscalate && escalation.nextEscalationLevel !== incident.currentEscalationLevel) {
      await this.escalateEmergency(incident, escalation.nextEscalationLevel, escalation.reason);
    }

    const validation = validateProtocolCompletion(incident.protocol, [...actions, action]);
    if (validation.isComplete) {
      await this.updateIncidentStatus(incidentId, 'RESOLVED');
    }
  }

  async escalateEmergency(
    incident: EmergencyIncident,
    newLevel: string,
    reason: string
  ): Promise<void> {
    const updatedIncident = {
      ...incident,
      currentEscalationLevel: newLevel,
      lastUpdated: new Date()
    };

    await this.notificationService.notifyEmergencyEscalated(updatedIncident, reason);
    await this.auditService.logEmergencyAction({
      incidentId: incident.id,
      type: 'ESCALATE',
      details: `Emergency escalated to ${newLevel}: ${reason}`,
      timestamp: new Date()
    });

    // Notify new escalation level
    await this.notificationService.notifyRole(newLevel, {
      type: 'EMERGENCY_ESCALATION',
      title: `Emergency Escalation: ${incident.type}`,
      message: `Emergency has been escalated to your attention. Reason: ${reason}`,
      priority: 'HIGH'
    });
  }

  async getIncident(incidentId: string): Promise<EmergencyIncident> {
    return prisma.emergencyIncident.findUnique({
      where: { id: incidentId },
      include: {
        protocol: true,
      },
    });
  }

  async getIncidentActions(incidentId: string): Promise<EmergencyAction[]> {
    return prisma.emergencyAction.findMany({
      where: { incidentId },
    });
  }

  async updateIncidentStatus(incidentId: string, status: EmergencyStatus): Promise<void> {
    await prisma.emergencyIncident.update({
      where: { id: incidentId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  async initializeProtocol(
    incidentId: string,
    protocol: EmergencyProtocol
  ): Promise<void> {
    // Create initial steps
    for (const step of protocol.steps) {
      await prisma.emergencyStep.create({
        data: {
          ...step,
          incidentId,
          status: 'PENDING',
        },
      });
    }

    // Assign responders based on required roles
    const responders = await this.staffService.findStaffByRoles(protocol.requiredRoles);
    await prisma.emergencyIncident.update({
      where: { id: incidentId },
      data: {
        responders: {
          set: responders.map(r => r.id),
        },
      },
    });
  }

  async notifyEmergencyTeam(incident: EmergencyIncident): Promise<void> {
    const notifications: Partial<EmergencyNotification>[] = [];

    // Notify responders
    for (const responderId of incident.responders) {
      const responder = await this.staffService.getStaffMember(responderId);
      notifications.push({
        incidentId: incident.id,
        type: 'SYSTEM',
        recipient: responderId,
        message: `EMERGENCY: ${incident.type} incident declared at ${incident.location}. Immediate response required.`,
        priority: 'URGENT',
      });

      // Send additional notifications based on contact preferences
      if (responder.contactPreferences.includes('SMS')) {
        notifications.push({
          incidentId: incident.id,
          type: 'SMS',
          recipient: responder.phone,
          message: `EMERGENCY: ${incident.type} at ${incident.location}. Log in to system immediately.`,
          priority: 'URGENT',
        });
      }
    }

    // Send all notifications
    await Promise.all(
      notifications.map(notification =>
        this.notificationService.sendEmergencyNotification(notification)
      )
    );
  }

  async grantEmergencyAccess(incident: EmergencyIncident): Promise<void> {
    // Grant access to responders
    for (const responderId of incident.responders) {
      await this.accessManagementService.grantEmergencyAccess({
        incidentId: incident.id,
        grantedTo: responderId,
        grantedBy: 'SYSTEM',
        accessType: 'FULL',
        resources: ['ALL'],
        reason: `Emergency response to ${incident.type} incident`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
    }
  }

  async createEmergencyReport(
    incidentId: string,
    author: string
  ): Promise<EmergencyReport> {
    return prisma.emergencyReport.create({
      data: {
        incidentId,
        type: 'INITIAL',
        author,
        content: 'Emergency incident declared - initial report',
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });
  }

  async handleEmergencyResolution(incident: EmergencyIncident): Promise<void> {
    // Revoke emergency access
    await this.accessManagementService.revokeEmergencyAccess(incident.id);

    // Notify team of resolution
    await this.notificationService.sendBulkNotifications(
      incident.responders.map(responderId => ({
        type: 'SYSTEM',
        recipient: responderId,
        message: `Emergency incident ${incident.id} has been resolved.`,
        priority: 'HIGH',
      }))
    );

    // Create final report requirement
    await prisma.emergencyReport.create({
      data: {
        incidentId: incident.id,
        type: 'FINAL',
        status: 'DRAFT',
        submittedAt: new Date(),
      },
    });
  }

  async getProtocol(protocolId: string): Promise<EmergencyProtocol> {
    return prisma.emergencyProtocol.findUnique({
      where: { id: protocolId },
      include: {
        steps: true,
      },
    });
  }

  async searchProtocols(type?: EmergencyType): Promise<EmergencyProtocol[]> {
    return prisma.emergencyProtocol.findMany({
      where: type ? { type } : undefined,
      include: {
        steps: true,
      },
    });
  }
}
