/**
 * @writecarenotes.com
 * @fileoverview Integration service for domiciliary medication management
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { prisma } from '@/lib/prisma';
import { Region } from '@prisma/client';
import { RegionalComplianceService } from '../../services/staff/regionalComplianceService';

interface MedicationSchedule {
  id: string;
  clientId: string;
  medicationId: string;
  scheduledTime: Date;
  status: 'PENDING' | 'COMPLETED' | 'MISSED';
  notes?: string;
}

interface MedicationAdministration {
  id: string;
  scheduleId: string;
  staffId: string;
  administeredAt: Date;
  status: 'ADMINISTERED' | 'REFUSED' | 'UNAVAILABLE';
  notes?: string;
  witness?: string;
}

export class DomiciliaryMedicationIntegration {
  /**
   * Get medication schedules for a visit
   */
  static async getVisitMedications(
    visitId: string,
    region: Region
  ): Promise<MedicationSchedule[]> {
    const schedules = await prisma.medicationSchedule.findMany({
      where: {
        visitId,
        status: 'PENDING'
      },
      include: {
        medication: true,
        client: true
      }
    });

    // Format dates according to regional settings
    return schedules.map(schedule => ({
      ...schedule,
      scheduledTime: new Date(
        RegionalComplianceService.formatDate(schedule.scheduledTime, region)
      )
    }));
  }

  /**
   * Record medication administration
   */
  static async recordAdministration(
    data: Omit<MedicationAdministration, 'id'>
  ): Promise<MedicationAdministration> {
    // Start transaction
    return await prisma.$transaction(async (tx) => {
      // Record administration
      const administration = await tx.medicationAdministration.create({
        data: {
          scheduleId: data.scheduleId,
          staffId: data.staffId,
          administeredAt: data.administeredAt,
          status: data.status,
          notes: data.notes,
          witness: data.witness
        }
      });

      // Update schedule status
      await tx.medicationSchedule.update({
        where: { id: data.scheduleId },
        data: { status: 'COMPLETED' }
      });

      // Create activity record
      await tx.staffActivity.create({
        data: {
          staffId: data.staffId,
          type: 'MEDICATION_ADMINISTRATION',
          description: `Medication ${data.status.toLowerCase()} for schedule ${data.scheduleId}`,
          createdBy: data.staffId
        }
      });

      return administration;
    });
  }

  /**
   * Get medication compliance report
   */
  static async getMedicationCompliance(
    clientId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    total: number;
    administered: number;
    refused: number;
    missed: number;
    compliance: number;
  }> {
    const [administered, refused, missed] = await Promise.all([
      prisma.medicationAdministration.count({
        where: {
          schedule: {
            clientId,
            scheduledTime: {
              gte: startDate,
              lte: endDate
            }
          },
          status: 'ADMINISTERED'
        }
      }),
      prisma.medicationAdministration.count({
        where: {
          schedule: {
            clientId,
            scheduledTime: {
              gte: startDate,
              lte: endDate
            }
          },
          status: 'REFUSED'
        }
      }),
      prisma.medicationSchedule.count({
        where: {
          clientId,
          scheduledTime: {
            gte: startDate,
            lte: endDate
          },
          status: 'MISSED'
        }
      })
    ]);

    const total = administered + refused + missed;
    const compliance = total > 0 ? (administered / total) * 100 : 0;

    return {
      total,
      administered,
      refused,
      missed,
      compliance
    };
  }

  /**
   * Get medication alerts
   */
  static async getMedicationAlerts(
    organizationId: string,
    region: Region
  ): Promise<{
    type: 'WARNING' | 'ERROR';
    title: string;
    description: string;
    clientId: string;
    medicationId: string;
  }[]> {
    const alerts = [];

    // Check for missed medications
    const missedMedications = await prisma.medicationSchedule.findMany({
      where: {
        status: 'MISSED',
        client: {
          organizationId
        }
      },
      include: {
        client: true,
        medication: true
      }
    });

    for (const missed of missedMedications) {
      alerts.push({
        type: 'ERROR',
        title: 'Missed Medication',
        description: `${missed.client.name} missed ${missed.medication.name} at ${
          RegionalComplianceService.formatDate(missed.scheduledTime, region)
        }`,
        clientId: missed.clientId,
        medicationId: missed.medicationId
      });
    }

    // Check for low stock
    const lowStock = await prisma.medicationStock.findMany({
      where: {
        organizationId,
        quantity: {
          lte: prisma.raw('reorder_level')
        }
      },
      include: {
        medication: true
      }
    });

    for (const stock of lowStock) {
      alerts.push({
        type: 'WARNING',
        title: 'Low Stock',
        description: `${stock.medication.name} stock is low (${stock.quantity} remaining)`,
        clientId: '',
        medicationId: stock.medicationId
      });
    }

    return alerts;
  }
} 