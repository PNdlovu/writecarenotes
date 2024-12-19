/**
 * @fileoverview Clinical Monitoring Service for Care Home Medications
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { addToSyncQueue } from '@/lib/sync';

interface VitalSigns {
  id: string;
  residentId: string;
  careHomeId: string;
  type: 'BLOOD_SUGAR' | 'BLOOD_PRESSURE' | 'WEIGHT' | 'TEMPERATURE' | 'OXYGEN' | 'HEART_RATE';
  value: number;
  unit: string;
  timestamp: string;
  recordedBy: string;
  notes?: string;
}

interface SpecializedTreatment {
  id: string;
  residentId: string;
  careHomeId: string;
  type: 'PEG' | 'NG_TUBE' | 'INSULIN' | 'OXYGEN' | 'NEBULIZER';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startTime?: string;
  endTime?: string;
  details: {
    route?: string;
    rate?: number;
    volume?: number;
    equipment?: string;
    settings?: Record<string, any>;
  };
  outcome?: {
    successful: boolean;
    issues?: string[];
    followUp?: string;
  };
  recordedBy: string;
  witnessedBy?: string;
  notes?: string;
}

interface TreatmentSchedule {
  id: string;
  residentId: string;
  careHomeId: string;
  treatmentType: SpecializedTreatment['type'];
  frequency: string[];
  startDate: string;
  endDate?: string;
  details: Record<string, any>;
  status: 'ACTIVE' | 'ON_HOLD' | 'DISCONTINUED';
  lastUpdated: string;
  updatedBy: string;
}

export class ClinicalMonitoring {
  async recordVitalSigns(data: Omit<VitalSigns, 'id' | 'timestamp'>): Promise<VitalSigns> {
    try {
      const vitalSigns: VitalSigns = {
        ...data,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
      };

      // Store vital signs
      const record = await db.vitalSigns.create({
        data: vitalSigns,
      });

      // Add to sync queue for offline support
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'vitalSigns',
        data: record,
      });

      // Check if readings require attention
      await this.checkVitalSignsThresholds(record);

      return record;
    } catch (error) {
      console.error('Failed to record vital signs:', error);
      throw error;
    }
  }

  private async checkVitalSignsThresholds(reading: VitalSigns): Promise<void> {
    try {
      // Get resident's threshold settings
      const thresholds = await db.residentThresholds.findFirst({
        where: { residentId: reading.residentId },
      });

      if (!thresholds) return;

      const isOutOfRange = this.isReadingOutOfRange(reading, thresholds);
      if (isOutOfRange) {
        await this.createClinicalAlert({
          residentId: reading.residentId,
          careHomeId: reading.careHomeId,
          type: 'VITAL_SIGNS_OUT_OF_RANGE',
          severity: 'HIGH',
          details: {
            readingType: reading.type,
            value: reading.value,
            unit: reading.unit,
            threshold: thresholds[reading.type.toLowerCase()],
          },
        });
      }
    } catch (error) {
      console.error('Failed to check vital signs thresholds:', error);
    }
  }

  private isReadingOutOfRange(reading: VitalSigns, thresholds: any): boolean {
    const threshold = thresholds[reading.type.toLowerCase()];
    if (!threshold) return false;

    return (
      reading.value < threshold.low ||
      reading.value > threshold.high
    );
  }

  async recordSpecializedTreatment(
    data: Omit<SpecializedTreatment, 'id' | 'status' | 'startTime'>
  ): Promise<SpecializedTreatment> {
    try {
      const treatment: SpecializedTreatment = {
        ...data,
        id: uuidv4(),
        status: 'IN_PROGRESS',
        startTime: new Date().toISOString(),
      };

      // Store treatment record
      const record = await db.specializedTreatment.create({
        data: treatment,
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'specializedTreatment',
        data: record,
      });

      return record;
    } catch (error) {
      console.error('Failed to record specialized treatment:', error);
      throw error;
    }
  }

  async completeTreatment(
    treatmentId: string,
    data: {
      endTime?: string;
      outcome: SpecializedTreatment['outcome'];
      notes?: string;
    }
  ): Promise<SpecializedTreatment> {
    try {
      const treatment = await db.specializedTreatment.update({
        where: { id: treatmentId },
        data: {
          status: 'COMPLETED',
          endTime: data.endTime || new Date().toISOString(),
          outcome: data.outcome,
          notes: data.notes,
        },
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'UPDATE',
        entityType: 'specializedTreatment',
        data: treatment,
      });

      // Create follow-up task if needed
      if (data.outcome?.followUp) {
        await this.createFollowUpTask(treatment);
      }

      return treatment;
    } catch (error) {
      console.error('Failed to complete treatment:', error);
      throw error;
    }
  }

  async createTreatmentSchedule(
    data: Omit<TreatmentSchedule, 'id' | 'status' | 'lastUpdated'>
  ): Promise<TreatmentSchedule> {
    try {
      const schedule: TreatmentSchedule = {
        ...data,
        id: uuidv4(),
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString(),
      };

      // Store schedule
      const record = await db.treatmentSchedule.create({
        data: schedule,
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'treatmentSchedule',
        data: record,
      });

      return record;
    } catch (error) {
      console.error('Failed to create treatment schedule:', error);
      throw error;
    }
  }

  private async createClinicalAlert(alert: {
    residentId: string;
    careHomeId: string;
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    details: Record<string, any>;
  }): Promise<void> {
    try {
      await db.clinicalAlert.create({
        data: {
          id: uuidv4(),
          ...alert,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to create clinical alert:', error);
    }
  }

  private async createFollowUpTask(treatment: SpecializedTreatment): Promise<void> {
    try {
      await db.task.create({
        data: {
          id: uuidv4(),
          residentId: treatment.residentId,
          careHomeId: treatment.careHomeId,
          type: 'TREATMENT_FOLLOW_UP',
          description: treatment.outcome?.followUp || '',
          status: 'PENDING',
          dueDate: new Date(
            Date.now() + 24 * 60 * 60 * 1000 // Default to 24 hours
          ).toISOString(),
          assignedTo: treatment.recordedBy,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to create follow-up task:', error);
    }
  }

  async getVitalSignsHistory(
    residentId: string,
    options?: {
      type?: VitalSigns['type'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<VitalSigns[]> {
    try {
      const where: any = { residentId };

      if (options?.type) where.type = options.type;
      if (options?.startDate || options?.endDate) {
        where.timestamp = {};
        if (options?.startDate) where.timestamp.gte = options.startDate;
        if (options?.endDate) where.timestamp.lte = options.endDate;
      }

      return await db.vitalSigns.findMany({
        where,
        orderBy: { timestamp: 'desc' },
      });
    } catch (error) {
      console.error('Failed to get vital signs history:', error);
      throw error;
    }
  }

  async getTreatmentHistory(
    residentId: string,
    options?: {
      type?: SpecializedTreatment['type'];
      status?: SpecializedTreatment['status'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<SpecializedTreatment[]> {
    try {
      const where: any = { residentId };

      if (options?.type) where.type = options.type;
      if (options?.status) where.status = options.status;
      if (options?.startDate || options?.endDate) {
        where.startTime = {};
        if (options?.startDate) where.startTime.gte = options.startDate;
        if (options?.endDate) where.startTime.lte = options.endDate;
      }

      return await db.specializedTreatment.findMany({
        where,
        orderBy: { startTime: 'desc' },
      });
    } catch (error) {
      console.error('Failed to get treatment history:', error);
      throw error;
    }
  }
} 


