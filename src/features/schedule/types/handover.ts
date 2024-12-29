import type { User, Staff } from '@prisma/client'
export type { User, Staff }

export type HandoverStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED'
export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type AttachmentType = 'DOCUMENT' | 'IMAGE' | 'VOICE' | 'OTHER'

// Regional Settings
export type Region = 
  | 'ENGLAND'
  | 'WALES'
  | 'SCOTLAND'
  | 'NORTHERN_IRELAND'
  | 'IRELAND';

export type RegulatoryBody = 
  | 'CQC'           // Care Quality Commission (England)
  | 'CIW'           // Care Inspectorate Wales
  | 'CI_SCOTLAND'   // Care Inspectorate Scotland
  | 'RQIA'          // Regulation and Quality Improvement Authority (Northern Ireland)
  | 'HIQA';         // Health Information and Quality Authority (Ireland)

export type CareSettingType =
  | 'ELDERLY_CARE'
  | 'CHILDRENS_HOME'
  | 'NURSING_HOME'
  | 'RESIDENTIAL_HOME'
  | 'SUPPORTED_LIVING'
  | 'SPECIALIST_CARE';

// Food & Drink Category
export type FoodAndDrinkActivity =
  | 'MEAL_ASSISTANCE'
  | 'HYDRATION'
  | 'DIETARY_REQUIREMENTS'
  | 'SNACK_TIME'
  | 'FEEDING_TUBE_CARE'
  | 'ALLERGIES_MANAGEMENT'
  | 'CULTURAL_DIETARY_NEEDS'
  | 'NUTRITION_MONITORING';

// Personal Care Category
export type PersonalCareActivity =
  | 'BATHING'
  | 'TOILETING'
  | 'DRESSING'
  | 'GROOMING'
  | 'ORAL_CARE'
  | 'CONTINENCE_CARE'
  | 'MOBILITY_SUPPORT'
  | 'SENSORY_SUPPORT';

// Clinical Care Category
export type ClinicalCareActivity =
  | 'MEDICATION'
  | 'WOUND_CARE'
  | 'CATHETER_CARE'
  | 'BLOOD_PRESSURE'
  | 'BLOOD_SUGAR'
  | 'OXYGEN_THERAPY'
  | 'PAIN_MANAGEMENT'
  | 'INFECTION_CONTROL';

// Health Recordings Category
export type HealthRecordingActivity =
  | 'VITAL_SIGNS'
  | 'WEIGHT_MONITORING'
  | 'FLUID_BALANCE'
  | 'BEHAVIOR_MONITORING'
  | 'PAIN_ASSESSMENT'
  | 'SLEEP_PATTERN'
  | 'MENTAL_HEALTH_MONITORING'
  | 'INCIDENT_REPORTING';

// Activities & Social Category
export type ActivitiesSocialActivity =
  | 'GROUP_ACTIVITY'
  | 'INDIVIDUAL_ACTIVITY'
  | 'EXERCISE'
  | 'OUTDOOR_TIME'
  | 'SOCIAL_INTERACTION'
  | 'ENTERTAINMENT'
  | 'CULTURAL_ACTIVITIES'
  | 'SPIRITUAL_SUPPORT';

// Children's Home Specific Categories
export type ChildrensHomeActivity =
  | 'EDUCATION_SUPPORT'      // 📚 Education and homework support
  | 'SAFEGUARDING'          // 🛡️ Child protection and safeguarding
  | 'EMOTIONAL_SUPPORT'     // 🤗 Emotional and behavioral support
  | 'LIFE_SKILLS'          // 🎯 Life skills development
  | 'FAMILY_CONTACT'       // 👨‍👩‍👧‍👦 Family visits and contact
  | 'RECREATION'           // 🎮 Play and recreation
  | 'HEALTH_CHECKUP'       // 🏥 Health and medical appointments
  | 'THERAPY_SESSION'      // 🧠 Therapeutic support
  | 'SOCIAL_WORKER_VISIT'  // 👥 Social worker visits
  | 'DEVELOPMENT_REVIEW'   // 📈 Development and progress review
  | 'INDEPENDENT_VISITOR'  // 🤝 Independent visitor meetings
  | 'ADVOCACY_SUPPORT';    // 📢 Advocacy and rights support

