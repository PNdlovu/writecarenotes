/**
 * @fileoverview Medication service implementation
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { 
  Medication,
  MedicationSchedule,
  MedicationAdministration,
  MedicationStock,
  MedicationAlert,
  AlertType,
  AlertSeverity,
  AlertStatus,
  AdministrationStatus,
  MedicationStatistics
} from '../types';
import { createAuditLog } from '@/lib/audit';
import { validateCompliance } from '@/lib/compliance';
import { getCurrentTenant } from '@/lib/tenant';
import { NotFoundError, ValidationError } from '@/lib/errors';

export class MedicationService {
  private static instance: MedicationService;
  
  private constructor() {}

  public static getInstance(): MedicationService {
    if (!MedicationService.instance) {
      MedicationService.instance = new MedicationService();
    }
    return MedicationService.instance;
  }

  // Medication Management
  async createMedication(data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medication> {
    const tenant = await getCurrentTenant();
    
    // Validate compliance requirements
    await validateCompliance('medication.create', data);

    const medication = await prisma.medication.create({
      data: {
        ...data,
        organizationId: tenant.organizationId
      }
    });

    await createAuditLog({
      action: 'medication.create',
      entityType: 'medication',
      entityId: medication.id,
      details: data
    });

    return medication;
  }

  async updateMedication(id: string, data: Partial<Medication>): Promise<Medication> {
    const tenant = await getCurrentTenant();
    
    const medication = await prisma.medication.findFirst({
      where: { 
        id,
        organizationId: tenant.organizationId
      }
    });

    if (!medication) {
      throw new NotFoundError('Medication not found');
    }

    await validateCompliance('medication.update', { ...medication, ...data });

    const updated = await prisma.medication.update({
      where: { id },
      data
    });

    await createAuditLog({
      action: 'medication.update',
      entityType: 'medication',
      entityId: id,
      details: data
    });

    return updated;
  }

  // Stock Management
  async updateStock(id: string, quantity: number, batchNumber: string): Promise<MedicationStock> {
    const tenant = await getCurrentTenant();
    
    const stock = await prisma.medicationStock.update({
      where: {
        id,
        organizationId: tenant.organizationId
      },
      data: { quantity }
    });

    // Check stock levels and create alerts if necessary
    await this.checkStockLevels(stock.medicationId);

    await createAuditLog({
      action: 'medication.stock.update',
      entityType: 'medicationStock',
      entityId: id,
      details: { quantity, batchNumber }
    });

    return stock;
  }

  // Administration
  async recordAdministration(data: Omit<MedicationAdministration, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicationAdministration> {
    const tenant = await getCurrentTenant();
    
    // Validate the administration
    await this.validateAdministration(data);

    const administration = await prisma.medicationAdministration.create({
      data: {
        ...data,
        organizationId: tenant.organizationId
      }
    });

    // Update stock levels
    if (data.status === AdministrationStatus.COMPLETED) {
      await this.deductStock(data.medicationId, data.batchNumber);
    }

    await createAuditLog({
      action: 'medication.administration.record',
      entityType: 'medicationAdministration',
      entityId: administration.id,
      details: data
    });

    return administration;
  }

  // Scheduling
  async createSchedule(data: Omit<MedicationSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicationSchedule> {
    const tenant = await getCurrentTenant();
    
    // Validate the schedule
    await this.validateSchedule(data);

    const schedule = await prisma.medicationSchedule.create({
      data: {
        ...data,
        organizationId: tenant.organizationId
      }
    });

    await createAuditLog({
      action: 'medication.schedule.create',
      entityType: 'medicationSchedule',
      entityId: schedule.id,
      details: data
    });

    return schedule;
  }

  // Alerts & Monitoring
  async createAlert(data: Omit<MedicationAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicationAlert> {
    const tenant = await getCurrentTenant();
    
    const alert = await prisma.medicationAlert.create({
      data: {
        ...data,
        organizationId: tenant.organizationId
      }
    });

    if (alert.severity === AlertSeverity.HIGH || alert.severity === AlertSeverity.CRITICAL) {
      // Trigger immediate notifications
      await this.notifyHighPriorityAlert(alert);
    }

    return alert;
  }

  // Statistics & Reporting
  async getStatistics(organizationId: string): Promise<MedicationStatistics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      scheduledToday,
      pendingCount,
      completedToday,
      stockAlerts,
      missedDoses,
      refusals,
      prnAdministrations,
      controlledDrugChecks
    ] = await Promise.all([
      prisma.medicationSchedule.count({
        where: {
          organizationId,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
          status: 'ACTIVE'
        }
      }),
      prisma.medicationAdministration.count({
        where: {
          organizationId,
          status: 'PENDING'
        }
      }),
      prisma.medicationAdministration.count({
        where: {
          organizationId,
          status: 'COMPLETED',
          administeredTime: { gte: today }
        }
      }),
      prisma.medicationAlert.count({
        where: {
          organizationId,
          type: 'STOCK_LOW',
          status: 'ACTIVE'
        }
      }),
      prisma.medicationAdministration.count({
        where: {
          organizationId,
          status: 'MISSED',
          scheduledTime: { gte: today }
        }
      }),
      prisma.medicationAdministration.count({
        where: {
          organizationId,
          status: 'REFUSED',
          scheduledTime: { gte: today }
        }
      }),
      prisma.medicationAdministration.count({
        where: {
          organizationId,
          isPRN: true,
          status: 'COMPLETED',
          administeredTime: { gte: today }
        }
      }),
      prisma.medicationAdministration.count({
        where: {
          organizationId,
          requiresDoubleCheck: true,
          status: 'COMPLETED',
          administeredTime: { gte: today }
        }
      })
    ]);

    return {
      scheduledToday,
      pendingCount,
      completedToday,
      stockAlerts,
      missedDoses,
      refusals,
      prnAdministrations,
      controlledDrugChecks
    };
  }

  // Private helper methods
  private async validateAdministration(data: Partial<MedicationAdministration>): Promise<void> {
    // Implement validation logic
    const schedule = await prisma.medicationSchedule.findUnique({
      where: { id: data.scheduleId }
    });

    if (!schedule) {
      throw new ValidationError('Invalid medication schedule');
    }

    // Check for required witness for controlled drugs
    if (schedule.requiresDoubleCheck && !data.witnessId) {
      throw new ValidationError('Witness required for this medication');
    }

    // Additional validation rules...
  }

  private async validateSchedule(data: Partial<MedicationSchedule>): Promise<void> {
    // Implement schedule validation logic
    if (data.isPRN && !data.maxDailyDoses) {
      throw new ValidationError('Maximum daily doses required for PRN medication');
    }

    // Additional validation rules...
  }

  private async checkStockLevels(medicationId: string): Promise<void> {
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId }
    });

    if (medication.stockLevel <= medication.minimumStockLevel) {
      await this.createAlert({
        type: AlertType.STOCK_LOW,
        severity: AlertSeverity.HIGH,
        medicationId,
        message: `Stock level below minimum for ${medication.name}`,
        status: AlertStatus.ACTIVE
      });
    }
  }

  private async deductStock(medicationId: string, batchNumber: string): Promise<void> {
    await prisma.medicationStock.update({
      where: {
        medicationId_batchNumber: {
          medicationId,
          batchNumber
        }
      },
      data: {
        quantity: {
          decrement: 1
        }
      }
    });
  }

  private async notifyHighPriorityAlert(alert: MedicationAlert): Promise<void> {
    // Implement notification logic for high priority alerts
    // This could integrate with your notification system
  }
}

export const medicationService = MedicationService.getInstance();


