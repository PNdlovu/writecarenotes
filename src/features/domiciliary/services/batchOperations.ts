/**
 * @writecarenotes.com
 * @fileoverview Batch operations service for domiciliary care
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

import { prisma } from '@/lib/prisma';
import { 
  DomiciliaryActivityType,
  DomiciliaryActivitySchedule,
  DomiciliaryActivityCompletion
} from '@prisma/client';
import { 
  findActivityConflicts, 
  generateRecurringSchedule,
  validateStaffingRequirements 
} from '../utils/activityUtils';

export interface BatchActivitySchedule {
  organizationId: string;
  clientIds: string[];
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
  recurrencePattern?: {
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    interval: number;
    daysOfWeek?: number[];
    endDate: Date;
  };
}

export interface BatchActivityCompletion {
  organizationId: string;
  completions: {
    clientId: string;
    activityScheduleId: string;
    completedBy: string;
    completedAt: Date;
    duration: number;
    notes?: string;
    outcome?: string;
    clientFeedback?: string;
  }[];
}

export interface BatchUpdateResult {
  success: boolean;
  created: number;
  failed: number;
  errors: {
    clientId?: string;
    activityId?: string;
    error: string;
  }[];
}

export class DomiciliaryBatchOperations {
  /**
   * Creates activities for multiple clients
   */
  async scheduleBatchActivities(
    data: BatchActivitySchedule,
    userId: string
  ): Promise<BatchUpdateResult> {
    const result: BatchUpdateResult = {
      success: true,
      created: 0,
      failed: 0,
      errors: []
    };

    await prisma.$transaction(async (tx) => {
      // Validate clients exist
      const clients = await tx.client.findMany({
        where: { 
          id: { in: data.clientIds },
          organizationId: data.organizationId
        }
      });

      if (clients.length !== data.clientIds.length) {
        result.success = false;
        result.errors.push({
          error: 'One or more clients not found'
        });
        return result;
      }

      // Get available staff
      const availableStaff = await tx.user.findMany({
        where: {
          organizationId: data.organizationId,
          role: 'CARE_WORKER'
        },
        select: {
          id: true,
          qualifications: true,
          specialties: true
        }
      });

      for (const clientId of data.clientIds) {
        try {
          // Get existing activities for conflict checking
          const existingActivities = await tx.domiciliaryActivitySchedule.findMany({
            where: {
              organizationId: data.organizationId,
              clientId,
              isActive: true
            }
          });

          for (const activity of data.activities) {
            // Validate staffing requirements
            if (!validateStaffingRequirements(activity, availableStaff)) {
              result.failed++;
              result.errors.push({
                clientId,
                error: 'Insufficient qualified staff available'
              });
              continue;
            }

            // Generate schedule if recurring
            const schedules = data.recurrencePattern
              ? generateRecurringSchedule(activity, data.recurrencePattern)
              : [{ startTime: activity.startTime, duration: activity.duration }];

            for (const schedule of schedules) {
              // Check for conflicts
              const conflicts = findActivityConflicts(
                { ...activity, ...schedule },
                existingActivities
              );

              if (conflicts.length > 0) {
                result.failed++;
                result.errors.push({
                  clientId,
                  error: `Activity conflicts with existing schedule: ${conflicts.map(c => c.conflictType).join(', ')}`
                });
                continue;
              }

              // Create activity
              await tx.domiciliaryActivitySchedule.create({
                data: {
                  organizationId: data.organizationId,
                  clientId,
                  activityType: activity.activityType,
                  title: activity.title,
                  description: activity.description,
                  startTime: schedule.startTime,
                  duration: schedule.duration,
                  frequency: activity.frequency,
                  requiresSpecialistStaff: activity.requiresSpecialistStaff,
                  staffingRequirements: activity.staffingRequirements,
                  equipmentNeeded: activity.equipmentNeeded,
                  riskLevel: activity.riskLevel,
                  notes: activity.notes,
                  createdBy: userId,
                  updatedBy: userId,
                }
              });

              result.created++;
            }
          }
        } catch (error) {
          result.failed++;
          result.errors.push({
            clientId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    });

    result.success = result.failed === 0;
    return result;
  }

  /**
   * Records completion for multiple activities
   */
  async recordBatchCompletions(
    data: BatchActivityCompletion
  ): Promise<BatchUpdateResult> {
    const result: BatchUpdateResult = {
      success: true,
      created: 0,
      failed: 0,
      errors: []
    };

    await prisma.$transaction(async (tx) => {
      for (const completion of data.completions) {
        try {
          // Validate activity schedule exists
          const schedule = await tx.domiciliaryActivitySchedule.findFirst({
            where: {
              id: completion.activityScheduleId,
              organizationId: data.organizationId,
              clientId: completion.clientId,
              isActive: true
            }
          });

          if (!schedule) {
            result.failed++;
            result.errors.push({
              clientId: completion.clientId,
              activityId: completion.activityScheduleId,
              error: 'Activity schedule not found'
            });
            continue;
          }

          // Record completion
          await tx.domiciliaryActivityCompletion.create({
            data: {
              activityScheduleId: completion.activityScheduleId,
              organizationId: data.organizationId,
              clientId: completion.clientId,
              completedBy: completion.completedBy,
              completedAt: completion.completedAt,
              duration: completion.duration,
              notes: completion.notes,
              outcome: completion.outcome,
              clientFeedback: completion.clientFeedback,
            }
          });

          result.created++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            clientId: completion.clientId,
            activityId: completion.activityScheduleId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    });

    result.success = result.failed === 0;
    return result;
  }

  /**
   * Updates multiple activities
   */
  async updateBatchActivities(
    organizationId: string,
    updates: {
      activityId: string;
      changes: Partial<Omit<DomiciliaryActivitySchedule, 'id' | 'createdAt' | 'updatedAt'>>;
    }[],
    userId: string
  ): Promise<BatchUpdateResult> {
    const result: BatchUpdateResult = {
      success: true,
      created: 0,
      failed: 0,
      errors: []
    };

    await prisma.$transaction(async (tx) => {
      for (const update of updates) {
        try {
          const activity = await tx.domiciliaryActivitySchedule.findFirst({
            where: {
              id: update.activityId,
              organizationId,
              isActive: true
            }
          });

          if (!activity) {
            result.failed++;
            result.errors.push({
              activityId: update.activityId,
              error: 'Activity not found'
            });
            continue;
          }

          await tx.domiciliaryActivitySchedule.update({
            where: { id: update.activityId },
            data: {
              ...update.changes,
              updatedBy: userId
            }
          });

          result.created++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            activityId: update.activityId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    });

    result.success = result.failed === 0;
    return result;
  }
} 