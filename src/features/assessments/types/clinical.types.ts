/**
 * Clinical Assessment Types
 */

export interface VitalSigns {
  temperature: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  pain: number;
  timestamp: Date;
}

export interface MedicationTracking {
  medicationId: string;
  effectiveness: 'High' | 'Moderate' | 'Low' | 'None';
  sideEffects: string[];
  adherence: boolean;
  notes: string;
}

export interface BehavioralAssessment {
  mood: {
    current: string;
    triggers: string[];
    interventions: string[];
  };
  behaviors: Array<{
    type: string;
    frequency: string;
    intensity: number;
    triggers: string[];
    interventions: string[];
  }>;
  crisisPlans: Array<{
    trigger: string;
    earlyWarning: string[];
    interventions: string[];
    emergencyContacts: string[];
  }>;
}

export interface DementiaCareAssessment {
  cognitiveStatus: {
    orientation: number;
    memory: number;
    communication: number;
    judgment: number;
  };
  wanderingRisk: {
    riskLevel: 'High' | 'Medium' | 'Low';
    history: string[];
    preventiveMeasures: string[];
  };
  sundowning: {
    frequency: string;
    symptoms: string[];
    triggers: string[];
    interventions: string[];
  };
}

export interface EndOfLifeCare {
  palliativeCare: {
    preferences: string[];
    directives: string[];
    comfortMeasures: string[];
  };
  painManagement: {
    level: number;
    location: string[];
    interventions: string[];
    effectiveness: string;
  };
  symptomControl: {
    symptoms: string[];
    interventions: string[];
    effectiveness: string;
  };
}

export interface RichMediaDocumentation {
  photos: Array<{
    id: string;
    url: string;
    type: string;
    description: string;
    timestamp: Date;
  }>;
  videos: Array<{
    id: string;
    url: string;
    type: string;
    description: string;
    duration: number;
    timestamp: Date;
  }>;
  voiceNotes: Array<{
    id: string;
    url: string;
    duration: number;
    transcript: string;
    timestamp: Date;
  }>;
}

export interface EmergencyProtocol {
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  immediateActions: string[];
  notificationList: string[];
  documentation: RichMediaDocumentation;
  followUpRequired: boolean;
}

export interface QualityMetrics {
  goals: Array<{
    id: string;
    description: string;
    targetDate: Date;
    progress: number;
    status: 'Achieved' | 'In Progress' | 'Not Started' | 'Delayed';
  }>;
  outcomes: Array<{
    metric: string;
    value: number;
    target: number;
    trend: 'Improving' | 'Stable' | 'Declining';
  }>;
  interventions: Array<{
    type: string;
    effectiveness: number;
    continuationRecommended: boolean;
  }>;
}

export interface CulturalAssessment {
  language: {
    primary: string;
    additional: string[];
    interpreterNeeded: boolean;
  };
  religious: {
    faith: string;
    practices: string[];
    dietaryRequirements: string[];
    specialDates: Array<{
      date: Date;
      description: string;
    }>;
  };
  cultural: {
    preferences: string[];
    traditions: string[];
    considerations: string[];
  };
}

export interface SpecialNeeds {
  disabilities: Array<{
    type: string;
    accommodations: string[];
    assistiveDevices: string[];
  }>;
  communication: {
    method: string;
    tools: string[];
    effectiveness: string;
  };
  sensory: {
    visual: string[];
    auditory: string[];
    tactile: string[];
    preferences: string[];
  };
}

export interface StaffCompetency {
  assessmentTypes: Array<{
    type: string;
    competencyLevel: 'Expert' | 'Proficient' | 'Competent' | 'Novice';
    lastEvaluation: Date;
    trainingNeeded: boolean;
  }>;
  specializations: string[];
  certifications: Array<{
    name: string;
    expiryDate: Date;
    status: 'Active' | 'Expired' | 'Pending';
  }>;
  trainingHistory: Array<{
    topic: string;
    completionDate: Date;
    score: number;
    validUntil: Date;
  }>;
}