// Health Visit Category
export type HealthVisitActivity =
  | 'DOCTOR_VISIT'
  | 'NURSE_VISIT'
  | 'PHYSIO_SESSION'
  | 'DENTAL_CARE'
  | 'SPECIALIST_VISIT'
  | 'MENTAL_HEALTH';

export type HandoverTaskCategory =
  | 'FOOD_AND_DRINK'
  | 'PERSONAL_CARE'
  | 'CLINICAL_CARE'
  | 'HEALTH_RECORDINGS'
  | 'ACTIVITIES_SOCIAL'
  | 'HEALTH_VISIT'
  | 'CHILDRENS_CARE'    // New category for children's home
  | 'SAFEGUARDING'      // New category for protection
  | 'EDUCATION'         // New category for education
  | 'DEVELOPMENT'       // New category for development
  | 'INCIDENT'
  | 'HANDOVER'
  | 'OTHER';

export const TASK_CATEGORY_ICONS: Record<HandoverTaskCategory, { icon: string; color: string }> = {
  FOOD_AND_DRINK: { icon: '🍽️', color: '#FF69B4' },
  PERSONAL_CARE: { icon: '🛁', color: '#98FB98' },
  CLINICAL_CARE: { icon: '💊', color: '#5BC0DE' },
  HEALTH_RECORDINGS: { icon: '📊', color: '#9370DB' },
  ACTIVITIES_SOCIAL: { icon: '🎮', color: '#FFA500' },
  HEALTH_VISIT: { icon: '👨‍⚕️', color: '#20B2AA' },
  CHILDRENS_CARE: { icon: '🧒', color: '#FFD700' },   // Gold color for children's care
  SAFEGUARDING: { icon: '🛡️', color: '#B22222' },     // FireBrick color for protection
  EDUCATION: { icon: '📚', color: '#4169E1' },        // RoyalBlue for education
  DEVELOPMENT: { icon: '🌱', color: '#32CD32' },      // LimeGreen for development
  INCIDENT: { icon: '⚠️', color: '#FF6B6B' },
  HANDOVER: { icon: '🔄', color: '#6495ED' },
  OTHER: { icon: '📝', color: '#808080' },
};

