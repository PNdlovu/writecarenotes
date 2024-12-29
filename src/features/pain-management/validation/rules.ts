/**
 * @fileoverview Pain Management Validation Rules
 * @version 1.0.0
 * @created 2024-03-21
 */

import { z } from 'zod';
import { PainAssessment } from '../types';
import { Region } from '@/lib/region/types';

// Intervention validation schema
const interventionSchema = z.object({
  type: z.enum(['MEDICATION', 'NON_MEDICATION']),
  name: z.string().min(1),
  dose: z.string().optional(),
  route: z.string().optional(),
  effectiveness: z.number().min(0).max(10),
  sideEffects: z.array(z.string()).optional(),
  administeredBy: z.string(),
  witnessedBy: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

// Regional validation rules
export const regionalValidationRules = {
  [Region.ENGLAND]: {
    requiresDoubleSignOff: (score: number) => score >= 7,
    maxAssessmentInterval: 4, // hours
    escalationThresholds: {
      amber: 5,
      red: 7,
    },
    requiredFields: ['secondAssessor', 'escalationLevel'],
  },
  [Region.WALES]: {
    languageRequirements: true,
    translationAvailable: true,
    maxAssessmentInterval: 6,
    escalationThresholds: {
      amber: 6,
      red: 8,
    },
    requiredFields: ['welshLanguageOffered', 'translationRequired'],
  },
  // ... other regions
};

// Time-based validation rules
export const timeValidationRules = {
  maxFutureTime: 0, // Cannot be in future
  minTimeBetweenAssessments: 15, // minutes
  maxTimeBetweenAssessments: 24 * 60, // minutes
  escalationResponseTime: 30, // minutes for high scores
};

// Cross-validation rules
export function validateAssessmentConsistency(assessment: PainAssessment): boolean {
  // Check pain score matches description
  if (assessment.painScore >= 7 && !assessment.characteristics.includes('SEVERE')) {
    return false;
  }

  // Validate intervention timing
  if (assessment.interventions.some(i => new Date(i.startTime) > new Date())) {
    return false;
  }

  // Check for required documentation on high scores
  if (assessment.painScore >= 7 && !assessment.escalationProcedure) {
    return false;
  }

  return true;
} 