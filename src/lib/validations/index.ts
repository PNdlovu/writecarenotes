/**
 * @fileoverview Centralized validation schemas for the application
 */

import * as z from 'zod'
import { RegulatoryBody } from '@prisma/client'

// Auth validation schemas
export * from './auth'

// Staff validation schemas
const staffBaseSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.string(),
  regulatoryBody: z.nativeEnum(RegulatoryBody),
  qualifications: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  startDate: z.date(),
  contractType: z.string(),
  hoursPerWeek: z.number().min(0).max(168),
})

export const createStaffSchema = staffBaseSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const updateStaffSchema = staffBaseSchema.partial()

// Care Home validation schemas
export const careHomeSchema = z.object({
  name: z.string().min(2, 'Care home name must be at least 2 characters'),
  type: z.enum(['CARE_HOME', 'NURSING_HOME', 'DOMICILIARY']),
  regulatoryBody: z.nativeEnum(RegulatoryBody),
  address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    county: z.string(),
    postcode: z.string(),
    country: z.string()
  }),
  capacity: z.number().min(1),
  specializedCare: z.array(z.string()).optional(),
  contactDetails: z.object({
    phone: z.string(),
    email: z.string().email(),
    website: z.string().url().optional()
  })
})

// Regulatory validation schemas
export const regulatoryReportSchema = z.object({
  type: z.string(),
  subtype: z.string().optional(),
  details: z.record(z.any()),
  timestamp: z.date(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  metadata: z.record(z.any()).optional()
})

// Monitoring validation schemas
export const monitoringEventSchema = z.object({
  type: z.enum([
    'staffing',
    'care_quality',
    'medication',
    'documentation',
    'environment'
  ]),
  subtype: z.string().optional(),
  value: z.union([z.string(), z.number()]),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional()
})

// Regional settings validation
export const regionalSettingsSchema = z.object({
  regulatoryBody: z.nativeEnum(RegulatoryBody),
  language: z.string(),
  currency: z.string(),
  timeZone: z.string(),
  specializedCare: z.array(z.string()).optional()
})

// Compliance validation schemas
export const complianceValidationSchema = z.object({
  staffing: z.object({
    nurse_ratio: z.object({
      day: z.number(),
      night: z.number()
    }),
    care_worker_ratio: z.object({
      day: z.number(),
      night: z.number()
    }),
    training: z.object({
      mandatory: z.number(),
      specialized: z.number()
    })
  }),
  care_quality: z.object({
    resident_satisfaction: z.number(),
    care_plan_reviews: z.number(),
    health_metrics: z.object({
      weight_changes: z.number(),
      pressure_sores: z.number()
    })
  }),
  medication: z.object({
    errors: z.number(),
    stock_levels: z.number()
  }),
  documentation: z.object({
    completion: z.number(),
    timeliness: z.number()
  }),
  environment: z.object({
    temperature: z.number(),
    cleaning: z.object({
      high_risk: z.number(),
      standard: z.number()
    })
  })
})

// Export types
export type CreateStaffInput = z.infer<typeof createStaffSchema>
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>
export type CareHomeInput = z.infer<typeof careHomeSchema>
export type RegulatoryReportInput = z.infer<typeof regulatoryReportSchema>
export type MonitoringEventInput = z.infer<typeof monitoringEventSchema>
export type RegionalSettingsInput = z.infer<typeof regionalSettingsSchema>
export type ComplianceValidationInput = z.infer<typeof complianceValidationSchema> 


