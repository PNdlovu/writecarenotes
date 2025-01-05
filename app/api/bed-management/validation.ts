/**
 * @fileoverview Validation schemas for bed management
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { z } from 'zod';

// Enums
export const BedTypeEnum = z.enum(['STANDARD', 'BARIATRIC', 'LOW', 'ELECTRIC', 'SPECIALTY']);
export const BedStatusEnum = z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING', 'RESERVED']);
export const CleaningTypeEnum = z.enum(['ROUTINE', 'DEEP_CLEAN', 'INFECTION_CONTROL']);
export const CleaningStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);
export const RiskLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const AuditTypeEnum = z.enum(['SAFETY', 'COMPLIANCE', 'QUALITY']);
export const WaitlistStatusEnum = z.enum(['ACTIVE', 'FULFILLED', 'CANCELLED']);
export const CareLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'INTENSIVE']);
export const PriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'EMERGENCY']);

// Base schemas
export const bedSchema = z.object({
  number: z.string(),
  type: BedTypeEnum,
  status: BedStatusEnum,
  floor: z.number().int(),
  wing: z.string(),
  features: z.array(z.string()),
  lastMaintenanceDate: z.date().optional().nullable(),
  nextMaintenanceDate: z.date().optional().nullable(),
  notes: z.string().optional().nullable(),
  careLevel: CareLevelEnum,
  isIsolation: z.boolean(),
  hasOxygenSupply: z.boolean(),
  hasCallBell: z.boolean(),
  maxWeight: z.number().optional().nullable(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number()
  }).optional().nullable(),
  specializedEquipment: z.array(z.string()),
  riskLevel: RiskLevelEnum,
  infectionControl: z.boolean(),
  pressureRelief: z.boolean(),
  fallPrevention: z.boolean(),
  nurseCallSystem: z.record(z.any()).optional().nullable(),
  environmentControl: z.record(z.any()).optional().nullable(),
  currentOccupantId: z.string().optional().nullable()
});

export const bedCleaningSchema = z.object({
  bedId: z.string().uuid(),
  type: CleaningTypeEnum,
  cleaningProducts: z.array(z.string()),
  infectionType: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  images: z.array(z.string())
});

export const bedRiskAssessmentSchema = z.object({
  bedId: z.string().uuid(),
  assessmentDate: z.date(),
  riskFactors: z.record(z.any()),
  mitigationMeasures: z.record(z.any()),
  reviewDate: z.date(),
  riskLevel: RiskLevelEnum
});

export const bedAuditSchema = z.object({
  bedId: z.string().uuid(),
  auditDate: z.date(),
  type: AuditTypeEnum,
  checklist: z.record(z.any()),
  findings: z.array(z.string()),
  recommendations: z.array(z.string()),
  complianceScore: z.number().min(0).max(100),
  followUpRequired: z.boolean(),
  followUpDate: z.date().optional().nullable()
});

export const waitlistSchema = z.object({
  residentId: z.string().uuid(),
  preferredBedType: BedTypeEnum,
  priority: PriorityEnum,
  requestDate: z.date(),
  careLevelRequired: CareLevelEnum,
  specialRequirements: z.array(z.string()),
  preferredFloor: z.number().int().optional().nullable(),
  preferredWing: z.string().optional().nullable(),
  medicalEquipmentNeeded: z.array(z.string()),
  notes: z.string().optional().nullable(),
  estimatedWaitTime: z.number().int().optional().nullable()
});

// Request/Response types
export type BedRequest = z.infer<typeof bedSchema>;
export type BedCleaningRequest = z.infer<typeof bedCleaningSchema>;
export type BedRiskAssessmentRequest = z.infer<typeof bedRiskAssessmentSchema>;
export type BedAuditRequest = z.infer<typeof bedAuditSchema>;
export type WaitlistRequest = z.infer<typeof waitlistSchema>;

// Response wrappers
export const successResponse = <T>(data: T) => ({
  success: true as const,
  data
});

export const errorResponse = (message: string, code?: string) => ({
  success: false as const,
  error: {
    message,
    code
  }
}); 
