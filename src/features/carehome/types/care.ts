// src/features/carehome/types/care.ts

export type CareType = 
  | 'RESIDENTIAL'      // Basic personal care
  | 'NURSING'          // 24-hour nursing care
  | 'DEMENTIA'         // Specialized dementia care
  | 'PALLIATIVE'       // End of life care
  | 'RESPITE'          // Short-term care
  | 'CONVALESCENT'     // Recovery after hospital
  | 'PHYSICAL_DISABILITY'
  | 'LEARNING_DISABILITY'
  | 'MENTAL_HEALTH'
  | 'SENSORY_IMPAIRMENT'
  | 'DUAL_REGISTERED'; // Both residential and nursing

export interface CarePlan {
  id: string;
  residentId: string;
  primaryCareType: CareType;
  secondaryCareTypes: CareType[];
  startDate: Date;
  reviewDate: Date;
  assessments: Assessment[];
  goals: CareGoal[];
  interventions: CareIntervention[];
  medications: Medication[];
  dietaryRequirements: DietaryRequirement[];
  activities: PlannedActivity[];
  riskAssessments: RiskAssessment[];
  reviews: CareReview[];
}

export interface Assessment {
  id: string;
  type: string;
  date: Date;
  assessor: string;
  findings: Record<string, any>;
  recommendations: string[];
  nextAssessmentDue: Date;
}

export interface CareGoal {
  id: string;
  description: string;
  category: string;
  targetDate: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'ACHIEVED' | 'REVISED';
  progress: number;
  notes: string[];
}

export interface CareIntervention {
  id: string;
  type: string;
  description: string;
  frequency: string;
  assignedTo: string[];
  status: 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED';
  outcomes: string[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: Date;
  endDate?: Date;
  prescriber: string;
  notes: string[];
  contraindications: string[];
}

export interface DietaryRequirement {
  id: string;
  type: string;
  description: string;
  restrictions: string[];
  allergies: string[];
  preferences: string[];
  specialInstructions: string[];
}

export interface PlannedActivity {
  id: string;
  name: string;
  type: string;
  frequency: string;
  duration: number;
  groupSize: number;
  requirements: string[];
  benefits: string[];
}

export interface RiskAssessment {
  id: string;
  type: string;
  assessor: string;
  date: Date;
  findings: {
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    details: string;
  };
  mitigationMeasures: string[];
  reviewDate: Date;
}

export interface CareReview {
  id: string;
  date: Date;
  reviewer: string;
  attendees: string[];
  progress: {
    category: string;
    status: string;
    notes: string;
  }[];
  recommendations: string[];
  nextReviewDate: Date;
}

export interface CareMetrics {
  id: string;
  residentId: string;
  date: Date;
  type: string;
  value: number;
  unit: string;
  notes: string;
  takenBy: string;
}

export interface CareIncident {
  id: string;
  residentId: string;
  date: Date;
  type: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  witnesses: string[];
  actions: string[];
  followUp: string[];
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
}


