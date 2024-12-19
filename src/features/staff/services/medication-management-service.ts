import { prisma } from '@/lib/prisma';
import { MonitoringService } from './monitoring-service';
import { AuditService } from './audit-service';
import { IncidentManagementService } from './incident-management-service';

interface MedicationSchedule {
  id: string;
  residentId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  timeSlots: string[];
  route: string;
  startDate: Date;
  endDate?: Date;
  instructions: string;
  prescribedBy: string;
  requiresControlledDrugs: boolean;
  requiresWitnessing: boolean;
}

interface MedicationAdministration {
  id: string;
  scheduleId: string;
  administeredBy: string;
  witnessedBy?: string;
  dateTime: Date;
  status: 'administered' | 'refused' | 'missed' | 'held';
  notes?: string;
}

export class MedicationManagementService {
  private static readonly CONTROLLED_DRUGS = [
    'MORPHINE',
    'OXYCODONE',
    'FENTANYL',
    'METHYLPHENIDATE',
    'DIAZEPAM',
  ];

  private static readonly HIGH_RISK_MEDICATIONS = [
    'WARFARIN',
    'INSULIN',
    'METHOTREXATE',
    'LITHIUM',
    'CLOZAPINE',
  ];

  static async createMedicationSchedule(
    organizationId: string,
    data: Omit<MedicationSchedule, 'id'>
  ): Promise<MedicationSchedule> {
    try {
      // Determine if medication requires special handling
      const requiresControlledDrugs = this.CONTROLLED_DRUGS.some(drug =>
        data.medicationName.toUpperCase().includes(drug)
      );

      const requiresWitnessing = requiresControlledDrugs ||
        this.HIGH_RISK_MEDICATIONS.some(med =>
          data.medicationName.toUpperCase().includes(med)
        );

      // Create medication schedule
      const schedule = await prisma.medicationSchedule.create({
        data: {
          ...data,
          organizationId,
          requiresControlledDrugs,
          requiresWitnessing,
        },
      });

      // Log audit trail
      await AuditService.log({
        action: 'MEDICATION_SCHEDULE_CREATED',
        module: 'medications',
        entityId: schedule.id,
        entityType: 'medication_schedule',
        details: {
          medicationName: data.medicationName,
          requiresControlledDrugs,
          requiresWitnessing,
        },
      });

      return schedule;
    } catch (error) {
      MonitoringService.trackError(error as Error, {
        metadata: { operation: 'create_medication_schedule' },
      });
      throw error;
    }
  }

  static async recordAdministration(
    scheduleId: string,
    data: Omit<MedicationAdministration, 'id' | 'scheduleId'>
  ): Promise<MedicationAdministration> {
    try {
      const schedule = await prisma.medicationSchedule.findUnique({
        where: { id: scheduleId },
        include: { resident: true },
      });

      if (!schedule) {
        throw new Error('Medication schedule not found');
      }

      // Validate witnessing requirements
      if (schedule.requiresWitnessing && !data.witnessedBy) {
        throw new Error('This medication requires witnessing');
      }

      // Record administration
      const administration = await prisma.medicationAdministration.create({
        data: {
          ...data,
          scheduleId,
        },
      });

      // Log audit trail
      await AuditService.log({
        action: 'MEDICATION_ADMINISTERED',
        module: 'medications',
        entityId: administration.id,
        entityType: 'medication_administration',
        details: {
          status: data.status,
          medicationName: schedule.medicationName,
        },
      });

      // Handle missed or refused medications
      if (data.status === 'missed' || data.status === 'refused') {
        await this.handleMissedMedication(schedule, data);
      }

      return administration;
    } catch (error) {
      MonitoringService.trackError(error as Error, {
        metadata: { operation: 'record_administration' },
      });
      throw error;
    }
  }

  static async generateMedicationReport(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalAdministrations: number;
    byStatus: Record<string, number>;
    missedDoses: number;
    controlledDrugs: number;
    complianceRate: number;
    errorRate: number;
    lateAdministrations: number;
  }> {
    try {
      const administrations = await prisma.medicationAdministration.findMany({
        where: {
          schedule: {
            organizationId,
          },
          dateTime: { gte: startDate, lte: endDate },
        },
        include: {
          schedule: true,
        },
      });

      const byStatus = this.groupBy(administrations, 'status');
      const totalAdministrations = administrations.length;
      const missedDoses = (byStatus['missed'] || 0) + (byStatus['refused'] || 0);
      
      const controlledDrugs = administrations.filter(a =>
        a.schedule.requiresControlledDrugs
      ).length;

      const lateAdministrations = administrations.filter(a => {
        const scheduledTime = new Date(a.schedule.timeSlots[0]); // Simplified for example
        const actualTime = new Date(a.dateTime);
        return actualTime.getTime() - scheduledTime.getTime() > 30 * 60 * 1000; // 30 minutes
      }).length;

      const complianceRate = (totalAdministrations - missedDoses) / totalAdministrations * 100;
      const errorRate = await this.calculateErrorRate(organizationId, startDate, endDate);

      return {
        totalAdministrations,
        byStatus,
        missedDoses,
        controlledDrugs,
        complianceRate,
        errorRate,
        lateAdministrations,
      };
    } catch (error) {
      MonitoringService.trackError(error as Error, {
        metadata: { operation: 'generate_medication_report' },
      });
      throw error;
    }
  }