export const CARE_ACTIVITY_ICONS: Record<string, { icon: string; description: string }> = {
  // Children's Home Activities
  EDUCATION_SUPPORT: { icon: '📚', description: 'Education and homework support' },
  SAFEGUARDING: { icon: '🛡️', description: 'Child protection and safeguarding' },
  EMOTIONAL_SUPPORT: { icon: '🤗', description: 'Emotional and behavioral support' },
  LIFE_SKILLS: { icon: '🎯', description: 'Life skills development' },
  FAMILY_CONTACT: { icon: '👨‍👩‍👧‍👦', description: 'Family visits and contact' },
  RECREATION: { icon: '🎮', description: 'Play and recreation' },
  HEALTH_CHECKUP: { icon: '🏥', description: 'Health and medical appointments' },
  THERAPY_SESSION: { icon: '🧠', description: 'Therapeutic support' },
  SOCIAL_WORKER_VISIT: { icon: '👥', description: 'Social worker visits' },
  DEVELOPMENT_REVIEW: { icon: '📈', description: 'Development and progress review' },
  INDEPENDENT_VISITOR: { icon: '🤝', description: 'Independent visitor meetings' },
  ADVOCACY_SUPPORT: { icon: '📢', description: 'Advocacy and rights support' },

  // Food & Drink Activities
  MEAL_ASSISTANCE: { icon: '🍽️', description: 'Help with eating meals' },
  HYDRATION: { icon: '🥤', description: 'Ensure proper fluid intake' },
  DIETARY_REQUIREMENTS: { icon: '📋', description: 'Special dietary needs' },
  SNACK_TIME: { icon: '🍎', description: 'Regular snacks' },
  FEEDING_TUBE_CARE: { icon: '⚕️', description: 'Feeding tube management' },
  ALLERGIES_MANAGEMENT: { icon: '🚨', description: 'Allergy management' },
  CULTURAL_DIETARY_NEEDS: { icon: '🌎', description: 'Cultural dietary needs' },
  NUTRITION_MONITORING: { icon: '📊', description: 'Nutrition monitoring' },

  // Personal Care Activities
  BATHING: { icon: '🛁', description: 'Assistance with bathing' },
  TOILETING: { icon: '🚽', description: 'Toileting assistance' },
  DRESSING: { icon: '👕', description: 'Help with dressing' },
  GROOMING: { icon: '💇', description: 'Personal grooming' },
  ORAL_CARE: { icon: '🦷', description: 'Dental hygiene' },
  CONTINENCE_CARE: { icon: '🧻', description: 'Continence management' },
  MOBILITY_SUPPORT: { icon: '🚶‍♂️', description: 'Mobility support' },
  SENSORY_SUPPORT: { icon: '👂', description: 'Sensory support' },

  // Clinical Care Activities
  MEDICATION: { icon: '💊', description: 'Medication administration' },
  WOUND_CARE: { icon: '🩹', description: 'Wound dressing' },
  CATHETER_CARE: { icon: '🏥', description: 'Catheter management' },
  BLOOD_PRESSURE: { icon: '💉', description: 'Blood pressure check' },
  BLOOD_SUGAR: { icon: '📊', description: 'Blood sugar monitoring' },
  OXYGEN_THERAPY: { icon: '💨', description: 'Oxygen administration' },
  PAIN_MANAGEMENT: { icon: '😣', description: 'Pain management' },
  INFECTION_CONTROL: { icon: '🚨', description: 'Infection control' },

  // Health Recording Activities
  VITAL_SIGNS: { icon: '❤️', description: 'Vital signs monitoring' },
  WEIGHT_MONITORING: { icon: '⚖️', description: 'Weight tracking' },
  FLUID_BALANCE: { icon: '💧', description: 'Fluid intake/output' },
  BEHAVIOR_MONITORING: { icon: '👀', description: 'Behavior observation' },
  PAIN_ASSESSMENT: { icon: '😣', description: 'Pain level assessment' },
  SLEEP_PATTERN: { icon: '😴', description: 'Sleep monitoring' },
  MENTAL_HEALTH_MONITORING: { icon: '🧠', description: 'Mental health monitoring' },
  INCIDENT_REPORTING: { icon: '📝', description: 'Incident reporting' },

  // Activities & Social Activities
  GROUP_ACTIVITY: { icon: '👥', description: 'Group activities' },
  INDIVIDUAL_ACTIVITY: { icon: '🎨', description: 'Individual activities' },
  EXERCISE: { icon: '🤸', description: 'Physical exercise' },
  OUTDOOR_TIME: { icon: '🌳', description: 'Time outdoors' },
  SOCIAL_INTERACTION: { icon: '💭', description: 'Social engagement' },
  ENTERTAINMENT: { icon: '📺', description: 'Entertainment activities' },
  CULTURAL_ACTIVITIES: { icon: '🌎', description: 'Cultural activities' },
  SPIRITUAL_SUPPORT: { icon: '✝️', description: 'Spiritual support' },

  // Health Visit Activities
  DOCTOR_VISIT: { icon: '👨‍⚕️', description: 'Doctor appointment' },
  NURSE_VISIT: { icon: '👩‍⚕️', description: 'Nurse visit' },
  PHYSIO_SESSION: { icon: '🤸‍♂️', description: 'Physiotherapy' },
  DENTAL_CARE: { icon: '🦷', description: 'Dental appointment' },
  SPECIALIST_VISIT: { icon: '👨‍⚕️', description: 'Specialist consultation' },
  MENTAL_HEALTH: { icon: '🧠', description: 'Mental health support' },
};

// Language and Localization
export type SupportedLanguage = 
  | 'en-GB'    // British English
  | 'cy-GB'    // Welsh (Cymraeg)
  | 'gd-GB'    // Scottish Gaelic (Gàidhlig)
  | 'ga-IE'    // Irish (Gaeilge)
  | 'ul-GB';   // Ulster Scots

