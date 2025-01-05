import { z } from 'zod';
import { ActivitySchema } from './schemas';

export enum ActivityStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ActivityPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ActivityFrequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum ActivityCategory {
  MEDICAL = 'MEDICAL',
  SOCIAL = 'SOCIAL',
  THERAPY = 'THERAPY',
  EXERCISE = 'EXERCISE',
  RECREATION = 'RECREATION',
  EDUCATION = 'EDUCATION',
  OTHER = 'OTHER',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export interface Participant {
  readonly id: string;
  readonly userId: string;
  role: 'ORGANIZER' | 'PARTICIPANT' | 'OBSERVER';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  readonly joinedAt: Date;
}

export interface Location {
  id: string;
  name: string;
  type: 'ROOM' | 'COMMON_AREA' | 'OUTDOOR' | 'EXTERNAL';
  capacity?: number;
}

export interface NotificationSetting {
  channel: NotificationChannel;
  timing: {
    type: 'BEFORE' | 'AFTER';
    minutes: number;
  };
  recipients: string[];
}

export interface Activity {
  readonly id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: ActivityStatus;
  priority: ActivityPriority;
  category: ActivityCategory;
  frequency: ActivityFrequency;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string;
  participants: readonly Participant[];
  location: Location;
  tags: readonly string[];
  notifications: readonly NotificationSetting[];
  recurrence?: {
    pattern: ActivityFrequency;
    interval: number;
    endDate?: Date;
    count?: number;
  };
  metadata?: Record<string, unknown>;
}

export interface ActivityFilter {
  status?: ActivityStatus[];
  startDate?: Date;
  endDate?: Date;
  organizerId?: string;
  locationId?: string;
  priority?: ActivityPriority[];
  category?: ActivityCategory[];
  tags?: string[];
  search?: string;
  participants?: string[];
}

export interface ActivityStats {
  total: number;
  completed: number;
  inProgress: number;
  scheduled: number;
  cancelled: number;
  participantCount: number;
  byCategory: Record<ActivityCategory, number>;
  byPriority: Record<ActivityPriority, number>;
  averageDuration: number;
  completionRate: number;
}

export interface ActivityPermissions {
  readonly canView: boolean;
  readonly canCreate: boolean;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly canManageParticipants: boolean;
  readonly canExport: boolean;
  readonly canImport: boolean;
}

// Type Guards
export function isActivity(value: unknown): value is Activity {
  return ActivitySchema.safeParse(value).success;
}

export function isValidDateRange(startTime: Date, endTime: Date): boolean {
  return startTime < endTime;
}

export function hasRequiredParticipants(activity: Activity): boolean {
  return activity.participants.some(p => p.role === 'ORGANIZER');
}

// Utility Types
export type ActivityCreateInput = Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
export type ActivityUpdateInput = Partial<Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>;
export type ActivityWithRelations = Activity & {
  organizer: { id: string; name: string };
  careHome: { id: string; name: string };
};
