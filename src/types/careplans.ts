/**
 * @fileoverview Care Plan type definitions for WriteNotes Enterprise Platform
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Type definitions for the care plan module, supporting all care types and regional requirements.
 */

import { z } from 'zod';

/**
 * Care plan categories based on different care settings and resident types
 */
export const CarePlanCategory = {
  ELDERLY: 'elderly',
  NURSING: 'nursing',
  DEMENTIA: 'dementia',
  LEARNING_DISABILITIES: 'learning_disabilities',
  PHYSICAL_DISABILITIES: 'physical_disabilities',
  MENTAL_HEALTH: 'mental_health',
  AUTISM: 'autism',
  CHILDRENS: 'childrens',
  DOMICILIARY: 'domiciliary',
  RESPITE: 'respite',
  END_OF_LIFE: 'end_of_life',
} as const;

export type CarePlanCategory = typeof CarePlanCategory[keyof typeof CarePlanCategory];

/**
 * Care plan status tracking
 */
export const CarePlanStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  UNDER_REVIEW: 'under_review',
  ARCHIVED: 'archived',
} as const;

export type CarePlanStatus = typeof CarePlanStatus[keyof typeof CarePlanStatus];

/**
 * Review frequencies based on regional requirements
 */
export const ReviewFrequency = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  BIANNUALLY: 'biannually',
  ANNUALLY: 'annually',
  CUSTOM: 'custom',
} as const;

export type ReviewFrequency = typeof ReviewFrequency[keyof typeof ReviewFrequency];

/**
 * Risk assessment levels
 */
export const RiskLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type RiskLevel = typeof RiskLevel[keyof typeof RiskLevel];

/**
 * Care plan section schema for validation
 */
export const carePlanSectionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  content: z.string().min(1),
  riskLevel: z.nativeEnum(RiskLevel).optional(),
  requiresWitnessing: z.boolean().default(false),
  requiresRegularReview: z.boolean().default(false),
  reviewFrequency: z.nativeEnum(ReviewFrequency).optional(),
  lastReviewed: z.date().optional(),
  reviewedBy: z.string().uuid().optional(),
  attachments: z.array(z.string()).optional(),
  version: z.number().default(1),
});

export type CarePlanSection = z.infer<typeof carePlanSectionSchema>;

/**
 * Specialized care categories for different needs
 */
export const SpecializedCareCategory = {
  PALLIATIVE: 'palliative',
  REHABILITATION: 'rehabilitation',
  BEHAVIORAL_SUPPORT: 'behavioral_support',
  COMPLEX_NEEDS: 'complex_needs',
  SENSORY_IMPAIRMENT: 'sensory_impairment',
  CULTURAL_SPECIFIC: 'cultural_specific',
  YOUNG_ONSET_DEMENTIA: 'young_onset_dementia',
  SUBSTANCE_MISUSE: 'substance_misuse',
  EATING_DISORDERS: 'eating_disorders',
  FORENSIC_CARE: 'forensic_care',
} as const;

export type SpecializedCareCategory = typeof SpecializedCareCategory[keyof typeof SpecializedCareCategory];

/**
 * Enhanced risk assessment schema
 */
export const riskAssessmentSchema = z.object({
  id: z.string().uuid(),
  category: z.string(),
  level: z.nativeEnum(RiskLevel),
  likelihood: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
  mitigationSteps: z.array(z.string()),
  reviewFrequency: z.nativeEnum(ReviewFrequency),
  lastReviewed: z.date().optional(),
  nextReview: z.date(),
  assignedTo: z.array(z.string().uuid()),
  attachments: z.array(z.string()).optional(),
});

export type RiskAssessment = z.infer<typeof riskAssessmentSchema>;

/**
 * Goal tracking schema
 */
export const goalSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  targetDate: z.date(),
  status: z.enum(['not_started', 'in_progress', 'achieved', 'partially_achieved', 'not_achieved']),
  progress: z.array(z.object({
    date: z.date(),
    note: z.string(),
    recordedBy: z.string().uuid(),
  })),
  outcome: z.string().optional(),
  barriers: z.array(z.string()).optional(),
  supports: z.array(z.string()).optional(),
  residentInvolvement: z.boolean(),
  familyInvolvement: z.boolean(),
});

export type Goal = z.infer<typeof goalSchema>;

/**
 * Outcome measurement schema
 */