  static async checkForInteractions(
    residentId: string,
    newMedication: string
  ): Promise<{
    hasInteractions: boolean;
    interactions: Array<{
      medication: string;
      severity: 'high' | 'moderate' | 'low';
      description: string;
    }>;
  }> {
    try {
      // Get resident's current medications
      const currentMedications = await prisma.medicationSchedule.findMany({
        where: {
          residentId,
          endDate: null,
        },
      });

      // This would typically integrate with a drug interaction API
      // For demonstration, we'll use a simplified check
      const interactions = currentMedications
        .map(med => this.checkInteraction(med.medicationName, newMedication))
        .filter(Boolean);

      return {
        hasInteractions: interactions.length > 0,
        interactions,
      };
    } catch (error) {
      MonitoringService.trackError(error as Error, {
        metadata: { operation: 'check_interactions' },
      });
      throw error;
    }
  }

  private static async handleMissedMedication(
    schedule: MedicationSchedule,
    administration: Omit<MedicationAdministration, 'id' | 'scheduleId'>
  ): Promise<void> {
    // Check if this is a high-risk medication
    const isHighRisk = this.HIGH_RISK_MEDICATIONS.some(med =>
      schedule.medicationName.toUpperCase().includes(med)
    );

    if (isHighRisk) {
      // Create incident report
      await IncidentManagementService.reportIncident(
        schedule.organizationId,
        {
          type: 'MEDICATION_ERROR',
          severity: 'major',
          description: `Missed dose of ${schedule.medicationName} for resident ${schedule.residentId}`,
          location: 'Medication Room',
          dateTime: new Date(),
          reportedBy: administration.administeredBy,
          involvedResidents: [schedule.residentId],
          involvedStaff: [administration.administeredBy],
          witnesses: administration.witnessedBy ? [administration.witnessedBy] : [],
          immediateActions: ['Notified nurse in charge', 'Documented in resident records'],
          safeguardingReferral: false,
          cqcReportable: true,
        }
      );
    }

    // Notify relevant staff
    await prisma.notification.create({
      data: {
        type: 'MISSED_MEDICATION',
        recipient: 'NURSE_IN_CHARGE',
        organizationId: schedule.organizationId,
        status: 'pending',
        details: {
          residentId: schedule.residentId,
          medicationName: schedule.medicationName,
          reason: administration.status,
          notes: administration.notes,
        },
      },
    });
  }

  private static async calculateErrorRate(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const incidents = await prisma.incident.count({
      where: {
        organizationId,
        type: 'MEDICATION_ERROR',
        dateTime: { gte: startDate, lte: endDate },
      },
    });

    const administrations = await prisma.medicationAdministration.count({
      where: {
        schedule: {
          organizationId,
        },
        dateTime: { gte: startDate, lte: endDate },
      },
    });

    return administrations > 0 ? (incidents / administrations) * 100 : 0;
  }

  private static checkInteraction(
    medication1: string,
    medication2: string
  ): { medication: string; severity: 'high' | 'moderate' | 'low'; description: string; } | null {
    // This would typically use a comprehensive drug interaction database
    // Simplified example for demonstration
    const knownInteractions: Record<string, Record<string, {
      severity: 'high' | 'moderate' | 'low';
      description: string;
    }>> = {
      'WARFARIN': {
        'ASPIRIN': {
          severity: 'high',
          description: 'Increased risk of bleeding',
        },
      },
      'METHOTREXATE': {
        'TRIMETHOPRIM': {
          severity: 'high',
          description: 'Increased risk of methotrexate toxicity',
        },
      },
    };

    const med1 = Object.keys(knownInteractions).find(k =>
      medication1.toUpperCase().includes(k)
    );
    const med2 = Object.keys(knownInteractions).find(k =>
      medication2.toUpperCase().includes(k)
    );

    if (med1 && knownInteractions[med1][med2]) {
      return {
        medication: med2,
        ...knownInteractions[med1][med2],
      };
    }

    if (med2 && knownInteractions[med2][med1]) {
      return {
        medication: med1,
        ...knownInteractions[med2][med1],
      };
    }

    return null;
  }

  private static groupBy(items: any[], key: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }
}


