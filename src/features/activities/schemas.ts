import { z } from 'zod';
import { 
  ActivityStatus, 
  ActivityPriority, 
  ActivityFrequency,
  ActivityCategory,
  NotificationChannel 
} from './types';

const ParticipantSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(['ORGANIZER', 'PARTICIPANT', 'OBSERVER']),
  status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED']),
  joinedAt: z.date()
});

const LocationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.enum(['ROOM', 'COMMON_AREA', 'OUTDOOR', 'EXTERNAL']),
  capacity: z.number().int().positive().optional()
});

const NotificationTimingSchema = z.object({
  type: z.enum(['BEFORE', 'AFTER']),
  minutes: z.number().int().positive()
});

const NotificationSettingSchema = z.object({
  channel: z.nativeEnum(NotificationChannel),
  timing: NotificationTimingSchema,
  recipients: z.array(z.string().email())
});

const RecurrenceSchema = z.object({
  pattern: z.nativeEnum(ActivityFrequency),
  interval: z.number().int().positive(),
  endDate: z.date().optional(),
  count: z.number().int().positive().optional()
}).refine(
  data => data.endDate || data.count,
  'Either endDate or count must be specified'
);

export const ActivitySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  startTime: z.date(),
  endTime: z.date(),
  status: z.nativeEnum(ActivityStatus),
  priority: z.nativeEnum(ActivityPriority),
  category: z.nativeEnum(ActivityCategory),
  frequency: z.nativeEnum(ActivityFrequency),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().uuid(),
  participants: z.array(ParticipantSchema),
  location: LocationSchema,
  tags: z.array(z.string().min(1).max(50)),
  notifications: z.array(NotificationSettingSchema),
  recurrence: RecurrenceSchema.optional(),
  metadata: z.record(z.unknown()).optional()
}).refine(
  data => data.startTime < data.endTime,
  'End time must be after start time'
).refine(
  data => data.participants.some(p => p.role === 'ORGANIZER'),
  'Activity must have at least one organizer'
);

export const ActivityFilterSchema = z.object({
  status: z.array(z.nativeEnum(ActivityStatus)).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  organizerId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  priority: z.array(z.nativeEnum(ActivityPriority)).optional(),
  category: z.array(z.nativeEnum(ActivityCategory)).optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  participants: z.array(z.string().uuid()).optional()
}).refine(
  data => !data.startDate || !data.endDate || data.startDate <= data.endDate,
  'Start date must be before or equal to end date'
);

export const ActivityCreateSchema = ActivitySchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  createdBy: true 
});

export const ActivityUpdateSchema = ActivityCreateSchema.partial();

export const ActivityStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  inProgress: z.number().int().nonnegative(),
  scheduled: z.number().int().nonnegative(),
  cancelled: z.number().int().nonnegative(),
  participantCount: z.number().int().nonnegative(),
  byCategory: z.record(z.nativeEnum(ActivityCategory), z.number().int().nonnegative()),
  byPriority: z.record(z.nativeEnum(ActivityPriority), z.number().int().nonnegative()),
  averageDuration: z.number().nonnegative(),
  completionRate: z.number().min(0).max(100)
});
