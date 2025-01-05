export interface CommunicationNeeds {
  primaryMethod: string;
  alternativeMethods: string[];
  assistiveTechnology: string[];
  communicationPreferences: string[];
}

export interface MobilityNeeds {
  mobilityAids: string[];
  transferAssistance: string;
  environmentalModifications: string[];
  safetyConsiderations: string[];
}

export interface SensoryNeeds {
  visual: {
    impairments: string[];
    aids: string[];
    accommodations: string[];
  };
  auditory: {
    impairments: string[];
    aids: string[];
    accommodations: string[];
  };
  tactile: {
    sensitivities: string[];
    preferences: string[];
    accommodations: string[];
  };
}

export interface CognitiveNeeds {
  comprehensionLevel: string;
  memorySupports: string[];
  learningStyle: string;
  adaptations: string[];
}

export interface BehavioralSupports {
  triggers: string[];
  calmingStrategies: string[];
  routines: string[];
  reinforcements: string[];
}

export interface SpecializedCare {
  medicalProcedures: string[];
  equipmentNeeds: string[];
  dietaryRequirements: string[];
  emergencyProtocols: string[];
}

export interface ProgressTracking {
  goals: {
    description: string;
    strategies: string[];
    progress: string;
  }[];
  observations: string[];
  adaptationEffectiveness: string[];
}
