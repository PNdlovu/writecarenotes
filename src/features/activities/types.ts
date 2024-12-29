import { z } from 'zod';
import { ActivitySchema } from './schemas';

export type Activity = z.infer<typeof ActivitySchema>;

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
}

export enum ActivityFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export interface ActivityFilter {
  status?: ActivityStatus[];
  startDate?: Date;
  endDate?: Date;
  organizerId?: string;
  locationId?: string;
  priority?: ActivityPriority[];
  tags?: string[];
  search?: string;
}

export interface ActivityStats {
  total: number;
  completed: number;
  inProgress: number;
  scheduled: number;
  cancelled: number;
  participantCount: number;
}

export interface ActivityPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageParticipants: boolean;
}
