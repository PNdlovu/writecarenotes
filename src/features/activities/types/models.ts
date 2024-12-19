/**
 * @fileoverview Activity domain models and types
 * @version 1.0.0
 * @created 2024-12-13
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { z } from 'zod';

/**
 * Activity category for better organization and filtering
 */
export enum ActivityCategory {
  PHYSICAL = 'PHYSICAL',
  SOCIAL = 'SOCIAL',
  COGNITIVE = 'COGNITIVE',
  CREATIVE = 'CREATIVE',
  THERAPEUTIC = 'THERAPEUTIC',
  ENTERTAINMENT = 'ENTERTAINMENT',
}

/**
 * Activity recurrence pattern
 */
export enum RecurrencePattern {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

/**
 * Activity status with offline sync support
 */
export enum ActivityStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
  PENDING_SYNC = 'PENDING_SYNC', // For offline changes
  SYNC_FAILED = 'SYNC_FAILED',   // For failed syncs
}

/**
 * Participant type for activity
 */
export interface ActivityParticipant {
  id: string;
  userId: string;
  activityId: string;
  role: 'ORGANIZER' | 'PARTICIPANT' | 'OBSERVER';
  status: 'INVITED' | 'CONFIRMED' | 'DECLINED' | 'ATTENDED';
  notes?: string;
  attendanceRecorded?: Date;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string; // For multi-tenant support
}

/**
 * Activity resource/material needed
 */
export interface ActivityResource {
  id: string;
  activityId: string;
  name: string;
  quantity: number;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'PENDING';
  notes?: string;
  organizationId: string;
}

/**
 * Activity feedback/outcome
 */
export interface ActivityOutcome {
  id: string;
  activityId: string;
  participantId: string;
  rating?: number;
  feedback?: string;
  mood?: string;
  engagement?: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
  recordedBy: string;
  recordedAt: Date;
  organizationId: string;
}

/**
 * Main activity interface with full enterprise features
 */
export interface Activity {
  id: string;
  name: string;
  description?: string;
  category: ActivityCategory;
  startTime: Date;
  endTime: Date;
  timezone: string;
  location?: string;
  capacity?: number;
  status: ActivityStatus;
  recurrence: RecurrencePattern;
  recurrenceEndDate?: Date;
  resources?: ActivityResource[];
  participants?: ActivityParticipant[];
  outcomes?: ActivityOutcome[];
  riskAssessment?: string;
  organizerId: string;
  organizationId: string; // Multi-tenant support
  departmentId?: string;  // For large organizations
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt?: Date;   // For offline sync
  version: number;       // For conflict resolution
  isArchived: boolean;
  metadata?: Record<string, unknown>; // Extensible fields
}

/**
 * Activity validation schema
 */
export const activitySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.nativeEnum(ActivityCategory),
  startTime: z.date(),
  endTime: z.date(),
  timezone: z.string(),
  location: z.string().optional(),
  capacity: z.number().positive().optional(),
  status: z.nativeEnum(ActivityStatus),
  recurrence: z.nativeEnum(RecurrencePattern),
  recurrenceEndDate: z.date().optional(),
  organizerId: z.string().uuid(),
  organizationId: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
});


