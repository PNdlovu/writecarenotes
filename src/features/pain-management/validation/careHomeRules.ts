/**
 * @fileoverview Care Home Pain Assessment Validation Rules
 */

import { ResidentPainScale } from '../types/care-home';

export const cognitiveStatusRules = {
  FULLY_AWARE: [ResidentPainScale.NUMERIC, ResidentPainScale.FACES],
  MILD_IMPAIRMENT: [ResidentPainScale.FACES, ResidentPainScale.PAINAD],
  MODERATE_IMPAIRMENT: [ResidentPainScale.PAINAD, ResidentPainScale.BEHAVIORAL],
  SEVERE_IMPAIRMENT: [ResidentPainScale.ABBEY, ResidentPainScale.BEHAVIORAL],
  NON_VERBAL: [ResidentPainScale.ABBEY, ResidentPainScale.BEHAVIORAL]
};

export const shiftAssessmentRules = {
  EARLY: {
    minimumAssessments: 1,
    timings: ['08:00', '12:00']
  },
  LATE: {
    minimumAssessments: 1,
    timings: ['16:00', '20:00']
  },
  NIGHT: {
    minimumAssessments: 1,
    timings: ['22:00', '04:00']
  }
};

export const interventionRules = {
  MEDICATION: {
    requiresNurseSignOff: true,
    requiresSecondCheck: true,
    maxDuration: 12 // hours
  },
  POSITIONING: {
    requiresNurseSignOff: false,
    requiresSecondCheck: false,
    maxDuration: 4 // hours
  },
  // ... other intervention rules
}; 