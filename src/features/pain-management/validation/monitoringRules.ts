/**
 * @fileoverview Care Home Pain Monitoring Rules
 * @version 1.0.0
 * @created 2024-03-21
 */

export const careHomePainRules = {
  // Monitoring frequencies based on pain level
  assessmentFrequency: {
    HIGH_PAIN: {
      frequency: 2,          // hours
      requiresNurseReview: true,
      requiresGPNotification: true,
      maxDurationBeforeEscalation: 24 // hours
    },
    MODERATE_PAIN: {
      frequency: 4,          // hours
      requiresNurseReview: true,
      requiresGPNotification: false,
      maxDurationBeforeEscalation: 48 // hours
    },
    LOW_PAIN: {
      frequency: 8,          // hours
      requiresNurseReview: false,
      requiresGPNotification: false,
      maxDurationBeforeEscalation: 72 // hours
    }
  },

  // Shift handover requirements
  handover: {
    requiresDetailedPainHistory: true,
    requiresInterventionEffectiveness: true,
    requiresNextAssessmentTime: true,
    requiresResidentPreferences: true
  },

  // Documentation requirements
  documentation: {
    requiresBehaviorObservation: true,
    requiresActivityImpact: true,
    requiresMoodTracking: true,
    requiresSleepImpact: true,
    requiresAppetiteImpact: true
  },

  // Escalation thresholds
  escalation: {
    painScoreThreshold: 7,
    consecutiveHighScores: 3,
    noImprovementPeriod: 48, // hours
    requiresOutOfHoursGP: true
  }
};

export const residentTypeRules = {
  DEMENTIA: {
    preferredScales: ['PAINAD', 'ABBEY'],
    requiresBehaviorMapping: true,
    extendedObservationPeriod: 30, // minutes
    requiresTwoObservers: true
  },
  ENDOFLIFE: {
    assessmentFrequency: 2, // hours
    requiresSpecialistReview: true,
    priorityResponse: true,
    comfortMeasuresFirst: true
  },
  MOBILITY_ISSUES: {
    includePositionalPain: true,
    requiresPhysioInput: true,
    positionChangeFrequency: 2 // hours
  }
}; 