/**
 * @writecarenotes.com
 * @fileoverview API routes for domiciliary care module integrations
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles integration endpoints between domiciliary care and other modules
 * including care plans, assessments, activities, and medications.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Validation schemas for different integration types
const carePlanIntegrationSchema = z.object({
  organizationId: z.string(),
  clientId: z.string(),
  carePlanId: z.string(),
  visitRequirements: z.array(z.object({
    taskType: z.enum(['PERSONAL_CARE', 'MEDICATION', 'MEAL', 'DOMESTIC', 'SPECIALIST']),
    frequency: z.string(),
    duration: z.number(),
    staffingRequirements: z.array(z.string()),
    specificInstructions: z.string().optional(),
  })),
});

const medicationIntegrationSchema = z.object({
  organizationId: z.string(),
  clientId: z.string(),
  medicationSchedules: z.array(z.object({
    medicationId: z.string(),
    scheduledTime: z.string(),
    duration: z.number(),
    requiresSpecialistStaff: z.boolean(),
    notes: z.string().optional(),
  })),
});

const assessmentIntegrationSchema = z.object({
  organizationId: z.string(),
  clientId: z.string(),
  assessmentId: z.string(),
  visitImpact: z.object({
    updatedDuration: z.number().optional(),
    additionalStaffing: z.array(z.string()).optional(),
    specialEquipment: z.array(z.string()).optional(),
    riskFactors: z.array(z.string()).optional(),
  }),
});

const activityScheduleSchema = z.object({
  organizationId: z.string(),
  clientId: z.string(),
  activities: z.array(z.object({
    activityType: z.enum([
      'PERSONAL_CARE',
      'MEDICATION',
      'MEAL_PREP',
      'DOMESTIC',
      'SOCIAL',
      'EXERCISE',
      'SHOPPING',
      'APPOINTMENT',
      'OTHER'
    ]),
    title: z.string(),
    description: z.string().optional(),
    startTime: z.string(),
    duration: z.number(),
    frequency: z.string(),
    requiresSpecialistStaff: z.boolean().optional(),
    staffingRequirements: z.array(z.string()).optional(),
    equipmentNeeded: z.array(z.string()).optional(),
    riskLevel: z.string().optional(),
    notes: z.string().optional(),
  })),
});

const activityCompletionSchema = z.object({
  organizationId: z.string(),
  clientId: z.string(),
  activityScheduleId: z.string(),
  completedBy: z.string(),
  completedAt: z.string().transform(val => new Date(val)),
  duration: z.number(),
  notes: z.string().optional(),
  outcome: z.string().optional(),
  clientFeedback: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, data } = body;

    switch (type) {
      case 'CARE_PLAN':
        const carePlanData = carePlanIntegrationSchema.parse(data);
        return handleCarePlanIntegration(carePlanData, session.user.id);

      case 'MEDICATION':
        const medicationData = medicationIntegrationSchema.parse(data);
        return handleMedicationIntegration(medicationData, session.user.id);

      case 'ASSESSMENT':
        const assessmentData = assessmentIntegrationSchema.parse(data);
        return handleAssessmentIntegration(assessmentData, session.user.id);

      case 'ACTIVITY_SCHEDULE':
        const activityData = activityScheduleSchema.parse(data);
        return handleActivitySchedule(activityData, session.user.id);

      case 'ACTIVITY_COMPLETION':
        const completionData = activityCompletionSchema.parse(data);
        return handleActivityCompletion(completionData);

      default:
        return new NextResponse(
          JSON.stringify({ error: 'Invalid integration type' }),
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Integration error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Integration failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
}

async function handleCarePlanIntegration(data: z.infer<typeof carePlanIntegrationSchema>, userId: string) {
  const result = await prisma.$transaction(async (tx) => {
    // Update visit requirements based on care plan
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

  return new NextResponse(
    JSON.stringify({ success: true, data: result }),
    { status: 200 }
  );
}

async function handleMedicationIntegration(data: z.infer<typeof medicationIntegrationSchema>, userId: string) {
  const result = await prisma.$transaction(async (tx) => {
    // Create medication-specific visit requirements
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

  return new NextResponse(
    JSON.stringify({ success: true, data: result }),
    { status: 200 }
  );
}

async function handleAssessmentIntegration(data: z.infer<typeof assessmentIntegrationSchema>, userId: string) {
  const result = await prisma.$transaction(async (tx) => {
    // Update visit requirements based on assessment
    const assessment = await tx.assessmentImpact.create({
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

    return { assessment };
  });

  return new NextResponse(
    JSON.stringify({ success: true, data: result }),
    { status: 200 }
  );
}

async function handleActivitySchedule(data: z.infer<typeof activityScheduleSchema>, userId: string) {
  const integrationService = new DomiciliaryIntegrationService();
  const result = await integrationService.integrateActivities(data, userId);

  return new NextResponse(
    JSON.stringify({ success: true, data: result }),
    { status: 200 }
  );
}

async function handleActivityCompletion(data: z.infer<typeof activityCompletionSchema>) {
  const integrationService = new DomiciliaryIntegrationService();
  const result = await integrationService.recordActivityCompletion(data);

  return new NextResponse(
    JSON.stringify({ success: true, data: result }),
    { status: 200 }
  );
} 