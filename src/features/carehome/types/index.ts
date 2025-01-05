// src/features/carehome/types/index.ts
import { 
  RegulatoryBody, 
  InspectionRating, 
  ComplianceStatus, 
  ComplianceRequirement,
  ComplianceCategory,
  InspectionReport,
  ComplianceTraining,
  Region
} from './compliance';

import { 
  Address, 
  Capacity, 
  Metrics, 
  Stats,
  ServiceOffering
} from './common';

import {
  CarePlan,
  Assessment,
  CareGoal,
  CareIntervention,
  Medication,
  DietaryRequirement,
  PlannedActivity,
  RiskAssessment,
  CareReview,
  CareMetrics,
  CareIncident
} from './care';

import {
  StaffRole,
  ShiftType,
  StaffMember,
  Qualification,
  TrainingRecord,
  ShiftSchedule,
  PerformanceRecord,
  StaffDocument,
  StaffingRequirement,
  TimeOffRequest
} from './staff';

// Core enums for care home types
export enum CareHomeType {
  NURSING_HOME = 'NURSING_HOME',
  RESIDENTIAL_CARE = 'RESIDENTIAL_CARE',
  ASSISTED_LIVING = 'ASSISTED_LIVING',
  DEMENTIA_CARE = 'DEMENTIA_CARE',
  RESPITE_CARE = 'RESPITE_CARE',
  PALLIATIVE_CARE = 'PALLIATIVE_CARE',
  REHABILITATION = 'REHABILITATION',
  LEARNING_DISABILITIES = 'LEARNING_DISABILITIES',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  PHYSICAL_DISABILITIES = 'PHYSICAL_DISABILITIES',
  DUAL_REGISTERED = 'DUAL_REGISTERED',
  SUPPORTED_LIVING = 'SUPPORTED_LIVING',
  EXTRA_CARE_HOUSING = 'EXTRA_CARE_HOUSING',
  RETIREMENT_VILLAGE = 'RETIREMENT_VILLAGE',
  DAY_CARE = 'DAY_CARE'
}

export enum CareLevel {
  MINIMAL = 'MINIMAL',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  INTENSIVE = 'INTENSIVE',
  SPECIALIZED = 'SPECIALIZED'
}

export enum RegistrationType {
  NURSING = 'NURSING',
  RESIDENTIAL = 'RESIDENTIAL',
  DUAL = 'DUAL',
  SPECIALIZED = 'SPECIALIZED'
}

