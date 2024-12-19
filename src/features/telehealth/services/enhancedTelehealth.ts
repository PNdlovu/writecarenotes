/**
 * @fileoverview Enhanced Telehealth Service for Care Homes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { addToSyncQueue } from '@/lib/sync';

interface ConsultationParticipant {
  id: string;
  role: 'GP' | 'PHARMACIST' | 'SPECIALIST' | 'CARE_STAFF' | 'RESIDENT';
  name: string;
  email?: string;
}

interface ConsultationRequest {
  id: string;
  careHomeId: string;
  residentId: string;
  type: 'GP' | 'PHARMACIST' | 'SPECIALIST';
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  reason: string;
  preferredTime?: string;
  participants: ConsultationParticipant[];
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledTime?: string;
  meetingLink?: string;
  notes?: string;
}

interface ConsultationRecord {
  id: string;
  consultationId: string;
  startTime: string;
  endTime: string;
  summary: string;
  prescriptionChanges?: {
    medicationId: string;
    type: 'NEW' | 'MODIFY' | 'DISCONTINUE';
    details: string;
  }[];
  followUpActions?: {
    action: string;
    assignedTo: string;
    dueDate: string;
  }[];
  attachments?: {
    name: string;
    type: string;
    url: string;
  }[];
}

interface TelehealthError extends Error {
  code: string;
  details?: any;
}

class TelehealthServiceError extends Error implements TelehealthError {
  code: string;
  details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'TelehealthServiceError';
  }
}

export class EnhancedTelehealth {
  private validateConsultationRequest(data: Partial<ConsultationRequest>): void {
    if (!data.residentId) {
      throw new TelehealthServiceError('Resident ID is required', 'INVALID_INPUT');
    }
    if (!data.type) {
      throw new TelehealthServiceError('Consultation type is required', 'INVALID_INPUT');
    }
    if (!data.urgency) {
      throw new TelehealthServiceError('Urgency level is required', 'INVALID_INPUT');
    }
    if (!data.reason) {
      throw new TelehealthServiceError('Consultation reason is required', 'INVALID_INPUT');
    }
  }

  async facilitateRemoteConsultations(
    careHomeId: string,
    data: Partial<ConsultationRequest>
  ): Promise<ConsultationRequest> {
    try {
      this.validateConsultationRequest(data);

      const consultation = await db.consultationRequest.create({
        data: {
          ...data,
          id: uuidv4(),
          careHomeId,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
      });

      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'consultationRequest',
        data: consultation,
        status: 'PENDING',
        retryCount: 0,
        timestamp: new Date().toISOString(),
      });

      if (data.urgency === 'EMERGENCY') {
        await this.notifyEmergencyConsultation(consultation).catch(error => {
          console.error('Failed to send emergency notifications:', error);
          // Continue execution as this shouldn't block the consultation creation
        });
      }

      return consultation;
    } catch (error) {
      if (error instanceof TelehealthServiceError) {
        throw error;
      }
      throw new TelehealthServiceError(
        'Failed to create consultation request',
        'CREATION_FAILED',
        error
      );
    }
  }

  private async notifyEmergencyConsultation(consultation: ConsultationRequest): Promise<void> {
    try {
      const notifications = consultation.participants.map(participant => ({
        id: uuidv4(),
        userId: participant.id,
        type: 'EMERGENCY_CONSULTATION',
        title: 'Emergency Consultation Required',
        message: `Emergency consultation requested for resident at ${consultation.careHomeId}`,
        metadata: {
          consultationId: consultation.id,
          urgency: consultation.urgency,
          reason: consultation.reason,
        },
        status: 'UNREAD',
        createdAt: new Date().toISOString(),
      }));

      await db.notification.createMany({
        data: notifications,
      });

      await this.triggerEmergencyAlerts(consultation);
    } catch (error) {
      throw new TelehealthServiceError(
        'Failed to notify emergency consultation',
        'NOTIFICATION_FAILED',
        error
      );
    }
  }

  private async triggerEmergencyAlerts(consultation: ConsultationRequest): Promise<void> {
    try {
      await db.alert.create({
        data: {
          id: uuidv4(),
          careHomeId: consultation.careHomeId,
          type: 'EMERGENCY_CONSULTATION',
          severity: 'HIGH',
          status: 'ACTIVE',
          title: 'Emergency Clinical Support Required',
          description: consultation.reason,
          metadata: {
            consultationId: consultation.id,
            residentId: consultation.residentId,
          },
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      throw new TelehealthServiceError(
        'Failed to trigger emergency alerts',
        'ALERT_CREATION_FAILED',
        error
      );
    }
  }

  async recordConsultation(
    consultationId: string,
    data: Partial<ConsultationRecord>
  ): Promise<ConsultationRecord> {
    try {
      const record = await db.consultationRecord.create({
        data: {
          ...data,
          id: uuidv4(),
          consultationId,
          createdAt: new Date().toISOString(),
        },
      });

      await db.consultationRequest.update({
        where: { id: consultationId },
        data: { status: 'COMPLETED' },
      });

      if (data.prescriptionChanges?.length) {
        await this.processPrescriptionChanges(consultationId, data.prescriptionChanges);
      }

      if (data.followUpActions?.length) {
        await this.createFollowUpTasks(consultationId, data.followUpActions);
      }

      return record;
    } catch (error) {
      if (error instanceof TelehealthServiceError) {
        throw error;
      }
      throw new TelehealthServiceError(
        'Failed to record consultation',
        'RECORDING_FAILED',
        error
      );
    }
  }

  private async processPrescriptionChanges(
    consultationId: string,
    changes: ConsultationRecord['prescriptionChanges']
  ): Promise<void> {
    try {
      if (!changes) return;

      for (const change of changes) {
        await db.medicationChange.create({
          data: {
            id: uuidv4(),
            medicationId: change.medicationId,
            consultationId,
            type: change.type,
            details: change.details,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      throw new TelehealthServiceError(
        'Failed to process prescription changes',
        'PRESCRIPTION_CHANGES_FAILED',
        error
      );
    }
  }

  private async createFollowUpTasks(
    consultationId: string,
    actions: ConsultationRecord['followUpActions']
  ): Promise<void> {
    try {
      if (!actions) return;

      const tasks = actions.map(action => ({
        id: uuidv4(),
        consultationId,
        description: action.action,
        assignedTo: action.assignedTo,
        dueDate: action.dueDate,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }));

      await db.task.createMany({
        data: tasks,
      });
    } catch (error) {
      throw new TelehealthServiceError(
        'Failed to create follow-up tasks',
        'FOLLOW_UP_TASKS_FAILED',
        error
      );
    }
  }

  async getConsultationHistory(
    careHomeId: string,
    filters: {
      residentId?: string;
      type?: ConsultationRequest['type'];
      status?: ConsultationRequest['status'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<(ConsultationRequest & { record?: ConsultationRecord })[]> {
    try {
      const where: any = { careHomeId };

      if (filters.residentId) where.residentId = filters.residentId;
      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }

      return await db.consultationRequest.findMany({
        where,
        include: {
          record: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new TelehealthServiceError(
        'Failed to get consultation history',
        'HISTORY_RETRIEVAL_FAILED',
        error
      );
    }
  }
}