export type LanguageRegion = {
  code: SupportedLanguage;
  name: string;
  region: Region;
  isDefault: boolean;
  regulatoryBody: RegulatoryBody;
  dateFormat: string;
  timeFormat: string;
};

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageRegion> = {
  'en-GB': {
    code: 'en-GB',
    name: 'British English',
    region: 'ENGLAND',
    isDefault: true,
    regulatoryBody: 'CQC',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm'
  },
  'cy-GB': {
    code: 'cy-GB',
    name: 'Cymraeg',
    region: 'WALES',
    isDefault: false,
    regulatoryBody: 'CIW',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm'
  },
  'gd-GB': {
    code: 'gd-GB',
    name: 'Gàidhlig',
    region: 'SCOTLAND',
    isDefault: false,
    regulatoryBody: 'CI_SCOTLAND',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm'
  },
  'ga-IE': {
    code: 'ga-IE',
    name: 'Gaeilge',
    region: 'IRELAND',
    isDefault: false,
    regulatoryBody: 'HIQA',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm'
  },
  'ul-GB': {
    code: 'ul-GB',
    name: 'Ulster Scots',
    region: 'NORTHERN_IRELAND',
    isDefault: false,
    regulatoryBody: 'RQIA',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm'
  }
};

// Multi-tenancy Types
export type TenantConfig = {
  id: string;
  name: string;
  timezone: string;
  defaultLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
  branding?: {
    logo?: string;
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  features: {
    offlineSupport: boolean;
    multiLanguage: boolean;
    auditTrail: boolean;
    analytics: boolean;
  };
};

// Validation Types
export type ValidationRule = {
  type: 'required' | 'length' | 'format' | 'custom';
  message: { [key in SupportedLanguage]?: string };
  params?: {
    min?: number;
    max?: number;
    pattern?: string;
    validator?: (value: any) => boolean;
  };
};

export type ValidationResult = {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
    code: string;
  }[];
};

// Audit Trail Types
export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'COMPLETE'
  | 'VERIFY'
  | 'EXPORT'
  | 'PRINT';

export type AuditRecord = {
  id: string;
  tenantId: string;
  entityType: 'HANDOVER' | 'TASK' | 'NOTE' | 'ATTACHMENT';
  entityId: string;
  action: AuditAction;
  userId: string;
  timestamp: Date;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: {
    ip?: string;
    userAgent?: string;
    location?: string;
  };
};

// Reporting and Analytics Types
export type MetricType = 
  | 'COMPLETION_RATE'
  | 'COMPLIANCE_SCORE'
  | 'RESPONSE_TIME'
  | 'QUALITY_SCORE'
  | 'STAFF_PERFORMANCE'
  | 'INCIDENT_RATE';

export type ReportTimeframe = 
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'YEARLY'
  | 'CUSTOM';

export type AnalyticsMetric = {
  type: MetricType;
  value: number;
  unit?: string;
  trend?: {
    direction: 'UP' | 'DOWN' | 'STABLE';
    percentage: number;
  };
  breakdown?: {
    [key: string]: number;
  };
};

export type Report = {
  id: string;
  tenantId: string;
  type: 'COMPLIANCE' | 'PERFORMANCE' | 'QUALITY' | 'CUSTOM';
  timeframe: ReportTimeframe;
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: AnalyticsMetric[];
  filters?: {
    [key: string]: any;
  };
  createdAt: Date;
  createdBy: string;
};

// Regional Compliance Requirements
export type ComplianceFramework = {
  region: Region;
  regulatoryBody: RegulatoryBody;
  standards: {
    code: string;
    title: { [key in SupportedLanguage]?: string };
    description: { [key in SupportedLanguage]?: string };
    requirements: string[];
    evidenceRequired: boolean;
    reviewFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  }[];
};

export const REGIONAL_COMPLIANCE: Record<Region, ComplianceFramework> = {
  ENGLAND: {
    region: 'ENGLAND',
    regulatoryBody: 'CQC',
    standards: [
      {
        code: 'CQC-SC1',
        title: { 'en-GB': 'Person-centred care' },
        description: { 'en-GB': 'Ensures care is tailored to individual needs' },
        requirements: ['Care plan review', 'Individual preferences documented'],
        evidenceRequired: true,
        reviewFrequency: 'MONTHLY'
      }
      // More standards...
    ]
  },
  // Other regions...
};

