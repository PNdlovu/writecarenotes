import { z } from 'zod';

export const ActivitySchema = z.object({
  name: z.string().min(1).max(255),
  startTime: z.string().or(z.date()),
  endTime: z.string().or(z.date()),
  description: z.string().optional(),
  location: z.string().optional(),
  participants: z.array(z.string()).optional(),
  organizerId: z.string(),
  organizationId: z.string(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  metadata: z.record(z.any()).optional(),
  isPrivate: z.boolean().optional(),
  maxParticipants: z.number().optional(),
  repeatSchedule: z.object({
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
    interval: z.number(),
    endDate: z.string().or(z.date()).optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  notificationSettings: z.object({
    reminderBefore: z.number(),
    notifyParticipants: z.boolean(),
    notificationChannels: z.array(z.enum(['EMAIL', 'SMS', 'PUSH'])),
  }).optional(),
});