export const outcomeSchema = z.object({
  id: z.string().uuid(),
  category: z.string(),
  measurementTool: z.string(),
  baselineScore: z.number(),
  targetScore: z.number(),
  measurements: z.array(z.object({
    date: z.date(),
    score: z.number(),
    notes: z.string().optional(),
    recordedBy: z.string().uuid(),
  })),
  nextAssessmentDate: z.date(),
});

export type Outcome = z.infer<typeof outcomeSchema>;

/**
 * Family/NOK involvement schema
 */
export const familyInvolvementSchema = z.object({
  id: z.string().uuid(),
  familyMemberId: z.string().uuid(),
  relationship: z.string(),
  involvementLevel: z.enum(['primary', 'secondary', 'occasional', 'information_only']),
  communicationPreferences: z.array(z.string()),
  lastUpdated: z.date(),
  lastContacted: z.date(),
  notes: z.string().optional(),
  consentToShare: z.boolean(),
  powerOfAttorney: z.object({
    type: z.array(z.enum(['health', 'welfare', 'property', 'financial'])),
    documentRefs: z.array(z.string()),
    validUntil: z.date().optional(),
  }).optional(),
});

export type FamilyInvolvement = z.infer<typeof familyInvolvementSchema>;

/**
 * Cultural Care Components
 */
export enum CulturalCareCategory {
  LANGUAGE = 'language',
  RELIGION = 'religion',
  DIETARY = 'dietary',
  CUSTOMS = 'customs',
  SOCIAL_NORMS = 'social_norms',
  TRADITIONS = 'traditions'
}

export enum LanguagePreference {
  SPOKEN = 'spoken',
  WRITTEN = 'written',
  SIGN = 'sign',
  INTERPRETER = 'interpreter',
  DIGITAL = 'digital'
}

export enum TransitionType {
  CHILD_TO_ADULT = 'child_to_adult',
  SERVICE_TRANSFER = 'service_transfer',
  CARE_LEVEL_CHANGE = 'care_level_change',
  LOCATION_CHANGE = 'location_change',
  DISCHARGE = 'discharge'
}

export enum AdvancedCareDecision {
  TREATMENT_PREFERENCES = 'treatment_preferences',
  RESUSCITATION = 'resuscitation',
  HOSPITALIZATION = 'hospitalization',
  LIFE_SUSTAINING = 'life_sustaining',
  PAIN_MANAGEMENT = 'pain_management',
  END_OF_LIFE = 'end_of_life'
}

export enum TelehealthService {
  VIDEO_CONSULTATION = 'video_consultation',
  REMOTE_MONITORING = 'remote_monitoring',
  DIGITAL_THERAPY = 'digital_therapy',
  VIRTUAL_WARD = 'virtual_ward',
  E_PRESCRIBING = 'e_prescribing'
}

// Additional care home specific enums
export enum VisitorType {
  FAMILY = 'family',
  FRIEND = 'friend',
  PROFESSIONAL = 'professional',
  ADVOCATE = 'advocate',
  SOCIAL_WORKER = 'social_worker',
  OTHER = 'other'
}

export enum VisitRestriction {
  NONE = 'none',
  SUPERVISED = 'supervised',
  TIME_LIMITED = 'time_limited',
  NO_VISITS = 'no_visits',
  COVID_RESTRICTIONS = 'covid_restrictions'
}

export enum RoomPreference {
  SINGLE = 'single',
  SHARED = 'shared',
  GROUND_FLOOR = 'ground_floor',
  NEAR_NURSES = 'near_nurses',
  QUIET_AREA = 'quiet_area',
  GARDEN_VIEW = 'garden_view'
}

export enum DailyRoutine {
  EARLY_RISER = 'early_riser',
  LATE_RISER = 'late_riser',
  AFTERNOON_NAP = 'afternoon_nap',
  EARLY_DINNER = 'early_dinner',
  LATE_DINNER = 'late_dinner',
  NIGHT_OWL = 'night_owl'
}

export enum SocialActivity {
  GROUP_ACTIVITIES = 'group_activities',
  INDIVIDUAL_ACTIVITIES = 'individual_activities',
  OUTDOOR_ACTIVITIES = 'outdoor_activities',
  CREATIVE_ARTS = 'creative_arts',
  MUSIC_THERAPY = 'music_therapy',
  EXERCISE_CLASSES = 'exercise_classes',
  GARDENING = 'gardening',
  READING_CLUB = 'reading_club',
  MOVIE_NIGHTS = 'movie_nights',
  RELIGIOUS_SERVICES = 'religious_services'
}