export enum ServiceType {
  ACCOMMODATION = 'ACCOMMODATION',
  PERSONAL_CARE = 'PERSONAL_CARE',
  NURSING_CARE = 'NURSING_CARE',
  DEMENTIA_SUPPORT = 'DEMENTIA_SUPPORT',
  REHABILITATION = 'REHABILITATION',
  PALLIATIVE_CARE = 'PALLIATIVE_CARE',
  RESPITE_CARE = 'RESPITE_CARE',
  DAY_CARE = 'DAY_CARE',
  SPECIALIST_CARE = 'SPECIALIST_CARE',
  ACCOMMODATION_SERVICES = 'ACCOMMODATION_SERVICES',
  RESPITE_ACCOMMODATION = 'RESPITE_ACCOMMODATION',
  SUPPORTED_LIVING = 'SUPPORTED_LIVING',
  SHELTERED_HOUSING = 'SHELTERED_HOUSING',
  CARE_SERVICES = 'CARE_SERVICES',
  PERSONAL_CARE = 'PERSONAL_CARE',
  NURSING_CARE = 'NURSING_CARE',
  PALLIATIVE_CARE = 'PALLIATIVE_CARE',
  END_OF_LIFE_CARE = 'END_OF_LIFE_CARE',
  SPECIALIST_CARE_SERVICES = 'SPECIALIST_CARE_SERVICES',
  DEMENTIA_SUPPORT = 'DEMENTIA_SUPPORT',
  MENTAL_HEALTH_SUPPORT = 'MENTAL_HEALTH_SUPPORT',
  LEARNING_DISABILITY_SUPPORT = 'LEARNING_DISABILITY_SUPPORT',
  PHYSICAL_DISABILITY_SUPPORT = 'PHYSICAL_DISABILITY_SUPPORT',
  SENSORY_IMPAIRMENT_SUPPORT = 'SENSORY_IMPAIRMENT_SUPPORT',
  REHABILITATION_SERVICES = 'REHABILITATION_SERVICES',
  REHABILITATION = 'REHABILITATION',
  PHYSIOTHERAPY = 'PHYSIOTHERAPY',
  OCCUPATIONAL_THERAPY = 'OCCUPATIONAL_THERAPY',
  SPEECH_THERAPY = 'SPEECH_THERAPY',
  DAY_SERVICES = 'DAY_SERVICES',
  DAY_CARE = 'DAY_CARE',
  SOCIAL_ACTIVITIES = 'SOCIAL_ACTIVITIES',
  RECREATIONAL_ACTIVITIES = 'RECREATIONAL_ACTIVITIES',
  MEDICAL_SERVICES = 'MEDICAL_SERVICES',
  MEDICATION_MANAGEMENT = 'MEDICATION_MANAGEMENT',
  CLINICAL_CARE = 'CLINICAL_CARE',
  SPECIALIST_MEDICAL_CARE = 'SPECIALIST_MEDICAL_CARE',
  SUPPORT_SERVICES = 'SUPPORT_SERVICES',
  DIETARY_SUPPORT = 'DIETARY_SUPPORT',
  MOBILITY_SUPPORT = 'MOBILITY_SUPPORT',
  BEHAVIORAL_SUPPORT = 'BEHAVIORAL_SUPPORT',
  EMOTIONAL_SUPPORT = 'EMOTIONAL_SUPPORT'
}

export enum FacilityRequirement {
  MEDICAL_FACILITIES = 'MEDICAL_FACILITIES',
  NURSES_STATION = 'NURSES_STATION',
  TREATMENT_ROOM = 'TREATMENT_ROOM',
  MEDICATION_ROOM = 'MEDICATION_ROOM',
  THERAPY_ROOM = 'THERAPY_ROOM',
  ACCOMMODATION_FACILITIES = 'ACCOMMODATION_FACILITIES',
  SINGLE_ROOMS = 'SINGLE_ROOMS',
  SHARED_ROOMS = 'SHARED_ROOMS',
  EN_SUITE_BATHROOMS = 'EN_SUITE_BATHROOMS',
  ASSISTED_BATHROOMS = 'ASSISTED_BATHROOMS',
  SPECIALIST_FACILITIES = 'SPECIALIST_FACILITIES',
  DEMENTIA_UNIT = 'DEMENTIA_UNIT',
  SECURE_UNIT = 'SECURE_UNIT',
  REHABILITATION_UNIT = 'REHABILITATION_UNIT',
  PALLIATIVE_CARE_UNIT = 'PALLIATIVE_CARE_UNIT',
  COMMON_AREAS = 'COMMON_AREAS',
  DINING_ROOM = 'DINING_ROOM',
  LOUNGE = 'LOUNGE',
  ACTIVITY_ROOM = 'ACTIVITY_ROOM',
  QUIET_ROOM = 'QUIET_ROOM',
  VISITORS_ROOM = 'VISITORS_ROOM',
  OUTDOOR_AREAS = 'OUTDOOR_AREAS',
  GARDEN = 'GARDEN',
  SECURE_GARDEN = 'SECURE_GARDEN',
  PATIO = 'PATIO',
  SMOKING_AREA = 'SMOKING_AREA',
  SUPPORT_FACILITIES = 'SUPPORT_FACILITIES',
  LAUNDRY = 'LAUNDRY',
  KITCHEN = 'KITCHEN',
  STAFF_ROOM = 'STAFF_ROOM',
  TRAINING_ROOM = 'TRAINING_ROOM',
  SAFETY_FACILITIES = 'SAFETY_FACILITIES',
  NURSE_CALL_SYSTEM = 'NURSE_CALL_SYSTEM',
  CCTV = 'CCTV',
  FIRE_SAFETY_SYSTEM = 'FIRE_SAFETY_SYSTEM',
  EMERGENCY_POWER = 'EMERGENCY_POWER'
}