// Children's Home Specific Regulations
export type ChildrensHomeRegulation = {
  code: string;
  region: Region;
  category: 'SAFEGUARDING' | 'EDUCATION' | 'WELLBEING' | 'DEVELOPMENT' | 'SAFETY';
  requirements: {
    id: string;
    title: { [key in SupportedLanguage]?: string };
    description: { [key in SupportedLanguage]?: string };
    minimumStaffQualification?: string[];
    mandatoryTraining?: string[];
    reviewPeriod: number; // in days
    assessmentCriteria: string[];
  }[];
};

export type SafeguardingRequirement = {
  type: 'RISK_ASSESSMENT' | 'INCIDENT_REPORT' | 'BEHAVIOR_MONITORING' | 'INTERVENTION_PLAN';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  assignedTo: string[];
  dueDate: Date;
  reviewDate: Date;
  documents: string[];
  notes: string;
};

// Enhanced Quality Metrics
export type QualityMetric = {
  id: string;
  category: 'CARE_DELIVERY' | 'STAFF_PERFORMANCE' | 'RESIDENT_SATISFACTION' | 'COMPLIANCE' | 'SAFETY';
  name: { [key in SupportedLanguage]?: string };
  description: { [key in SupportedLanguage]?: string };
  target: number;
  unit: string;
  weight: number; // For weighted scoring
  calculation: 'AVERAGE' | 'SUM' | 'PERCENTAGE' | 'CUSTOM';
  customCalculation?: (data: any) => number;
  benchmarks: {
    excellent: number;
    good: number;
    needsImprovement: number;
    inadequate: number;
  };
  evidenceRequired: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
};

// Accessibility Requirements
export type AccessibilityRequirement = {
  region: Region;
  category: 'VISUAL' | 'AUDITORY' | 'MOBILITY' | 'COGNITIVE' | 'SPEECH';
  requirements: {
    code: string;
    description: { [key in SupportedLanguage]?: string };
    compliance: 'REQUIRED' | 'RECOMMENDED';
    implementation: string[];
    alternatives: string[];
  }[];
};

// Incident Reporting Types
export type IncidentSeverity = 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';

export type IncidentCategory = 
  | 'MEDICATION_ERROR'
  | 'FALL'
  | 'BEHAVIOR'
  | 'SAFEGUARDING'
  | 'SECURITY'
  | 'HEALTH_EMERGENCY'
  | 'PROPERTY_DAMAGE'
  | 'MISSING_PERSON';

export type IncidentReport = {
  id: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  dateTime: Date;
  location: string;
  involvedResidents: string[];
  involvedStaff: string[];
  witnesses: string[];
  description: string;
  immediateActions: string[];
  notificationsRequired: {
    internal: boolean;
    regulatory: boolean;
    police: boolean;
    socialServices: boolean;
    nextOfKin: boolean;
  };
  followUpActions: {
    action: string;
    assignedTo: string;
    dueDate: Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  }[];
  investigation?: {
    investigator: string;
    startDate: Date;
    completionDate?: Date;
    findings: string;
    recommendations: string[];
    preventiveMeasures: string[];
  };
  documents: string[];
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CLOSED';
  reviewedBy?: string;
  reviewDate?: Date;
  regulatoryReference?: string;
};

