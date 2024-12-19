import { Region } from './regulatory';

export type CareType = 
  | 'RESIDENTIAL'
  | 'NURSING'
  | 'LEARNING_DISABILITY'
  | 'MENTAL_HEALTH'
  | 'DEMENTIA'
  | 'END_OF_LIFE'
  | 'YOUNG_ADULT';

export interface SpecializedCareRequirements {
  careType: CareType;
  region: Region;
  specializedAssessments: string[];
  staffQualifications: string[];
  environmentRequirements: string[];
  specializedProcedures: string[];
}

export interface MentalCapacityRequirements {
  region: Region;
  frameworks: {
    ENGLAND: {
      dols: boolean;
      lps: boolean;
      bestInterestDecisions: string[];
      mentalCapacityAssessments: {
        assessor: string;
        date: Date;
        decision: string;
        review: Date;
      }[];
    };
    WALES: {
      dols: boolean;
      safeguards: string[];
      assessments: {
        type: string;
        date: Date;
        outcome: string;
      }[];
    };
    SCOTLAND: {
      awia: boolean; // Adults with Incapacity Act
      certificates: string[];
      guardianship: {
        type: string;
        startDate: Date;
        endDate: Date;
        powers: string[];
      }[];
    };
    NORTHERN_IRELAND: {
      mcaCompliance: boolean;
      assessments: {
        type: string;
        date: Date;
        outcome: string;
      }[];
    };
    IRELAND: {
      adm: boolean; // Assisted Decision-Making
      decisions: {
        type: string;
        date: Date;
        supporter: string;
        review: Date;
      }[];
    };
  };
}

export interface DementiaCareRequirements {
  environmentAssessment: {
    lighting: boolean;
    signage: boolean;
    colorSchemes: boolean;
    acoustics: boolean;
    safeWandering: boolean;
  };
  staffTraining: {
    dementiaAwareness: boolean;
    behaviourSupport: boolean;
    communicationSkills: boolean;
    personCenteredCare: boolean;
  };
  specializedAssessments: {
    cognition: boolean;
    behaviour: boolean;
    nutrition: boolean;
    mobility: boolean;
    communication: boolean;
  };
  carePlanRequirements: {
    lifeHistory: boolean;
    preferences: boolean;
    routines: boolean;
    triggers: boolean;
    interventions: boolean;
  };
}

export interface EndOfLifeCareRequirements {
  advanceCarePlanning: {
    preferences: boolean;
    decisions: boolean;
    powerOfAttorney: boolean;
  };
  painManagement: {
    assessment: boolean;
    protocols: boolean;
    medications: boolean;
  };
  symptomControl: {
    breathlessness: boolean;
    nausea: boolean;
    anxiety: boolean;
  };
  spiritualCare: {
    assessment: boolean;
    support: boolean;
    culturalNeeds: boolean;
  };
  familySupport: {
    communication: boolean;
    bereavement: boolean;
    practicalSupport: boolean;
  };
}

export interface LearningDisabilityRequirements {
  communicationSupport: {
    assessments: boolean;
    tools: string[];
    staffTraining: boolean;
  };
  behaviourSupport: {
    plans: boolean;
    interventions: string[];
    monitoring: boolean;
  };
  skillsDevelopment: {
    assessment: boolean;
    goals: string[];
    progress: boolean;
  };
  communityInclusion: {
    activities: string[];
    support: boolean;
    outcomes: boolean;
  };
  healthAction: {
    plans: boolean;
    monitoring: boolean;
    reviews: boolean;
  };
}

export interface MentalHealthCareRequirements {
  riskAssessment: {
    selfHarm: boolean;
    suicide: boolean;
    aggression: boolean;
    vulnerability: boolean;
  };
  treatmentPlans: {
    medication: boolean;
    therapy: boolean;
    activities: boolean;
    crisis: boolean;
  };
  monitoring: {
    mentalState: boolean;
    behaviour: boolean;
    medication: boolean;
    sideEffects: boolean;
  };
  recoveryPlanning: {
    goals: boolean;
    support: boolean;
    skills: boolean;
    community: boolean;
  };
}

export interface YoungAdultCareRequirements {
  transitionPlanning: {
    assessment: boolean;
    goals: boolean;
    support: boolean;
  };
  educationSupport: {
    needs: boolean;
    plans: boolean;
    coordination: boolean;
  };
  independentSkills: {
    assessment: boolean;
    development: boolean;
    monitoring: boolean;
  };
  safeguarding: {
    risks: boolean;
    measures: boolean;
    reviews: boolean;
  };
}

