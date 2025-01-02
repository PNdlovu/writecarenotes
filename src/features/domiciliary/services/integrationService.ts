/**
 * @writecarenotes.com
 * @fileoverview Service layer for domiciliary care module integrations
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles business logic for integrating domiciliary care with other modules
 * including care plans, medications, assessments, and activities.
 */

import { prisma } from '@/lib/prisma';
import { 
  VisitRequirement, 
  MedicationSchedule, 
  AssessmentImpact,
  DomiciliaryActivitySchedule,
  DomiciliaryActivityCompletion,
  DomiciliaryActivityType
} from '@prisma/client';

export interface CarePlanIntegrationData {
  organizationId: string;
  clientId: string;
  carePlanId: string;
  visitRequirements: {
    taskType: 'PERSONAL_CARE' | 'MEDICATION' | 'MEAL' | 'DOMESTIC' | 'SPECIALIST';
    frequency: string;
    duration: number;
    staffingRequirements: string[];
    specificInstructions?: string;
  }[];
}

export interface MedicationIntegrationData {
  organizationId: string;
  clientId: string;
  medicationSchedules: {
    medicationId: string;
    scheduledTime: string;
    duration: number;
    requiresSpecialistStaff: boolean;
    notes?: string;
  }[];
}

export interface AssessmentIntegrationData {
  organizationId: string;
  clientId: string;
  assessmentId: string;
  visitImpact: {
    updatedDuration?: number;
    additionalStaffing?: string[];
    specialEquipment?: string[];
    riskFactors?: string[];
  };
}

export interface ActivityScheduleData {
  organizationId: string;
  clientId: string;
  activities: {
    activityType: DomiciliaryActivityType;
    title: string;
    description?: string;
    startTime: string;
    duration: number;
    frequency: string;
    requiresSpecialistStaff?: boolean;
    staffingRequirements?: string[];
    equipmentNeeded?: string[];
    riskLevel?: string;
    notes?: string;
  }[];
}

export interface ActivityCompletionData {
  organizationId: string;
  clientId: string;
  activityScheduleId: string;
  completedBy: string;
  completedAt: Date;
  duration: number;
  notes?: string;
  outcome?: string;
  clientFeedback?: string;
}

export class DomiciliaryIntegrationService {
  /**
   * Integrates care plan with visit requirements
   */
  async integrateCarePlan(data: CarePlanIntegrationData, userId: string): Promise<{ visits: any }> {
    return await prisma.$transaction(async (tx) => {
      // Validate care plan exists
      const carePlan = await tx.carePlan.findUnique({
        where: { id: data.carePlanId },
      });
      if (!carePlan) {
        throw new Error('Care plan not found');
      }

      // Create visit requirements
      const visits = await tx.visitRequirement.createMany({
        data: data.visitRequirements.map(req => ({
          organizationId: data.organizationId,
          clientId: data.clientId,
          carePlanId: data.carePlanId,
          taskType: req.taskType,
          frequency: req.frequency,
          duration: req.duration,
          staffingRequirements: req.staffingRequirements,
          specificInstructions: req.specificInstructions,
          createdBy: userId,
          updatedBy: userId,
        })),
      });

      return { visits };
    });
  }

  /**
   * Integrates medication schedules with visit requirements
   */
  async integrateMedication(data: MedicationIntegrationData, userId: string): Promise<{ schedules: any }> {
    return await prisma.$transaction(async (tx) => {
      // Validate medications exist
      const medicationIds = data.medicationSchedules.map(s => s.medicationId);
      const medications = await tx.medication.findMany({
        where: { id: { in: medicationIds } },
      });
      if (medications.length !== medicationIds.length) {
        throw new Error('One or more medications not found');
      }

      // Create medication schedules
      const schedules = await tx.medicationSchedule.createMany({
        data: data.medicationSchedules.map(schedule => ({
          organizationId: data.organizationId,
          clientId: data.clientId,
          medicationId: schedule.medicationId,
          scheduledTime: schedule.scheduledTime,
          duration: schedule.duration,
          requiresSpecialistStaff: schedule.requiresSpecialistStaff,
          notes: schedule.notes,
          createdBy: userId,
          updatedBy: userId,
        })),
      });

      return { schedules };
    });
  }

