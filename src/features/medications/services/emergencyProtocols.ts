/**
 * @fileoverview Emergency Protocols Service for Care Home Medications
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { addToSyncQueue } from '@/lib/sync';

interface EmergencyProtocol {
  id: string;
  residentId: string;
  careHomeId: string;
  type: 'EPILEPSY' | 'ANAPHYLAXIS' | 'HYPOGLYCEMIA' | 'EMERGENCY_MEDS' | 'OUT_OF_HOURS';
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW';
  details: {
    symptoms: string[];
    triggers?: string[];
    contraindications?: string[];
    medications: {
      name: string;
      dose: string;
      route: string;
      frequency: string;
      maxDose24h?: string;
      specialInstructions?: string;
    }[];
    emergencyContacts: {
      name: string;
      role: string;
      contact: string;
      priority: number;
    }[];
    additionalInstructions?: string;
  };
  reviewDate: string;
  lastReviewedBy: string;
  approvedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface EmergencyIncident {
  id: string;
  residentId: string;
  careHomeId: string;
  protocolId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startTime: string;
  endTime?: string;
  details: {
    symptoms: string[];
    medications: {
      name: string;
      dose: string;
      time: string;
      givenBy: string;
      witnessedBy?: string;
    }[];
    observations: {
      time: string;
      type: string;
      value: string;
      notes?: string;
    }[];
    emergencyServices?: {
      called: boolean;
      time?: string;
      reference?: string;
      outcome?: string;
    };
  };
  outcome?: {
    resolved: boolean;
    followUpRequired: boolean;
    followUpDetails?: string;
    hospitalization?: boolean;
    notes?: string;
  };
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export class EmergencyProtocols {
  async createProtocol(
    data: Omit<EmergencyProtocol, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<EmergencyProtocol> {
    try {
      const protocol: EmergencyProtocol = {
        ...data,
        id: uuidv4(),
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store protocol
      const record = await db.emergencyProtocol.create({
        data: protocol,
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'emergencyProtocol',
        data: record,
      });

      return record;
    } catch (error) {
      console.error('Failed to create emergency protocol:', error);
      throw error;
    }
  }

  async updateProtocol(
    protocolId: string,
    data: Partial<EmergencyProtocol>
  ): Promise<EmergencyProtocol> {
    try {
      const protocol = await db.emergencyProtocol.update({
        where: { id: protocolId },
        data: {
          ...data,
          updatedAt: new Date().toISOString(),
        },
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'UPDATE',
        entityType: 'emergencyProtocol',
        data: protocol,
      });

      return protocol;
    } catch (error) {
      console.error('Failed to update emergency protocol:', error);
      throw error;
    }
  }

  async startEmergencyIncident(
    data: Omit<EmergencyIncident, 'id' | 'status' | 'startTime' | 'createdAt' | 'updatedAt'>
  ): Promise<EmergencyIncident> {
    try {
      const incident: EmergencyIncident = {
        ...data,
        id: uuidv4(),
        status: 'IN_PROGRESS',
        startTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store incident
      const record = await db.emergencyIncident.create({
        data: incident,
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'emergencyIncident',
        data: record,
      });

      // Create high priority alert
      await this.createEmergencyAlert(record);

      return record;
    } catch (error) {
      console.error('Failed to start emergency incident:', error);
      throw error;
    }
  }

  async updateEmergencyIncident(
    incidentId: string,
    data: Partial<EmergencyIncident>
  ): Promise<EmergencyIncident> {
    try {
      const incident = await db.emergencyIncident.update({
        where: { id: incidentId },
        data: {
          ...data,
          updatedAt: new Date().toISOString(),
        },
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'UPDATE',
        entityType: 'emergencyIncident',
        data: incident,
      });

      return incident;
    } catch (error) {
      console.error('Failed to update emergency incident:', error);
      throw error;
    }
  }

  async completeEmergencyIncident(
    incidentId: string,
    data: {
      endTime?: string;
      outcome: EmergencyIncident['outcome'];
    }
  ): Promise<EmergencyIncident> {
    try {
      const incident = await db.emergencyIncident.update({
        where: { id: incidentId },
        data: {
          status: 'COMPLETED',
          endTime: data.endTime || new Date().toISOString(),
          outcome: data.outcome,
          updatedAt: new Date().toISOString(),
        },
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'UPDATE',
        entityType: 'emergencyIncident',
        data: incident,
      });

      // Create follow-up task if required
      if (data.outcome?.followUpRequired) {
        await this.createFollowUpTask(incident);
      }

      return incident;
    } catch (error) {
      console.error('Failed to complete emergency incident:', error);
      throw error;
    }
  }

  private async createEmergencyAlert(incident: EmergencyIncident): Promise<void> {
    try {
      await db.clinicalAlert.create({
        data: {
          id: uuidv4(),
          residentId: incident.residentId,
          careHomeId: incident.careHomeId,
          type: 'EMERGENCY_PROTOCOL_ACTIVATED',
          severity: 'HIGH',
          details: {
            incidentId: incident.id,
            protocolType: incident.protocolId,
            startTime: incident.startTime,
          },
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to create emergency alert:', error);
    }
  }

  private async createFollowUpTask(incident: EmergencyIncident): Promise<void> {
    try {
      await db.task.create({
        data: {
          id: uuidv4(),
          residentId: incident.residentId,
          careHomeId: incident.careHomeId,
          type: 'EMERGENCY_FOLLOW_UP',
          description: incident.outcome?.followUpDetails || '',
          status: 'PENDING',
          priority: 'HIGH',
          dueDate: new Date(
            Date.now() + 24 * 60 * 60 * 1000 // Default to 24 hours
          ).toISOString(),
          assignedTo: incident.recordedBy,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to create follow-up task:', error);
    }
  }

  async getActiveProtocols(
    residentId: string,
    options?: {
      type?: EmergencyProtocol['type'];
    }
  ): Promise<EmergencyProtocol[]> {
    try {
      const where: any = {
        residentId,
        status: 'ACTIVE',
      };

      if (options?.type) where.type = options.type;

      return await db.emergencyProtocol.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
      });
    } catch (error) {
      console.error('Failed to get active protocols:', error);
      throw error;
    }
  }

  async getEmergencyIncidents(
    residentId: string,
    options?: {
      status?: EmergencyIncident['status'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<EmergencyIncident[]> {
    try {
      const where: any = { residentId };

      if (options?.status) where.status = options.status;
      if (options?.startDate || options?.endDate) {
        where.startTime = {};
        if (options?.startDate) where.startTime.gte = options.startDate;
        if (options?.endDate) where.startTime.lte = options.endDate;
      }

      return await db.emergencyIncident.findMany({
        where,
        orderBy: { startTime: 'desc' },
      });
    } catch (error) {
      console.error('Failed to get emergency incidents:', error);
      throw error;
    }
  }
} 