export interface HandoverSession {
  id: string
  orgId: string
  careHomeId: string
  shiftId: string
  startTime: Date
  endTime?: Date
  status: HandoverStatus
  qualityScore?: number
  complianceStatus: ComplianceStatus
  outgoingStaff: Staff[]
  incomingStaff: Staff[]
  tenantId: string;
  language: SupportedLanguage;
  localizedContent?: {
    title?: { [key in SupportedLanguage]?: string };
    summary?: { [key in SupportedLanguage]?: string };
  };
  offline?: {
    lastSyncedAt: Date;
    syncStatus: 'SYNCED' | 'PENDING' | 'CONFLICT';
    localChanges?: any;
    conflictResolution?: 'LOCAL' | 'REMOTE' | 'MERGED';
  };
  validation?: {
    rules: ValidationRule[];
    lastValidated?: Date;
    validationResults?: ValidationResult;
  };
  audit?: {
    createdBy: string;
    createdAt: Date;
    lastModifiedBy: string;
    lastModifiedAt: Date;
    version: number;
    history: AuditRecord[];
  };
  metrics?: {
    completionTime?: number;
    qualityScore?: number;
    complianceScore?: number;
    taskCompletionRate?: number;
  };
  compliance?: {
    framework: ComplianceFramework;
    currentAssessment?: {
      date: Date;
      assessor: string;
      standards: {
        code: string;
        status: ComplianceStatus;
        evidence: string[];
        actions: string[];
      }[];
    };
  };
  qualityMetrics?: {
    metrics: QualityMetric[];
    currentScores: {
      [metricId: string]: {
        score: number;
        lastUpdated: Date;
        evidence?: string[];
      };
    };
  };
  incidents?: {
    activeIncidents: IncidentReport[];
    recentResolution: {
      incidentId: string;
      resolution: string;
      date: Date;
    }[];
  };
  accessibilityRequirements?: {
    active: AccessibilityRequirement[];
    accommodations: {
      requirement: string;
      implementation: string;
      lastReviewed: Date;
    }[];
  };
  specializedCare?: {
    requirements: SpecializedCareRequirement[];
    assessments: {
      date: Date;
      assessor: string;
      findings: string[];
      recommendations: string[];
    }[];
  };
  riskManagement?: {
    assessments: RiskAssessment[];
    reviews: {
      date: Date;
      reviewer: string;
      changes: string[];
      nextReview: Date;
    }[];
  };
  staffCompetency?: {
    required: TrainingRequirement[];
    records: StaffCompetency[];
    gaps: {
      staffId: string;
      missingTraining: string[];
      dueDate: Date;
    }[];
  };
  medicationManagement?: {
    records: MedicationRecord[];
    audits: {
      date: Date;
      auditor: string;
      findings: string[];
      actions: string[];
    }[];
  };
  carePlanIntegration?: {
    residents: CarePlanIntegration[];
    updates: {
      date: Date;
      category: CarePlanCategory;
      changes: string[];
      updatedBy: string;
    }[];
  };
  createdAt: Date
  updatedAt: Date
}

export interface HandoverNote {
  id: string
  handoverSessionId: string
  content: string
  author: User
  authorId: string
  attachments: HandoverAttachment[]
  createdAt: Date
  updatedAt: Date
}