export enum StaffingRequirement {
  MEDICAL_STAFF = 'MEDICAL_STAFF',
  REGISTERED_NURSE = 'REGISTERED_NURSE',
  CLINICAL_LEAD = 'CLINICAL_LEAD',
  NURSE_PRACTITIONER = 'NURSE_PRACTITIONER',
  CARE_STAFF = 'CARE_STAFF',
  CARE_ASSISTANT = 'CARE_ASSISTANT',
  SENIOR_CARER = 'SENIOR_CARER',
  KEY_WORKER = 'KEY_WORKER',
  SPECIALIST_STAFF = 'SPECIALIST_STAFF',
  DEMENTIA_SPECIALIST = 'DEMENTIA_SPECIALIST',
  MENTAL_HEALTH_NURSE = 'MENTAL_HEALTH_NURSE',
  LEARNING_DISABILITY_NURSE = 'LEARNING_DISABILITY_NURSE',
  PHYSIOTHERAPIST = 'PHYSIOTHERAPIST',
  OCCUPATIONAL_THERAPIST = 'OCCUPATIONAL_THERAPIST',
  SPEECH_THERAPIST = 'SPEECH_THERAPIST',
  SUPPORT_STAFF = 'SUPPORT_STAFF',
  ACTIVITIES_COORDINATOR = 'ACTIVITIES_COORDINATOR',
  SOCIAL_WORKER = 'SOCIAL_WORKER',
  COUNSELLOR = 'COUNSELLOR',
  MANAGEMENT_STAFF = 'MANAGEMENT_STAFF',
  REGISTERED_MANAGER = 'REGISTERED_MANAGER',
  DEPUTY_MANAGER = 'DEPUTY_MANAGER',
  UNIT_MANAGER = 'UNIT_MANAGER',
  ANCILLARY_STAFF = 'ANCILLARY_STAFF',
  CHEF = 'CHEF',
  KITCHEN_ASSISTANT = 'KITCHEN_ASSISTANT',
  HOUSEKEEPER = 'HOUSEKEEPER',
  MAINTENANCE_STAFF = 'MAINTENANCE_STAFF'
}

export enum ComplianceRequirementType {
  REGISTRATION_AND LICENSING = 'REGISTRATION_AND LICENSING',
  CQC_REGISTRATION = 'CQC_REGISTRATION',
  LOCAL_AUTHORITY_LICENSE = 'LOCAL_AUTHORITY_LICENSE',
  ENVIRONMENTAL_HEALTH = 'ENVIRONMENTAL_HEALTH',
  HEALTH_AND_SAFETY = 'HEALTH_AND_SAFETY',
  FIRE_SAFETY = 'FIRE_SAFETY',
  HEALTH_AND_SAFETY = 'HEALTH_AND_SAFETY',
  INFECTION_CONTROL = 'INFECTION_CONTROL',
  FOOD_SAFETY = 'FOOD_SAFETY',
  CLINICAL = 'CLINICAL',
  MEDICATION_MANAGEMENT = 'MEDICATION_MANAGEMENT',
  CLINICAL_GOVERNANCE = 'CLINICAL_GOVERNANCE',
  CARE_PLANNING = 'CARE_PLANNING',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  STAFF = 'STAFF',
  STAFF_TRAINING = 'STAFF_TRAINING',
  DBS_CHECKS = 'DBS_CHECKS',
  STAFF_SUPERVISION = 'STAFF_SUPERVISION',
  PROFESSIONAL_REGISTRATION = 'PROFESSIONAL_REGISTRATION',
  POLICIES_AND_PROCEDURES = 'POLICIES_AND_PROCEDURES',
  SAFEGUARDING = 'SAFEGUARDING',
  COMPLAINTS_PROCEDURE = 'COMPLAINTS_PROCEDURE',
  WHISTLEBLOWING = 'WHISTLEBLOWING',
  DATA_PROTECTION = 'DATA_PROTECTION',
  QUALITY_ASSURANCE = 'QUALITY_ASSURANCE',
  QUALITY_ASSURANCE = 'QUALITY_ASSURANCE',
  AUDIT_COMPLIANCE = 'AUDIT_COMPLIANCE',
  FEEDBACK_MANAGEMENT = 'FEEDBACK_MANAGEMENT',
  CONTINUOUS_IMPROVEMENT = 'CONTINUOUS_IMPROVEMENT'
}

