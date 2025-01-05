/**
 * @fileoverview Assessment constants and enums
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { AssessmentType, AssessmentStatus, AssessmentCategory, RiskLevel } from '@prisma/client';

// Type-safe assessment type constants
export const ASSESSMENT_TYPES: Record<AssessmentType, AssessmentType> = {
  INITIAL: 'INITIAL',
  PERIODIC: 'PERIODIC',
  INCIDENT: 'INCIDENT',
  CARE_REVIEW: 'CARE_REVIEW',
  MENTAL_CAPACITY: 'MENTAL_CAPACITY',
  NUTRITION: 'NUTRITION',
  MOBILITY: 'MOBILITY',
  MEDICATION: 'MEDICATION',
} as const;

// Type-safe assessment status constants
export const ASSESSMENT_STATUS: Record<AssessmentStatus, AssessmentStatus> = {
  DRAFT: 'DRAFT',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_REVIEW: 'PENDING_REVIEW',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const;

// Type-safe assessment category constants
export const ASSESSMENT_CATEGORIES: Record<AssessmentCategory, AssessmentCategory> = {
  HEALTH: 'HEALTH',
  SOCIAL: 'SOCIAL',
  MENTAL: 'MENTAL',
  NUTRITION: 'NUTRITION',
  MOBILITY: 'MOBILITY',
  MEDICATION: 'MEDICATION',
} as const;

// Type-safe risk level constants
export const RISK_LEVELS: Record<RiskLevel, RiskLevel> = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

// Question type constants
export const QUESTION_TYPES = {
  TEXT: 'TEXT',
  CHOICE: 'CHOICE',
  SCALE: 'SCALE',
  DATE: 'DATE',
  FILE: 'FILE',
  SIGNATURE: 'SIGNATURE',
} as const;

// Regional compliance intervals (in days)
export const REVIEW_INTERVALS = {
  CQC: {
    INITIAL: 7,
    PERIODIC: 30,
    HIGH_RISK: 7,
  },
  CIW: {
    INITIAL: 7,
    PERIODIC: 28,
    HIGH_RISK: 7,
  },
  HIQA: {
    INITIAL: 7,
    PERIODIC: 30,
    HIGH_RISK: 7,
  },
} as const; 