export interface HandoverTask {
  id: string;
  handoverSessionId: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  category: HandoverTaskCategory;
  activity?: 
    | FoodAndDrinkActivity 
    | PersonalCareActivity 
    | ClinicalCareActivity 
    | HealthRecordingActivity 
    | ActivitiesSocialActivity 
    | HealthVisitActivity
    | ChildrensHomeActivity;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  residentId?: string;
  resident?: {
    id: string;
    name: string;
    room?: string;
    photo?: string;
    dateOfBirth?: string;        // Added for age-appropriate care
    preferences?: string[];      // Cultural, religious, personal preferences
    primaryLanguage?: string;    // For language support
    careLevel?: string;          // Level of care needed
  };
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    image?: string;
    role?: string;
    qualifications?: string[];   // Staff qualifications
    languages?: string[];        // Languages spoken
  };
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    image?: string;
    role?: string;
  };
  dueDate?: Date;
  reminderTime?: Date;
  completedAt?: Date;
  completedById?: string;
  notes?: string;
  tags?: string[];
  regulatoryRequirements?: {     // Added for compliance
    framework: string;           // e.g., "CQC", "Ofsted"
    standardRef?: string;        // Reference to specific standard
    evidenceRequired?: boolean;  // If evidence needs to be attached
  };
  offlineSync?: {               // Added for offline support
    status: 'SYNCED' | 'PENDING' | 'CONFLICT';
    lastSyncedAt?: Date;
    localChanges?: any;
  };
  regionSpecific?: {            // Added for regional requirements
    region: Region;
    localRequirements?: string[];
    regulatoryBody?: RegulatoryBody;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface HandoverAttachment {
  id: string
  handoverSessionId: string
  type: AttachmentType
  filename: string
  url: string
  uploadedBy: User
  uploadedById: string
  noteId?: string
  createdAt: Date
  updatedAt: Date
}

// Specialized Care Requirements
export type SpecializedCareType = 
  | 'DEMENTIA'
  | 'PALLIATIVE'
  | 'MENTAL_HEALTH'
  | 'LEARNING_DISABILITY'
  | 'PHYSICAL_DISABILITY'
  | 'AUTISM'
  | 'SUBSTANCE_MISUSE'
  | 'EATING_DISORDER';

export type SpecializedCareRequirement = {
  type: SpecializedCareType;
  level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  staffingRatio: number;
  qualifications: string[];
  protocols: {
    name: { [key in SupportedLanguage]?: string };
    description: { [key in SupportedLanguage]?: string };
    steps: string[];
    emergencyProcedures: string[];
  }[];
};

// Risk Management
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskAssessment = {
  id: string;
  category: 'HEALTH' | 'SAFETY' | 'BEHAVIOR' | 'ENVIRONMENTAL' | 'OPERATIONAL';
  description: string;
  level: RiskLevel;
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  mitigationStrategies: string[];
  reviewFrequency: number; // days
  lastReview?: Date;
  nextReview?: Date;
  assignedTo: string[];
};

// Staff Training and Competency
export type TrainingRequirement = {
  id: string;
  name: { [key in SupportedLanguage]?: string };
  type: 'MANDATORY' | 'RECOMMENDED' | 'SPECIALIZED';
  frequency: 'ONCE' | 'ANNUAL' | 'BIANNUAL' | 'QUARTERLY';
  validityPeriod: number; // months
  provider: string[];
  certification: boolean;
  topics: string[];
  assessmentMethod: 'WRITTEN' | 'PRACTICAL' | 'ONLINE' | 'OBSERVATION';
};

export type StaffCompetency = {
  staffId: string;
  competencies: {
    trainingId: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
    completionDate?: Date;
    expiryDate?: Date;
    certificate?: string;
    assessor?: string;
    score?: number;
  }[];
};

// Medication Management
export type MedicationType = 
  | 'CONTROLLED'
  | 'NON_CONTROLLED'
  | 'OVER_THE_COUNTER'
  | 'HOMELY_REMEDIES'
  | 'PRN';

export type MedicationRecord = {
  id: string;
  type: MedicationType;
  name: string;
  strength: string;
  route: string;
  frequency: string;
  timing: string[];
  specialInstructions?: string;
  sideEffects: string[];
  interactions: string[];
  storage: {
    temperature: string;
    location: string;
    restrictions: string[];
  };
};

// Care Plan Integration
export type CarePlanCategory = 
  | 'PERSONAL_CARE'
  | 'HEALTH'
  | 'NUTRITION'
  | 'MOBILITY'
  | 'COMMUNICATION'
  | 'SOCIAL'
  | 'EMOTIONAL'
  | 'SPIRITUAL';

export type CarePlanIntegration = {
  residentId: string;
  categories: {
    [K in CarePlanCategory]: {
      needs: string[];
      preferences: string[];
      goals: string[];
      interventions: string[];
      review: {
        frequency: number; // days
        lastReview: Date;
        nextReview: Date;
        reviewer: string;
      };
    };
  };
};

// Enhanced Regional Standards
export const REGIONAL_STANDARDS: Record<Region, {
  frameworks: {
    name: string;
    version: string;
    lastUpdated: Date;
    standards: {
      code: string;
      title: { [key in SupportedLanguage]?: string };
      requirements: string[];
      guidance: string;
      evidence: string[];
    }[];
  }[];
}> = {
  ENGLAND: {
    frameworks: [
      {
        name: 'CQC Fundamental Standards',
        version: '2023.1',
        lastUpdated: new Date('2023-04-01'),
        standards: [
          {
            code: 'REG-9',
            title: { 'en-GB': 'Person-centred care' },
            requirements: [
              'Individual needs assessment',
              'Care planning involvement',
              'Regular reviews'
            ],
            guidance: 'Ensure care and treatment meets individual needs',
            evidence: ['Care plans', 'Review records', 'Resident feedback']
          }
          // More standards...
        ]
      }
    ]
  }
  // Other regions...
};
