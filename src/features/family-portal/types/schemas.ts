/**
 * @fileoverview Validation Schemas for Family Portal
 * @version 1.0.0
 * @created 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Zod schemas for validating Family Portal data structures
 */

import { z } from 'zod';

// Base schemas for reusable patterns
const contactInfoSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  address: z.string().optional(),
});

const dateRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
}).refine(data => data.from <= data.to, {
  message: "End date must be after start date"
});

// Family Member Schema
export const familyMemberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  relationship: z.string().min(1),
  contactInfo: contactInfoSchema,
  preferences: z.object({
    language: z.string(),
    notificationPreferences: z.array(z.string()),
    communicationMethod: z.string(),
  }),
  permissions: z.array(z.string()),
});

// Care Note Schema
export const careNoteSchema = z.object({
  content: z.string().min(1),
  category: z.string(),
  visibility: z.string(),
  attachments: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

// Visit Schema
export const visitSchema = z.object({
  visitType: z.string(),
  scheduledTime: z.date(),
  duration: z.number().min(15), // minimum 15 minutes
  visitors: z.array(z.string()),
  purpose: z.string(),
  requirements: z.array(z.string()).optional(),
});

// Document Schema
export const documentSchema = z.object({
  title: z.string().min(1),
  type: z.string(),
  content: z.string(),
  metadata: z.object({
    category: z.string(),
    tags: z.array(z.string()).optional(),
    visibility: z.string(),
  }),
  expiryDate: z.date().optional(),
});

// Memory Schema
export const memorySchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  date: z.date(),
  type: z.string(),
  mediaUrls: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.string(),
});

// Emergency Contact Schema
export const emergencyContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  relationship: z.string().min(1),
  priority: z.number().min(1).max(5),
  contactInfo: contactInfoSchema,
  availability: z.object({
    timeZone: z.string(),
    preferredTimes: z.array(z.string()),
  }).optional(),
});

// Care Team Member Schema
export const careTeamMemberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.string(),
  department: z.string(),
  contactInfo: contactInfoSchema,
  schedule: z.object({
    workDays: z.array(z.string()),
    shiftHours: z.object({
      start: z.string(),
      end: z.string(),
    }),
  }),
  qualifications: z.array(z.string()).optional(),
});

// Analytics Schemas
export const timeframeSchema = dateRangeSchema;

export const metricsFilterSchema = z.object({
  timeframe: timeframeSchema,
  categories: z.array(z.string()).optional(),
  groupBy: z.string().optional(),
});