export interface CareHomeCompliance {
  id: string;
  careHomeId: string;
  organizationId: string;
  regulatoryBody: RegulatoryBody;
  lastInspection: Date;
  nextInspection: Date;
  rating: InspectionRating;
  score: number;
  status: ComplianceStatus;
  requirements: ComplianceRequirement[];
  history: ComplianceHistory[];
  documents: ComplianceDocument[];
  training: ComplianceTraining[];
  inspectionReports: InspectionReport[];
}

export interface ComplianceHistory {
  date: Date;
  rating: InspectionRating;
  score: number;
  inspector: string;
  notes: string;
  documents: string[];
  categories: Record<ComplianceCategory, number>;
  actionItems: string[];
}

export interface ComplianceDocument {
  id: string;
  type: string;
  title: string;
  url: string;
  uploadedAt: Date;
  validUntil?: Date;
  status: string;
  category: ComplianceCategory;
  tags: string[];
  relatedRequirements: string[];
}

export interface CareHomeSettingsProps {
  careHomeId: string;
}

export interface CareHomeStats extends Stats {
  occupancy: number;
  staffCount: number;
  compliance: number;
  alerts: number;
  careTypeBreakdown: Record<CareHomeType, number>;
  staffingLevels: Record<StaffRole, number>;
  incidentStats: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
}

export interface CareHomeDashboardProps {
  careHomeId: string;
}

export interface CareHome {
  id: string;
  name: string;
  type: CareHomeType[];
  region: string;
  regulatoryBody: RegulatoryBody;
  address: Address;
  capacity: Capacity;
  metrics: Metrics;
  stats: CareHomeStats;
  services: ServiceOffering[];
  careLevels: CareLevel[];
  staffing: {
    requirements: StaffingRequirement[];
    schedule: ShiftSchedule[];
    roles: StaffRole[];
  };
  features: string[];
  specializations: CareHomeSpecialization[];
  accreditations: string[];
  policies: {
    id: string;
    name: string;
    lastUpdated: Date;
    reviewDue: Date;
    status: 'ACTIVE' | 'UNDER_REVIEW' | 'ARCHIVED';
  }[];
  contacts: {
    primary: {
      name: string;
      role: string;
      phone: string;
      email: string;
    };
    emergency: {
      name: string;
      role: string;
      phone: string;
      available24h: boolean;
    };
  };
  operatingHours: {
    visiting: {
      start: string;
      end: string;
      exceptions: string[];
    };
    admissions: {
      days: string[];
      hours: string;
      notes: string[];
    };
  };
}

export interface CareHomeRequirements {
  services: ServiceType[];
  facilities: FacilityRequirement[];
  staffing: {
    role: StaffingRequirement;
    count: number;
    shiftCoverage: {
      morning: number;
      afternoon: number;
      night: number;
    };
    qualifications: string[];
  }[];
  compliance: ComplianceRequirementType[];
  ratios: {
    residentToStaff: number;
    nurseToResident?: number;
    careAssistantToResident?: number;
  };
  specialistRequirements?: {
    type: string;
    description: string;
    mandatory: boolean;
  }[];
}

export interface CareHomeValidation {
  type: CareHomeType;
  requirements: CareHomeRequirements;
  validations: {
    services: (services: ServiceType[]) => boolean;
    facilities: (facilities: FacilityRequirement[]) => boolean;
    staffing: (staffing: StaffingRequirement[]) => boolean;
    compliance: (compliance: ComplianceRequirementType[]) => boolean;
  };
}

export * from './compliance';
export * from './common';
export * from './care';
export * from './staff';