export enum PersonalCarePreference {
  INDEPENDENT = 'independent',
  MINIMAL_ASSISTANCE = 'minimal_assistance',
  FULL_ASSISTANCE = 'full_assistance',
  FEMALE_STAFF_ONLY = 'female_staff_only',
  MALE_STAFF_ONLY = 'male_staff_only',
  SPECIFIC_STAFF = 'specific_staff'
}

/**
 * Regulatory compliance schema
 */
export enum RegulatoryFramework {
  CQC = 'CQC',
  OFSTED = 'OFSTED',
  HIQA = 'HIQA',
  CI = 'CI',
  RQIA = 'RQIA',
  CSI = 'CSI'
}

export enum InspectionType {
  SCHEDULED = 'scheduled',
  UNANNOUNCED = 'unannounced',
  FOLLOW_UP = 'follow_up',
  MONITORING = 'monitoring',
  THEMED = 'themed'
}

export enum InspectionOutcome {
  OUTSTANDING = 'outstanding',
  GOOD = 'good',
  REQUIRES_IMPROVEMENT = 'requires_improvement',
  INADEQUATE = 'inadequate'
}

/**
 * Complete care plan schema
 */
export const carePlanSchema = z.object({
  id: z.string().uuid(),
  residentId: z.string().uuid(),
  category: z.nativeEnum(CarePlanCategory),
  specializedCategories: z.array(z.nativeEnum(SpecializedCareCategory)).optional(),
  status: z.nativeEnum(CarePlanStatus).default('draft'),
  sections: z.array(carePlanSectionSchema),
  risks: z.array(riskAssessmentSchema),
  goals: z.array(goalSchema),
  outcomes: z.array(outcomeSchema),
  familyInvolvement: z.array(familyInvolvementSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid(),
  reviewFrequency: z.nativeEnum(ReviewFrequency),
  nextReviewDate: z.date(),
  version: z.number().default(1),
  isOfflineSynced: z.boolean().default(true),
  organizationId: z.string().uuid(),
  region: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  consentDetails: z.object({
    residentConsent: z.boolean(),
    residentSignature: z.string().optional(),
    residentSignatureDate: z.date().optional(),
    bestInterestDecision: z.boolean(),
    bestInterestDecisionDetails: z.string().optional(),
    bestInterestDecisionDate: z.date().optional(),
    bestInterestDecisionBy: z.array(z.string().uuid()),
  }),
  approvals: z.array(z.object({
    approvedBy: z.string().uuid(),
    role: z.string(),
    date: z.date(),
    comments: z.string().optional(),
  })),
  culturalCare: z.object({
    primaryLanguage: z.string(),
    otherLanguages: z.array(z.string()),
    languagePreferences: z.array(z.nativeEnum(LanguagePreference)),
    religionBeliefs: z.string().optional(),
    culturalPreferences: z.array(z.nativeEnum(CulturalCareCategory)),
    dietaryRequirements: z.array(z.string()),
    customsAndTraditions: z.array(z.string()),
    communicationPreferences: z.object({
      preferredMethod: z.string(),
      requiresInterpreter: z.boolean(),
      interpreterDetails: z.string().optional(),
      communicationAids: z.array(z.string())
    })
  }).optional(),
  transitionPlan: z.object({
    type: z.nativeEnum(TransitionType),
    startDate: z.date(),
    targetDate: z.date(),
    currentService: z.string(),
    targetService: z.string(),
    transitionSteps: z.array(z.object({
      step: z.string(),
      status: z.enum(['pending', 'in_progress', 'completed']),
      dueDate: z.date(),
      completedDate: z.date().optional(),
      responsiblePerson: z.string().uuid()
    })),
    riskAssessment: z.array(z.object({
      risk: z.string(),
      mitigation: z.string(),
      status: z.enum(['active', 'resolved'])
    }))
  }).optional(),
  advancedCarePlan: z.object({
    decisions: z.array(z.object({
      type: z.nativeEnum(AdvancedCareDecision),
      decision: z.string(),
      details: z.string(),
      dateRecorded: z.date(),
      reviewDate: z.date(),
      decisionMaker: z.string().uuid(),
      witnesses: z.array(z.string().uuid()),
      documents: z.array(z.string())
    })),
    powerOfAttorney: z.object({
      exists: z.boolean(),
      type: z.array(z.enum(['health', 'welfare', 'property', 'financial'])),
      attorneyDetails: z.array(z.object({
        name: z.string(),
        relationship: z.string(),
        contactDetails: z.string(),
        scope: z.string()
      }))
    }).optional()
  }).optional(),
  telehealthServices: z.array(z.object({
    type: z.nativeEnum(TelehealthService),
    provider: z.string(),
    schedule: z.object({
      frequency: z.string(),
      duration: z.number(),
      startDate: z.date(),
      endDate: z.date().optional()
    }),
    equipment: z.array(z.string()),
    technicalSupport: z.object({
      contactName: z.string(),
      contactNumber: z.string(),
      availabilityHours: z.string()
    }),
    outcomes: z.array(z.object({
      date: z.date(),
      outcome: z.string(),
      followUp: z.string().optional()
    }))
  })).optional(),
  visitorManagement: z.object({
    allowedVisitors: z.array(z.object({
      type: z.nativeEnum(VisitorType),
      name: z.string(),
      relationship: z.string(),
      contactDetails: z.string(),
      restrictions: z.nativeEnum(VisitRestriction).optional(),
      notes: z.string().optional()
    })),
    visitingPreferences: z.object({
      preferredTimes: z.array(z.string()),
      maximumVisitors: z.number(),
      visitLocation: z.string(),
      specialInstructions: z.string().optional()
    }),
    visitLog: z.array(z.object({
      date: z.date(),
      visitorName: z.string(),
      relationship: z.string(),
      duration: z.number(),
      notes: z.string().optional()
    }))
  }).optional(),
  roomPreferences: z.object({
    preferences: z.array(z.nativeEnum(RoomPreference)),
    currentRoom: z.string(),
    specialRequirements: z.array(z.string()),
    personalItems: z.array(z.string()),
    environmentalNeeds: z.object({
      temperature: z.string().optional(),
      lighting: z.string().optional(),
      noise: z.string().optional(),
      accessibility: z.array(z.string())
    })
  }).optional(),
  dailyRoutines: z.object({
    routineType: z.nativeEnum(DailyRoutine),
    schedule: z.array(z.object({
      time: z.string(),
      activity: z.string(),
      assistance: z.nativeEnum(PersonalCarePreference),
      notes: z.string().optional()
    })),
    preferences: z.object({
      wakeTime: z.string(),
      bedTime: z.string(),
      mealtimes: z.array(z.object({
        meal: z.string(),
        preferredTime: z.string(),
        location: z.string()
      })),
      personalCare: z.object({
        preference: z.nativeEnum(PersonalCarePreference),
        specificRequirements: z.string().optional(),
        preferredStaff: z.array(z.string()).optional()
      })
    })
  }).optional(),
  socialEngagement: z.object({
    preferredActivities: z.array(z.nativeEnum(SocialActivity)),
    groupPreference: z.enum(['small', 'large', 'one-to-one']),
    activitySchedule: z.array(z.object({
      activity: z.nativeEnum(SocialActivity),
      frequency: z.string(),
      dayOfWeek: z.string(),
      time: z.string(),
      location: z.string(),
      support: z.string().optional()
    })),
    interests: z.array(z.string()),
    dislikes: z.array(z.string()).optional(),
    socialConnections: z.array(z.object({
      residentId: z.string(),
      relationship: z.string(),
      notes: z.string().optional()
    })).optional()
  }).optional(),
  endOfLifeCare: z.object({
    preferences: z.object({
      place: z.string(),
      religious: z.string().optional(),
      cultural: z.string().optional(),
      personal: z.string().optional()
    }),
    contacts: z.array(z.object({
      name: z.string(),
      relationship: z.string(),
      contact: z.string(),
      priority: z.number()
    })),
    wishes: z.object({
      spiritual: z.string().optional(),
      personal: z.string().optional(),
      funeral: z.string().optional()
    }),
    documents: z.array(z.object({
      type: z.string(),
      location: z.string(),
      dateUpdated: z.date()
    }))
  }).optional(),
  qualityOfLife: z.object({
    assessments: z.array(z.object({
      date: z.date(),
      category: z.string(),
      score: z.number(),
      notes: z.string(),
      actionPoints: z.array(z.string())
    })),
    goals: z.array(z.object({
      description: z.string(),
      targetDate: z.date(),
      progress: z.array(z.object({
        date: z.date(),
        note: z.string(),
        achievement: z.number()
      }))
    })),
    feedback: z.array(z.object({
      date: z.date(),
      source: z.string(),
      content: z.string(),
      actionTaken: z.string().optional()
    }))
  }).optional(),
  regulatoryCompliance: z.object({
    framework: z.nativeEnum(RegulatoryFramework),
    registrationDetails: z.object({
      registrationNumber: z.string(),
      registrationDate: z.date(),
      registeredManager: z.string(),
      conditions: z.array(z.string()),
      variations: z.array(z.object({
        date: z.date(),
        details: z.string(),
        approvedBy: z.string()
      }))
    }),
    inspections: z.array(z.object({
      date: z.date(),
      type: z.nativeEnum(InspectionType),
      inspectors: z.array(z.string()),
      outcome: z.nativeEnum(InspectionOutcome),
      report: z.object({
        url: z.string().url(),
        publishedDate: z.date()
      }),
      findings: z.array(z.object({
        area: z.string(),
        rating: z.nativeEnum(InspectionOutcome),
        strengths: z.array(z.string()),
        improvements: z.array(z.string()),
        evidence: z.array(z.string())
      })),
      actionPlan: z.array(z.object({
        issue: z.string(),
        action: z.string(),
        responsiblePerson: z.string(),
        deadline: z.date(),
        status: z.enum(['pending', 'in_progress', 'completed', 'overdue']),
        evidence: z.array(z.string()),
        completedDate: z.date().optional()
      }))
    })),
    qualityIndicators: z.array(z.object({
      category: z.string(),
      metric: z.string(),
      current: z.number(),
      target: z.number(),
      trend: z.enum(['improving', 'stable', 'declining']),
      lastUpdated: z.date()
    })),
    staffingCompliance: z.object({
      staffingRatios: z.record(z.string(), z.number()),
      qualifications: z.array(z.object({
        role: z.string(),
        required: z.array(z.string()),
        completed: z.array(z.string())
      })),
      training: z.array(z.object({
        topic: z.string(),
        completionRate: z.number(),
        dueForRenewal: z.number(),
        lastUpdated: z.date()
      }))
    }),
    safeguardingAudits: z.array(z.object({
      date: z.date(),
      auditor: z.string(),
      findings: z.array(z.object({
        area: z.string(),
        compliance: z.enum(['met', 'partially_met', 'not_met']),
        notes: z.string(),
        actions: z.array(z.string())
      })),
      recommendations: z.array(z.string())
    })),
    policies: z.array(z.object({
      name: z.string(),
      version: z.string(),
      lastReviewed: z.date(),
      nextReview: z.date(),
      approvedBy: z.string(),
      status: z.enum(['current', 'under_review', 'outdated']),
      documentUrl: z.string()
    }))
  }).optional()
});

export type CarePlan = z.infer<typeof carePlanSchema>;

/**
 * Care plan review schema
 */
export const carePlanReviewSchema = z.object({
  id: z.string().uuid(),
  carePlanId: z.string().uuid(),
  reviewedBy: z.string().uuid(),
  reviewDate: z.date(),
  changes: z.array(z.object({
    sectionId: z.string().uuid(),
    field: z.string(),
    oldValue: z.string(),
    newValue: z.string(),
  })),
  comments: z.string().optional(),
  nextReviewDate: z.date(),
  requiresFollowUp: z.boolean().default(false),
  followUpDate: z.date().optional(),
  followUpAssignedTo: z.string().uuid().optional(),
});

export type CarePlanReview = z.infer<typeof carePlanReviewSchema>;

/**
 * Regional requirements for care plans
 */
export const RegionalRequirements = {
  england: {
    regulatoryBody: 'CQC',
    mandatorySections: [
      'personal_care',
      'medication',
      'nutrition',
      'mobility',
      'mental_health',
      'social_needs',
    ],
    reviewFrequencies: {
      default: ReviewFrequency.MONTHLY,
      minimum: ReviewFrequency.MONTHLY,
    },
    requiresManagerApproval: true,
    requiresResidentSignature: true,
  },
  wales: {
    regulatoryBody: 'CIW',
    mandatorySections: [
      'personal_care',
      'medication',
      'nutrition',
      'mobility',
      'mental_health',
      'social_needs',
      'welsh_language_needs',
    ],
    reviewFrequencies: {
      default: ReviewFrequency.MONTHLY,
      minimum: ReviewFrequency.MONTHLY,
    },
    requiresManagerApproval: true,
    requiresResidentSignature: true,
  },
  scotland: {
    regulatoryBody: 'Care Inspectorate',
    mandatorySections: [
      'personal_care',
      'medication',
      'nutrition',
      'mobility',
      'mental_health',
      'social_needs',
    ],
    reviewFrequencies: {
      default: ReviewFrequency.BIANNUALLY,
      minimum: ReviewFrequency.QUARTERLY,
    },
    requiresManagerApproval: true,
    requiresResidentSignature: true,
  },
  northernIreland: {
    regulatoryBody: 'RQIA',
    mandatorySections: [
      'personal_care',
      'medication',
      'nutrition',
      'mobility',
      'mental_health',
      'social_needs',
    ],
    reviewFrequencies: {
      default: ReviewFrequency.MONTHLY,
      minimum: ReviewFrequency.MONTHLY,
    },
    requiresManagerApproval: true,
    requiresResidentSignature: true,
  },
  ireland: {
    regulatoryBody: 'HIQA',
    mandatorySections: [
      'personal_care',
      'medication',
      'nutrition',
      'mobility',
      'mental_health',
      'social_needs',
    ],
    reviewFrequencies: {
      default: ReviewFrequency.QUARTERLY,
      minimum: ReviewFrequency.QUARTERLY,
    },
    requiresManagerApproval: true,
    requiresResidentSignature: true,
  },
} as const;

/**
 * Care plan template categories - Enhanced
 */
export const TemplateCategories = {
  PERSONAL_CARE: {
    id: 'personal_care',
    sections: ['hygiene', 'dressing', 'grooming', 'continence', 'oral_care', 'skin_care'],
    riskAssessments: ['falls', 'pressure_areas', 'infection_control'],
    goals: ['independence', 'dignity', 'comfort'],
  },
  MEDICATION: {
    id: 'medication',
    sections: ['administration', 'side_effects', 'allergies', 'storage', 'self_medication', 'PRN_protocols'],
    riskAssessments: ['medication_errors', 'adverse_reactions', 'compliance'],
    goals: ['adherence', 'understanding', 'independence'],
  },
  NUTRITION: {
    id: 'nutrition',
    sections: ['diet', 'hydration', 'allergies', 'preferences', 'supplements', 'texture_modifications'],
    riskAssessments: ['malnutrition', 'dehydration', 'choking'],
    goals: ['weight_management', 'hydration', 'enjoyment'],
  },
  MOBILITY: {
    id: 'mobility',
    sections: ['walking', 'transfers', 'equipment', 'falls_risk', 'exercise', 'rehabilitation'],
    riskAssessments: ['falls', 'manual_handling', 'equipment_safety'],
    goals: ['independence', 'strength', 'safety'],
  },
  MENTAL_HEALTH: {
    id: 'mental_health',
    sections: ['mood', 'behavior', 'cognition', 'support_needs', 'triggers', 'coping_strategies'],
    riskAssessments: ['self_harm', 'aggression', 'wandering'],
    goals: ['wellbeing', 'engagement', 'stability'],
  },
  SOCIAL_NEEDS: {
    id: 'social_needs',
    sections: ['activities', 'relationships', 'communication', 'preferences', 'cultural_needs', 'spiritual_needs'],
    riskAssessments: ['isolation', 'discrimination', 'exploitation'],
    goals: ['participation', 'relationships', 'fulfillment'],
  },
  END_OF_LIFE: {
    id: 'end_of_life',
    sections: ['preferences', 'symptom_management', 'spiritual_needs', 'family_support', 'advance_decisions'],
    riskAssessments: ['pain', 'distress', 'dignity'],
    goals: ['comfort', 'dignity', 'wishes'],
  },
} as const;

/**
 * Offline sync status tracking
 */
export const SyncStatus = {
  SYNCED: 'synced',
  PENDING: 'pending',
  FAILED: 'failed',
  CONFLICT: 'conflict',
} as const;

export type SyncStatus = typeof SyncStatus[keyof typeof SyncStatus]; 
