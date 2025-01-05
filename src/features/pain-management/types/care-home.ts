/**
 * @fileoverview Care Home Pain Management Types
 * @version 1.0.0
 * @created 2024-03-21
 */

export enum ResidentPainScale {
  NUMERIC = 'NUMERIC',           // For cognitively aware residents
  FACES = 'FACES',              // Wong-Baker for mild cognitive impairment
  PAINAD = 'PAINAD',            // For residents with dementia
  ABBEY = 'ABBEY',              // For non-verbal residents
  BEHAVIORAL = 'BEHAVIORAL'      // For residents with severe communication difficulties
}

export enum CareHomeShift {
  EARLY = 'EARLY',      // Typically 7am-3pm
  LATE = 'LATE',        // Typically 2pm-10pm
  NIGHT = 'NIGHT'       // Typically 9:30pm-7:30am
}

export interface ResidentPainAssessment {
  id: string;
  residentId: string;
  tenantId: string;
  assessedBy: string;
  shift: CareHomeShift;
  assessmentDate: Date;
  painScale: ResidentPainScale;
  painScore: number;
  location: string[];
  behaviors: string[];           // Observable pain behaviors
  triggers: string[];           // What caused or worsened the pain
  dailyActivities: {            // Impact on daily care activities
    personal: boolean;          // Personal care
    mobility: boolean;          // Movement/transfers
    eating: boolean;            // Eating/drinking
    sleep: boolean;            // Sleep/rest
    social: boolean;           // Social participation
  };
  interventions: PainIntervention[];
  effectiveness: number;
  notifiedNurse: boolean;      // Whether nurse was notified (if required)
  followUpRequired: boolean;
  nextAssessmentDue: Date;
}

export interface PainIntervention {
  type: PainInterventionType;
  description: string;
  administeredBy: string;
  startTime: Date;
  effectiveness: number;
  notes?: string;
}

export enum PainInterventionType {
  MEDICATION = 'MEDICATION',
  POSITIONING = 'POSITIONING',
  HEAT = 'HEAT',
  COLD = 'COLD',
  MASSAGE = 'MASSAGE',
  DISTRACTION = 'DISTRACTION',
  REST = 'REST',
  OTHER = 'OTHER'
}

export interface PainCareLevel {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  assessmentFrequency: number;  // Hours between assessments
  requiresNurseReview: boolean;
  requiresGPReview: boolean;
  specialInstructions?: string[];
}

export interface PainHandoverNote {
  residentName: string;
  roomNumber: string;
  painLevel: number;
  lastAssessment: Date;
  currentInterventions: string[];
  effectiveInterventions: string[];
  ineffectiveInterventions: string[];
  triggers: string[];
  nextAssessmentDue: Date;
  specialInstructions?: string[];
} 