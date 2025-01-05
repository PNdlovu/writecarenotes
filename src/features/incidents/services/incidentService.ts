/**
 * @writecarenotes.com
 * @fileoverview Core incident service for basic incident operations
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Core incident service for managing basic incident operations including
 * reporting, status updates, action tracking, and lessons learned.
 * Handles the fundamental CRUD operations for incidents and provides
 * basic notification capabilities.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../../../utils/logger';
import { NotificationService } from '../../../services/notificationService';
import { 
  Incident,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus
} from '../types';

export class IncidentService {
  private prisma: PrismaClient;
  private notificationService: NotificationService;

  constructor(
    prisma: PrismaClient,
    notificationService: NotificationService
  ) {
    this.prisma = prisma;
    this.notificationService = notificationService;
  }

  async reportIncident(incident: Omit<Incident, 'id' | 'status' | 'timeline'>): Promise<Incident> {
    try {
      // Create the incident
      const newIncident = await this.prisma.incident.create({
        data: {
          ...incident,
          status: IncidentStatus.REPORTED,
          dateReported: new Date(),
          timeline: {
            create: {
              date: new Date(),
              action: 'INCIDENT_REPORTED',
              userId: incident.reporterId,
              details: 'Incident initially reported'
            }
          }
        }
      });

      // Automatic notifications based on severity
      await this.handleInitialNotifications(newIncident);

      // Automatic assignment based on category and severity
      await this.assignInvestigator(newIncident);

      // Create initial risk assessment if needed
      if (this.requiresImmediateRiskAssessment(newIncident)) {
        await this.createInitialRiskAssessment(newIncident.id);
      }

      // Log the incident creation
      await this.logIncidentAction(newIncident.id, 'CREATED', 'Incident report created');

      return newIncident;
    } catch (error) {
      logger.error('Error reporting incident:', error);
      throw new Error('Failed to report incident');
    }
  }

  async updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus,
    userId: string,
    details?: string
  ): Promise<void> {
    try {
      await this.prisma.incident.update({
        where: { id: incidentId },
        data: {
          status,
          timeline: {
            create: {
              date: new Date(),
              action: 'STATUS_UPDATED',
              userId,
              details: details || `Status updated to ${status}`
            }
          }
        }
      });

      // Handle status-specific actions
      switch (status) {
        case IncidentStatus.UNDER_INVESTIGATION:
          await this.startInvestigation(incidentId);
          break;
        case IncidentStatus.PENDING_REVIEW:
          await this.notifyReviewers(incidentId);
          break;
        case IncidentStatus.ESCALATED:
          await this.handleEscalation(incidentId);
          break;
        case IncidentStatus.RESOLVED:
          await this.finalizeIncident(incidentId);
          break;
      }
    } catch (error) {
      logger.error('Error updating incident status:', error);
      throw new Error('Failed to update incident status');
    }
  }

  async addIncidentAction(
    incidentId: string,
    action: {
      description: string;
      assignedTo: string;
      dueDate: Date;
    }
  ): Promise<void> {
    try {
      await this.prisma.incidentAction.create({
        data: {
          incidentId,
          ...action,
          status: 'PENDING'
        }
      });

      // Notify assigned person
      await this.notificationService.sendNotification({
        userId: action.assignedTo,
        type: 'ACTION_ASSIGNED',
        message: `New action assigned for incident ${incidentId}`,
        priority: 'HIGH'
      });
    } catch (error) {
      logger.error('Error adding incident action:', error);
      throw new Error('Failed to add incident action');
    }
  }

  async recordLessonsLearned(
    incidentId: string,
    lessons: {
      identified: string;
      actions: string;
      sharedWith: string[];
    }
  ): Promise<void> {
    try {
      await this.prisma.incident.update({
        where: { id: incidentId },
        data: {
          lessons: {
            create: {
              ...lessons,
              dateImplemented: new Date()
            }
          }
        }
      });

      // Share lessons with specified staff
      await this.shareLessonsLearned(incidentId, lessons);
    } catch (error) {
      logger.error('Error recording lessons learned:', error);
      throw new Error('Failed to record lessons learned');
    }
  }

  private async handleInitialNotifications(incident: Incident): Promise<void> {
    const notifications = [];

    // Always notify management
    notifications.push({
      recipientId: 'MANAGEMENT',
      type: 'MANAGEMENT',
      message: `New ${incident.severity} incident reported`
    });

    // Notify based on severity and category
    if (incident.severity === IncidentSeverity.CRITICAL) {
      notifications.push({
        recipientId: 'CQC',
        type: 'CQC',
        message: 'Critical incident requiring immediate attention'
      });
    }

    if (incident.category === IncidentCategory.SAFEGUARDING) {
      notifications.push({
        recipientId: 'SAFEGUARDING_LEAD',
        type: 'MANAGEMENT',
        message: 'New safeguarding incident reported'
      });
    }

    // Send all notifications
    await Promise.all(
      notifications.map(notification =>
        this.notificationService.sendNotification({
          ...notification,
          priority: incident.severity === IncidentSeverity.CRITICAL ? 'HIGH' : 'MEDIUM'
        })
      )
    );
  }

  private async assignInvestigator(incident: Incident): Promise<void> {
    // Implementation for automatic investigator assignment
  }

  private async createInitialRiskAssessment(incidentId: string): Promise<void> {
    // Implementation for initial risk assessment
  }

  private requiresImmediateRiskAssessment(incident: Incident): boolean {
    return (
      incident.severity === IncidentSeverity.CRITICAL ||
      incident.category === IncidentCategory.SAFEGUARDING
    );
  }

  private async startInvestigation(incidentId: string): Promise<void> {
    // Implementation for starting investigation
  }

  private async notifyReviewers(incidentId: string): Promise<void> {
    // Implementation for notifying reviewers
  }

  private async handleEscalation(incidentId: string): Promise<void> {
    // Implementation for handling escalation
  }

  private async finalizeIncident(incidentId: string): Promise<void> {
    // Implementation for finalizing incident
  }

  private async shareLessonsLearned(
    incidentId: string,
    lessons: { sharedWith: string[] }
  ): Promise<void> {
    await Promise.all(
      lessons.sharedWith.map(userId =>
        this.notificationService.sendNotification({
          userId,
          type: 'LESSONS_LEARNED',
          message: `New lessons learned from incident ${incidentId}`,
          priority: 'MEDIUM'
        })
      )
    );
  }

  private async logIncidentAction(
    incidentId: string,
    action: string,
    description: string
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'INCIDENT',
        entityId: incidentId,
        action,
        description,
        timestamp: new Date()
      }
    });
  }
}