export interface NeurologicalConditionRequirements {
  parkinsonsDisease?: {
    medicationTiming: {
      schedule: string[];
      offPeriods: string[];
      interventions: string[];
    };
    mobilitySupport: {
      equipment: string[];
      techniques: string[];
      riskAssessment: boolean;
    };
    swallowingAssessment: {
      lastAssessment: Date;
      recommendations: string[];
      thickeningRequirements: string;
    };
    nonMotorSymptoms: string[];
  };
  brainInjury?: {
    cognitiveSupport: {
      memoryAids: string[];
      routines: string[];
      environmentalAdaptations: string[];
    };
    behaviourManagement: {
      triggers: string[];
      strategies: string[];
      escalationPlan: string[];
    };
    rehabilitationGoals: {
      physical: string[];
      cognitive: string[];
      communication: string[];
    };
  };
  huntingtons?: {
    movementManagement: {
      posturalSupport: string[];
      fallPrevention: string[];
      equipmentNeeds: string[];
    };
    nutritionalSupport: {
      swallowingAssessment: boolean;
      dietaryModifications: string[];
      assistiveEquipment: string[];
    };
    medicationRegime: {
      symptomControl: string[];
      sideEffectMonitoring: string[];
      reviewSchedule: string;
    };
  };
  multiplesclerosis?: {
    fatigueManagement: {
      energyConservation: string[];
      restPeriods: string[];
      activityPacing: string[];
    };
    temperatureControl: {
      environmentalMeasures: string[];
      coolingStrategies: string[];
      monitoringRequirements: string[];
    };
    mobilityAssessment: {
      equipment: string[];
      transferTechniques: string[];
      riskFactors: string[];
    };
  };
}

export interface PalliativeCareRequirements {
  symptomManagement: {
    painControl: {
      assessment: string;
      interventions: string[];
      medications: string[];
    };
    breathlessness: {
      triggers: string[];
      management: string[];
      equipment: string[];
    };
    otherSymptoms: {
      type: string;
      management: string[];
      monitoring: string[];
    }[];
  };
  psychologicalSupport: {
    emotionalNeeds: string[];
    spiritualCare: string[];
    culturalConsiderations: string[];
  };
  endOfLifeCare: {
    preferences: string[];
    advanceDecisions: string[];
    dnacpr: boolean;
  };
  familySupport: {
    communicationPlan: string[];
    visitingArrangements: string[];
    bereavementSupport: boolean;
  };
}

export interface YoungAdultSpecificRequirements extends YoungAdultCareRequirements {
  transitionPlanning: {
    educationTransition: {
      currentProvider: string;
      futureGoals: string[];
      supportNeeded: string[];
    };
    employmentSupport: {
      careerGoals: string[];
      skillsDevelopment: string[];
      workExperience: string[];
    };
    independentLiving: {
      skillsAssessment: string[];
      supportPlan: string[];
      riskAssessment: string[];
    };
  };
  mentalHealthSupport: {
    wellbeingPlan: string[];
    copingStrategies: string[];
    professionalSupport: string[];
  };
  socialInclusion: {
    communityActivities: string[];
    peerSupport: string[];
    relationshipGuidance: string[];
  };
}

export interface GroupAssessmentRequirements {
  sensoryNeeds: {
    visual: {
      requirements: string[];
      adaptations: string[];
      reviews: Date[];
    };
    auditory: {
      requirements: string[];
      adaptations: string[];
      reviews: Date[];
    };
    tactile: {
      preferences: string[];
      sensitivities: string[];
      interventions: string[];
    };
  };
  communicationSupport: {
    preferredMethods: string[];
    assistiveTechnology: string[];
    staffTraining: string[];
    interpretationNeeds: string[];
  };
  groupActivities: {
    preferences: string[];
    participation: {
      activity: string;
      engagement: string;
      support: string[];
    }[];
    socialInteraction: string[];
  };
}

export interface QualityMetrics {
  medicationEffectiveness: {
    symptomControl: {
      metric: string;
      baseline: number;
      current: number;
      target: number;
    }[];
    sideEffects: {
      type: string;
      severity: number;
      management: string[];
    }[];
    adherence: {
      rate: number;
      barriers: string[];
      interventions: string[];
    };
  };
  qualityOfLife: {
    painManagement: {
      assessmentTool: string;
      scores: number[];
      interventions: string[];
    };
    mobility: {
      independence: number;
      assistance: string[];
      equipment: string[];
    };
    socialEngagement: {
      participation: number;
      activities: string[];
      barriers: string[];
    };
  };
  careDelivery: {
    staffCompetency: {
      training: string[];
      assessments: Date[];
      specializations: string[];
    };
    incidentTracking: {
      type: string;
      frequency: number;
      resolution: string;
    }[];
    feedbackMetrics: {
      source: string;
      rating: number;
      comments: string[];
    }[];
  };
} 