  /**
   * Integrates assessment impacts with visit requirements
   */
  async integrateAssessment(data: AssessmentIntegrationData, userId: string): Promise<{ assessment: AssessmentImpact }> {
    return await prisma.$transaction(async (tx) => {
      // Validate assessment exists
      const assessment = await tx.assessment.findUnique({
        where: { id: data.assessmentId },
      });
      if (!assessment) {
        throw new Error('Assessment not found');
      }

      // Create assessment impact
      const assessmentImpact = await tx.assessmentImpact.create({
        data: {
          organizationId: data.organizationId,
          clientId: data.clientId,
          assessmentId: data.assessmentId,
          updatedDuration: data.visitImpact.updatedDuration,
          additionalStaffing: data.visitImpact.additionalStaffing,
          specialEquipment: data.visitImpact.specialEquipment,
          riskFactors: data.visitImpact.riskFactors,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      return { assessment: assessmentImpact };
    });
  }

  /**
   * Creates or updates activity schedules for a client
   */
  async integrateActivities(data: ActivityScheduleData, userId: string): Promise<{ activities: DomiciliaryActivitySchedule[] }> {
    return await prisma.$transaction(async (tx) => {
      // Create activity schedules
      const activities = await Promise.all(
        data.activities.map(activity =>
          tx.domiciliaryActivitySchedule.create({
            data: {
              organizationId: data.organizationId,
              clientId: data.clientId,
              activityType: activity.activityType,
              title: activity.title,
              description: activity.description,
              startTime: activity.startTime,
              duration: activity.duration,
              frequency: activity.frequency,
              requiresSpecialistStaff: activity.requiresSpecialistStaff,
              staffingRequirements: activity.staffingRequirements,
              equipmentNeeded: activity.equipmentNeeded,
              riskLevel: activity.riskLevel,
              notes: activity.notes,
              createdBy: userId,
              updatedBy: userId,
            },
          })
        )
      );

      return { activities };
    });
  }

  /**
   * Records completion of a scheduled activity
   */
  async recordActivityCompletion(data: ActivityCompletionData): Promise<{ completion: DomiciliaryActivityCompletion }> {
    return await prisma.$transaction(async (tx) => {
      // Validate activity schedule exists
      const schedule = await tx.domiciliaryActivitySchedule.findUnique({
        where: { id: data.activityScheduleId },
      });
      if (!schedule) {
        throw new Error('Activity schedule not found');
      }

      // Record completion
      const completion = await tx.domiciliaryActivityCompletion.create({
        data: {
          activityScheduleId: data.activityScheduleId,
          organizationId: data.organizationId,
          clientId: data.clientId,
          completedBy: data.completedBy,
          completedAt: data.completedAt,
          duration: data.duration,
          notes: data.notes,
          outcome: data.outcome,
          clientFeedback: data.clientFeedback,
        },
      });

      return { completion };
    });
  }

  /**
   * Retrieves all visit requirements for a client
   */
  async getClientVisitRequirements(organizationId: string, clientId: string) {
    return await prisma.visitRequirement.findMany({
      where: {
        organizationId,
        clientId,
      },
      include: {
        carePlan: true,
      },
    });
  }

  /**
   * Retrieves all medication schedules for a client
   */
  async getClientMedicationSchedules(organizationId: string, clientId: string) {
    return await prisma.medicationSchedule.findMany({
      where: {
        organizationId,
        clientId,
      },
      include: {
        medication: true,
      },
    });
  }

  /**
   * Retrieves all assessment impacts for a client
   */
  async getClientAssessmentImpacts(organizationId: string, clientId: string) {
    return await prisma.assessmentImpact.findMany({
      where: {
        organizationId,
        clientId,
      },
      include: {
        assessment: true,
      },
    });
  }

  /**
   * Retrieves all activity schedules for a client
   */
  async getClientActivitySchedules(organizationId: string, clientId: string) {
    return await prisma.domiciliaryActivitySchedule.findMany({
      where: {
        organizationId,
        clientId,
        isActive: true,
      },
      include: {
        DomiciliaryActivityCompletion: {
          orderBy: {
            completedAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  /**
   * Retrieves activity completion history for a client
   */
  async getClientActivityCompletions(
    organizationId: string, 
    clientId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    return await prisma.domiciliaryActivityCompletion.findMany({
      where: {
        organizationId,
        clientId,
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        DomiciliaryActivitySchedule: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });
  }
} 