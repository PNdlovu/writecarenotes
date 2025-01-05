/**
 * WriteCareNotes.com
 * @fileoverview Organization Validation
 * @version 1.0.0
 */

import { z } from 'zod';
import { ValidationError } from '@/lib/errors';

// Address Schema
const addressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  county: z.string().min(1, 'County is required'),
  postcode: z.string().regex(/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/, 'Invalid UK postcode'),
  country: z.string().min(1, 'Country is required'),
});

// Contact Schema
const contactSchema = z.object({
  id: z.string().uuid('Invalid contact ID'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().min(1, 'Role is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Invalid phone number'),
  primary: z.boolean(),
});

// Document Schema
const documentSchema = z.object({
  id: z.string().uuid('Invalid document ID'),
  type: z.string().min(1, 'Document type is required'),
  name: z.string().min(1, 'Document name is required'),
  url: z.string().url('Invalid document URL'),
  uploaded: z.date(),
  expires: z.date().optional(),
});

// Care Home Schema
const careHomeSchema = z.object({
  id: z.string().uuid('Invalid care home ID'),
  name: z.string().min(2, 'Care home name must be at least 2 characters'),
  type: z.string().min(1, 'Care home type is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  address: addressSchema,
});

// Settings Schema
const settingsSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required'),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']),
  currency: z.enum(['GBP', 'EUR']),
  language: z.enum(['en', 'cy', 'gd', 'ga']),
  theme: z.string().min(1, 'Theme is required'),
}).catchall(z.unknown());

// Organization Schema
export const organizationSchema = z.object({
  id: z.string().uuid('Invalid organization ID'),
  tenantId: z.string().uuid('Invalid tenant ID'),
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  type: z.enum(['SINGLE_SITE', 'MULTI_SITE', 'CORPORATE', 'FRANCHISE']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  region: z.enum(['GB-ENG', 'GB-WLS', 'GB-SCT', 'GB-NIR', 'IRL']),
  settings: settingsSchema,
  compliance: z.object({
    framework: z.string().min(1, 'Compliance framework is required'),
    requirements: z.array(z.string()),
    certifications: z.array(z.string()),
    lastAudit: z.date().optional(),
    nextAudit: z.date().optional(),
  }),
  subscription: z.object({
    plan: z.string().min(1, 'Subscription plan is required'),
    status: z.string().min(1, 'Subscription status is required'),
    features: z.array(z.string()),
    limits: z.object({
      users: z.number().min(1),
      storage: z.number().min(0),
      careHomes: z.number().min(1),
    }).catchall(z.number()),
    expiry: z.date().optional(),
  }),
  careHomes: z.array(careHomeSchema),
  contacts: z.array(contactSchema),
  documents: z.array(documentSchema),
  audit: z.object({
    created: z.object({
      by: z.string(),
      at: z.date(),
    }),
    updated: z.object({
      by: z.string(),
      at: z.date(),
    }),
    version: z.number().min(1),
  }),
});

export type Organization = z.infer<typeof organizationSchema>;

export function validateOrganization(data: unknown): Organization {
  try {
    return organizationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid organization data', error.errors);
    }
    throw error;
  }
}

export function validatePartialOrganization(data: unknown): Partial<Organization> {
  try {
    return organizationSchema.partial().parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid organization data', error.errors);
    }
    throw error;
  }
}

export function validateCareHome(data: unknown): Organization['careHomes'][0] {
  try {
    return careHomeSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid care home data', error.errors);
    }
    throw error;
  }
}

export function validateSettings(data: unknown): Organization['settings'] {
  try {
    return settingsSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid settings data', error.errors);
    }
    throw error;
  }
} 