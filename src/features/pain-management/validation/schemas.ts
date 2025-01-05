/**
 * @fileoverview Pain Management Validation Schemas
 * @version 1.0.0
 * @created 2024-03-21
 */

import { z } from 'zod';
import { Region } from '@/lib/region/types';
import { PainScale, PainType } from '../types';

// Base schema for all regions
const basePainAssessmentSchema = z.object({
  residentId: z.string().uuid(),
  assessedBy: z.string().min(1),
  assessmentDate: z.date(),
  painScale: z.nativeEnum(PainScale),
  painScore: z.number().min(0).max(10),
  painType: z.nativeEnum(PainType),
  location: z.array(z.string()).min(1),
  characteristics: z.array(z.string()).optional(),
  triggers: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
});

// Region-specific schemas
export const painAssessmentSchemas = {
  [Region.ENGLAND]: basePainAssessmentSchema.extend({
    secondAssessor: z.string().min(1),
    escalationLevel: z.number().min(0).max(3),
  }),

  [Region.WALES]: basePainAssessmentSchema.extend({
    welshLanguageOffered: z.boolean(),
    translationRequired: z.boolean(),
  }),

  [Region.SCOTLAND]: basePainAssessmentSchema.extend({
    painadScore: z.number().min(0).max(10).optional(),
    cognitionLevel: z.string(),
  }),

  [Region.NORTHERN_IRELAND]: basePainAssessmentSchema.extend({
    rqiaNotificationRequired: z.boolean(),
    escalationPathway: z.string(),
  }),

  [Region.IRELAND]: basePainAssessmentSchema.extend({
    hiqaCompliance: z.boolean(),
    escalationProtocol: z.string(),
  }),
};

// Validation function that uses the correct schema based on region
export function validatePainAssessment(data: unknown, region: Region) {
  const schema = painAssessmentSchemas[region] || basePainAssessmentSchema;
  return schema.parse(data);
} 