/**
 * @fileoverview Validation schemas for calendar events
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { z } from 'zod';

const eventTypes = ['appointment', 'activity', 'medication', 'assessment'] as const;
const eventStatuses = ['scheduled', 'completed', 'cancelled'] as const;
const regions = ['england', 'wales', 'scotland', 'northern-ireland', 'ireland'] as const;
const regulatoryBodies = ['CQC', 'CIW', 'CI', 'HIQA', 'RQIA'] as const;
const languages = ['en', 'cy', 'gd', 'ga'] as const;
const categories = ['care', 'health', 'social', 'administrative'] as const;
const priorities = ['routine', 'important', 'urgent'] as const;
const recurrencePatterns = ['daily', 'weekly', 'monthly', 'custom'] as const;
const notificationTypes = ['email', 'sms', 'push', 'system'] as const;

const translationsSchema = z.record(z.enum(languages), z.string()).optional();

const regulatoryRequirementsSchema = z.object({
  assessmentType: z.string().optional(),
  frequency: z.string().optional(),
  lastCompleted: z.string().datetime().optional(),
  nextDue: z.string().datetime().optional(),
}).optional();

const recurrenceSchema = z.object({
  pattern: z.enum(recurrencePatterns),
  interval: z.number().positive(),
  endDate: z.string().datetime().optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
}).optional();

const attachmentSchema = z.object({
  name: z.string(),
  type: z.string(),
  url: z.string().url(),
});

const notificationSchema = z.object({
  type: z.enum(notificationTypes),
  recipients: z.array(z.string()),
  scheduledFor: z.string().datetime(),
});

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  titleTranslations: translationsSchema,
  date: z.string().datetime({ message: 'Invalid date format' }),
  type: z.enum(eventTypes, {
    errorMap: () => ({ message: 'Invalid event type' }),
  }),
  description: z.string().optional(),
  descriptionTranslations: translationsSchema,
  residentId: z.string().uuid().optional(),
  staffId: z.string().uuid().optional(),
  region: z.enum(regions, {
    errorMap: () => ({ message: 'Invalid region' }),
  }),
  regulatoryBody: z.enum(regulatoryBodies, {
    errorMap: () => ({ message: 'Invalid regulatory body' }),
  }),
  regulatoryRequirements: regulatoryRequirementsSchema,
  recurrence: recurrenceSchema,
  category: z.enum(categories).optional(),
  priority: z.enum(priorities),
  attachments: z.array(attachmentSchema).optional(),
  notifications: z.array(notificationSchema).optional(),
  facilityId: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateEventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').optional(),
  titleTranslations: translationsSchema,
  date: z.string().datetime({ message: 'Invalid date format' }).optional(),
  type: z.enum(eventTypes, {
    errorMap: () => ({ message: 'Invalid event type' }),
  }).optional(),
  description: z.string().optional(),
  descriptionTranslations: translationsSchema,
  residentId: z.string().uuid().optional(),
  staffId: z.string().uuid().optional(),
  status: z.enum(eventStatuses, {
    errorMap: () => ({ message: 'Invalid status' }),
  }).optional(),
  region: z.enum(regions, {
    errorMap: () => ({ message: 'Invalid region' }),
  }).optional(),
  regulatoryBody: z.enum(regulatoryBodies, {
    errorMap: () => ({ message: 'Invalid regulatory body' }),
  }).optional(),
  regulatoryRequirements: regulatoryRequirementsSchema,
  recurrence: recurrenceSchema,
  category: z.enum(categories).optional(),
  priority: z.enum(priorities).optional(),
  attachments: z.array(attachmentSchema).optional(),
  notifications: z.array(notificationSchema).optional(),
  facilityId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
}); 
