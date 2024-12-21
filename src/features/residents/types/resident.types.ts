export interface Resident {
  id: string;
  careHomeId: string;
  title?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nhsNumber?: string;
  status: ResidentStatus;
  roomNumber?: string;
  admissionDate: Date;
  dischargeDate?: Date;
  careType: CareType;
  // Additional fields for comprehensive care
  dietaryRequirements?: string[];
  mobilityStatus?: MobilityStatus;
  communicationNeeds?: CommunicationNeeds;
  medicalConditions?: string[];
  allergies?: string[];
  dnrStatus?: boolean;
  powerOfAttorney?: PowerOfAttorney;
  culturalPreferences?: CulturalPreferences;
  riskAssessments?: RiskAssessment[];
  // DoLS and Capacity fields
  dols?: {
    current?: string;  // Reference to current active DoLS
    history: string[]; // References to historical DoLS
  };
  capacityAssessments?: {
    current?: string;  // Reference to most recent capacity assessment
    history: string[]; // References to historical assessments
  };
  restrictions?: {
    type: 'PHYSICAL' | 'CHEMICAL' | 'ENVIRONMENTAL' | 'SURVEILLANCE';
    details: string;
    approved: boolean;
    reviewDate: Date;
  }[];
}

export type ResidentStatus = 'ACTIVE' | 'DISCHARGED' | 'TEMPORARY' | 'HOSPITAL' | 'DECEASED';

export type CareType = 
  | 'RESIDENTIAL'    // Basic personal care
  | 'NURSING'        // Requires qualified nursing care
  | 'DEMENTIA'       // Specialized dementia care
  | 'RESPITE'        // Short-term care
  | 'PALLIATIVE'     // End of life care
  | 'DUAL'           // Combined nursing and dementia care
  | 'SPECIALIST';    // Other specialized care needs

export type MobilityStatus = {
  level: 'INDEPENDENT' | 'REQUIRES_AID' | 'WHEELCHAIR' | 'BED_BOUND';
  aids?: string[];
  transferAssistance?: 'NONE' | 'ONE_PERSON' | 'TWO_PERSON' | 'HOIST';
};

export type CommunicationNeeds = {
  primaryLanguage: string;
  otherLanguages?: string[];
  communicationAids?: string[];
  hearingImpairment?: boolean;
  visualImpairment?: boolean;
  interpreterRequired?: boolean;
};

export type PowerOfAttorney = {
  type: 'HEALTH_WELFARE' | 'PROPERTY_AFFAIRS' | 'BOTH';
  attorneyName: string;
  contactDetails: {
    phone: string;
    email?: string;
    address: string;
  };
  documentReference: string;
  validUntil?: Date;
};

export type CulturalPreferences = {
  religion?: string;
  dietaryRestrictions?: string[];
  culturalPractices?: string[];
  preferences?: Record<string, string>;
};

export type RiskAssessment = {
  type: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  details: string;
  mitigationPlan?: string;
  reviewDate: Date;
};


