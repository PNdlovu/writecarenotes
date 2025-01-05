/**
 * @fileoverview Healthcare Integration Service for Care Home Medications
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { addToSyncQueue } from '@/lib/sync';

interface GPCommunication {
  id: string;
  residentId: string;
  careHomeId: string;
  type: 'PRESCRIPTION_REQUEST' | 'MEDICATION_REVIEW' | 'CLINICAL_QUERY' | 'APPOINTMENT_REQUEST';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  details: {
    subject: string;
    message: string;
    attachments?: {
      name: string;
      type: string;
      url: string;
    }[];
    medications?: {
      name: string;
      dose: string;
      quantity: number;
      duration: string;
      notes?: string;
    }[];
  };
  response?: {
    message: string;
    attachments?: {
      name: string;
      type: string;
      url: string;
    }[];
    actionRequired?: boolean;
    actionDetails?: string;
  };
  sentAt: string;
  respondedAt?: string;
  createdBy: string;
  updatedBy: string;
}

interface HospitalDischarge {
  id: string;
  residentId: string;
  careHomeId: string;
  hospitalId: string;
  admissionDate: string;
  dischargeDate: string;
  status: 'PENDING' | 'RECEIVED' | 'PROCESSED' | 'COMPLETED';
  details: {
    summary: string;
    diagnosis: string[];
    medications: {
      name: string;
      dose: string;
      route: string;
      frequency: string;
      duration: string;
      startDate: string;
      endDate?: string;
      notes?: string;
    }[];
    followUp: {
      type: string;
      date: string;
      location: string;
      notes?: string;
    }[];
    attachments?: {
      name: string;
      type: string;
      url: string;
    }[];
  };
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PharmacyOrder {
  id: string;
  residentId: string;
  careHomeId: string;
  pharmacyId: string;
  type: 'REGULAR' | 'EMERGENCY' | 'CONTROLLED';
  status: 'DRAFT' | 'SUBMITTED' | 'CONFIRMED' | 'PROCESSING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  items: {
    medicationId: string;
    name: string;
    dose: string;
    quantity: number;
    notes?: string;
  }[];
  delivery: {
    method: 'STANDARD' | 'EXPRESS' | 'COLLECTION';
    expectedDate?: string;
    actualDate?: string;
    notes?: string;
  };
  submittedBy: string;
  submittedAt?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export class HealthcareIntegration {
  async sendGPCommunication(
    data: Omit<GPCommunication, 'id' | 'status' | 'sentAt' | 'createdBy' | 'updatedBy'>
  ): Promise<GPCommunication> {
    try {
      const communication: GPCommunication = {
        ...data,
        id: uuidv4(),
        status: 'PENDING',
        sentAt: new Date().toISOString(),
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      };

      // Store communication
      const record = await db.gpCommunication.create({
        data: communication,
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'gpCommunication',
        data: record,
      });

      // Create notification for urgent/emergency communications
      if (data.priority !== 'ROUTINE') {
        await this.createUrgentNotification(record);
      }

      return record;
    } catch (error) {
      console.error('Failed to send GP communication:', error);
      throw error;
    }
  }

  async processHospitalDischarge(
    data: Omit<HospitalDischarge, 'id' | 'status' | 'processedBy' | 'processedAt' | 'createdAt' | 'updatedAt'>
  ): Promise<HospitalDischarge> {
    try {
      const discharge: HospitalDischarge = {
        ...data,
        id: uuidv4(),
        status: 'RECEIVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store discharge record
      const record = await db.hospitalDischarge.create({
        data: discharge,
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'hospitalDischarge',
        data: record,
      });

      // Create medication review task
      await this.createMedicationReviewTask(record);

      return record;
    } catch (error) {
      console.error('Failed to process hospital discharge:', error);
      throw error;
    }
  }

  async createPharmacyOrder(
    data: Omit<PharmacyOrder, 'id' | 'status' | 'submittedBy' | 'submittedAt' | 'createdAt' | 'updatedAt'>
  ): Promise<PharmacyOrder> {
    try {
      const order: PharmacyOrder = {
        ...data,
        id: uuidv4(),
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store order
      const record = await db.pharmacyOrder.create({
        data: order,
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'pharmacyOrder',
        data: record,
      });

      return record;
    } catch (error) {
      console.error('Failed to create pharmacy order:', error);
      throw error;
    }
  }

  async submitPharmacyOrder(
    orderId: string,
    submittedBy: string
  ): Promise<PharmacyOrder> {
    try {
      const order = await db.pharmacyOrder.update({
        where: { id: orderId },
        data: {
          status: 'SUBMITTED',
          submittedBy,
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'UPDATE',
        entityType: 'pharmacyOrder',
        data: order,
      });

      // Create notification for urgent/emergency orders
      if (order.priority !== 'ROUTINE') {
        await this.createUrgentOrderNotification(order);
      }

      return order;
    } catch (error) {
      console.error('Failed to submit pharmacy order:', error);
      throw error;
    }
  }

  private async createUrgentNotification(communication: GPCommunication): Promise<void> {
    try {
      await db.notification.create({
        data: {
          id: uuidv4(),
          type: 'URGENT_GP_COMMUNICATION',
          priority: communication.priority,
          residentId: communication.residentId,
          careHomeId: communication.careHomeId,
          details: {
            communicationId: communication.id,
            subject: communication.details.subject,
            type: communication.type,
          },
          status: 'UNREAD',
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to create urgent notification:', error);
    }
  }

  private async createMedicationReviewTask(discharge: HospitalDischarge): Promise<void> {
    try {
      await db.task.create({
        data: {
          id: uuidv4(),
          type: 'MEDICATION_REVIEW',
          residentId: discharge.residentId,
          careHomeId: discharge.careHomeId,
          priority: 'HIGH',
          details: {
            dischargeId: discharge.id,
            medications: discharge.details.medications,
          },
          status: 'PENDING',
          dueDate: new Date(
            Date.now() + 24 * 60 * 60 * 1000 // Default to 24 hours
          ).toISOString(),
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to create medication review task:', error);
    }
  }

  private async createUrgentOrderNotification(order: PharmacyOrder): Promise<void> {
    try {
      await db.notification.create({
        data: {
          id: uuidv4(),
          type: 'URGENT_PHARMACY_ORDER',
          priority: order.priority,
          residentId: order.residentId,
          careHomeId: order.careHomeId,
          details: {
            orderId: order.id,
            items: order.items.length,
            type: order.type,
          },
          status: 'UNREAD',
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to create urgent order notification:', error);
    }
  }

  async getGPCommunications(
    residentId: string,
    options?: {
      type?: GPCommunication['type'];
      status?: GPCommunication['status'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<GPCommunication[]> {
    try {
      const where: any = { residentId };

      if (options?.type) where.type = options.type;
      if (options?.status) where.status = options.status;
      if (options?.startDate || options?.endDate) {
        where.sentAt = {};
        if (options?.startDate) where.sentAt.gte = options.startDate;
        if (options?.endDate) where.sentAt.lte = options.endDate;
      }

      return await db.gpCommunication.findMany({
        where,
        orderBy: { sentAt: 'desc' },
      });
    } catch (error) {
      console.error('Failed to get GP communications:', error);
      throw error;
    }
  }

  async getHospitalDischarges(
    residentId: string,
    options?: {
      status?: HospitalDischarge['status'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<HospitalDischarge[]> {
    try {
      const where: any = { residentId };

      if (options?.status) where.status = options.status;
      if (options?.startDate || options?.endDate) {
        where.dischargeDate = {};
        if (options?.startDate) where.dischargeDate.gte = options.startDate;
        if (options?.endDate) where.dischargeDate.lte = options.endDate;
      }

      return await db.hospitalDischarge.findMany({
        where,
        orderBy: { dischargeDate: 'desc' },
      });
    } catch (error) {
      console.error('Failed to get hospital discharges:', error);
      throw error;
    }
  }

  async getPharmacyOrders(
    residentId: string,
    options?: {
      type?: PharmacyOrder['type'];
      status?: PharmacyOrder['status'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PharmacyOrder[]> {
    try {
      const where: any = { residentId };

      if (options?.type) where.type = options.type;
      if (options?.status) where.status = options.status;
      if (options?.startDate || options?.endDate) {
        where.createdAt = {};
        if (options?.startDate) where.createdAt.gte = options.startDate;
        if (options?.endDate) where.createdAt.lte = options.endDate;
      }

      return await db.pharmacyOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Failed to get pharmacy orders:', error);
      throw error;
    }
  }
} 


