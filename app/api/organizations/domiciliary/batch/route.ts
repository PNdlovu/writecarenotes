/**
 * @writecarenotes.com
 * @fileoverview API routes for domiciliary care batch operations
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles batch operations for domiciliary care activities including
 * bulk scheduling, updates, and completions.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { DomiciliaryBatchOperations } from '@/features/domiciliary/services/batchOperations';

const batchService = new DomiciliaryBatchOperations();

// Validation schemas
const batchScheduleSchema = z.object({
  organizationId: z.string(),
  clientIds: z.array(z.string()),
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
  recurrencePattern: z.object({
    type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    interval: z.number(),
    daysOfWeek: z.array(z.number()).optional(),
    endDate: z.string().transform(val => new Date(val)),
  }).optional(),
});

const batchCompletionSchema = z.object({
  organizationId: z.string(),
  completions: z.array(z.object({
    clientId: z.string(),
    activityScheduleId: z.string(),
    completedBy: z.string(),
    completedAt: z.string().transform(val => new Date(val)),
    duration: z.number(),
    notes: z.string().optional(),
    outcome: z.string().optional(),
    clientFeedback: z.string().optional(),
  })),
});

const batchUpdateSchema = z.object({
  organizationId: z.string(),
  updates: z.array(z.object({
    activityId: z.string(),
    changes: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      startTime: z.string().optional(),
      duration: z.number().optional(),
      frequency: z.string().optional(),
      requiresSpecialistStaff: z.boolean().optional(),
      staffingRequirements: z.array(z.string()).optional(),
      equipmentNeeded: z.array(z.string()).optional(),
      riskLevel: z.string().optional(),
      notes: z.string().optional(),
      isActive: z.boolean().optional(),
    }),
  })),
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
      case 'SCHEDULE':
        const scheduleData = batchScheduleSchema.parse(data);
        const scheduleResult = await batchService.scheduleBatchActivities(
          scheduleData,
          session.user.id
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: scheduleResult }),
          { status: 200 }
        );

      case 'COMPLETE':
        const completionData = batchCompletionSchema.parse(data);
        const completionResult = await batchService.recordBatchCompletions(
          completionData
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: completionResult }),
          { status: 200 }
        );

      case 'UPDATE':
        const updateData = batchUpdateSchema.parse(data);
        const updateResult = await batchService.updateBatchActivities(
          updateData.organizationId,
          updateData.updates,
          session.user.id
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: updateResult }),
          { status: 200 }
        );

      default:
        return new NextResponse(
          JSON.stringify({ error: 'Invalid batch operation type' }),
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Batch operation error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Batch operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
} 
