import {
  VitalSigns,
  MedicationTracking,
  BehavioralAssessment,
  DementiaCareAssessment,
  EndOfLifeCare,
  RichMediaDocumentation,
  EmergencyProtocol,
  QualityMetrics,
  CulturalAssessment,
  SpecialNeeds,
  StaffCompetency
} from './clinical.types';
import { HomeEnvironmentAssessment } from './domiciliary.types';

export enum ASSESSMENT_TYPES {
  NEEDS_ASSESSMENT = 'NEEDS_ASSESSMENT',
  CLINICAL = 'CLINICAL',
  BEHAVIORAL = 'BEHAVIORAL',
  DEMENTIA = 'DEMENTIA',
  END_OF_LIFE = 'END_OF_LIFE',
  EMERGENCY = 'EMERGENCY',
  CULTURAL = 'CULTURAL',
  SPECIAL_NEEDS = 'SPECIAL_NEEDS',
  HOME_ENVIRONMENT = 'HOME_ENVIRONMENT'
}

export enum ASSESSMENT_STATUS {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_REVIEW = 'PENDING_REVIEW',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export enum ASSESSMENT_PRIORITY {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum CARE_SETTING {
  FACILITY = 'FACILITY',
  HOME = 'HOME',
  COMMUNITY = 'COMMUNITY',
  DAY_CARE = 'DAY_CARE'
}

export interface Location {
  address: string;
  postcode: string;
  accessNotes?: string;
  safetyNotes?: string;
  parkingInfo?: string;
}

export interface BaseAssessment {
  id: string;
  type: ASSESSMENT_TYPES;
  status: ASSESSMENT_STATUS;
  priority: ASSESSMENT_PRIORITY;
  residentId: string;
  assessorId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  reviewerId?: string;
  reviewedAt?: Date;
  version: string;
  notes: string;
  media?: RichMediaDocumentation;
  careSetting: CARE_SETTING;
  location?: Location;
  visitSchedule?: {
    preferredTimes: string[];
    restrictions?: string[];
    frequency?: string;
  };
}

export interface ClinicalAssessment extends BaseAssessment {
  type: ASSESSMENT_TYPES.CLINICAL;
  vitalSigns: VitalSigns[];
  medicationTracking: MedicationTracking[];
}

export interface BehavioralHealthAssessment extends BaseAssessment {
  type: ASSESSMENT_TYPES.BEHAVIORAL;
  behavioralData: BehavioralAssessment;
}

export interface DementiaAssessment extends BaseAssessment {
  type: ASSESSMENT_TYPES.DEMENTIA;
  dementiaData: DementiaCareAssessment;
}

export interface EndOfLifeAssessment extends BaseAssessment {
  type: ASSESSMENT_TYPES.END_OF_LIFE;
  eolData: EndOfLifeCare;
}

export interface EmergencyAssessment extends BaseAssessment {
  type: ASSESSMENT_TYPES.EMERGENCY;
  emergencyData: EmergencyProtocol;
}

export interface CulturalNeedsAssessment extends BaseAssessment {
  type: ASSESSMENT_TYPES.CULTURAL;
  culturalData: CulturalAssessment;
}

export interface SpecialNeedsAssessment extends BaseAssessment {
  type: ASSESSMENT_TYPES.SPECIAL_NEEDS;
  specialNeedsData: SpecialNeeds;
}

export interface HomeEnvironmentAssessmentType extends BaseAssessment {
  type: ASSESSMENT_TYPES.HOME_ENVIRONMENT;
  homeEnvironmentData: HomeEnvironmentAssessment;
}

export type Assessment =
  | ClinicalAssessment
  | BehavioralHealthAssessment
  | DementiaAssessment
  | EndOfLifeAssessment
  | EmergencyAssessment
  | CulturalNeedsAssessment
  | SpecialNeedsAssessment
  | HomeEnvironmentAssessmentType;

export interface AssessmentMetrics {
  qualityMetrics: QualityMetrics;
  staffCompetency: StaffCompetency;
  completionRate: number;
  averageCompletionTime: number;
  overdueAssessments: number;
  criticalFindings: number;
}
