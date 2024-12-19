export enum IncidentSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum IncidentCategory {
  // Safeguarding Incidents
  SAFEGUARDING_ABUSE = 'SAFEGUARDING_ABUSE',
  SAFEGUARDING_NEGLECT = 'SAFEGUARDING_NEGLECT',
  SAFEGUARDING_SELF_HARM = 'SAFEGUARDING_SELF_HARM',
  SAFEGUARDING_MISSING_PERSON = 'SAFEGUARDING_MISSING_PERSON',

  // Medical Incidents
  MEDICATION_ERROR = 'MEDICATION_ERROR',
  MEDICATION_REFUSAL = 'MEDICATION_REFUSAL',
  MEDICATION_ADVERSE_REACTION = 'MEDICATION_ADVERSE_REACTION',
  MEDICAL_EMERGENCY = 'MEDICAL_EMERGENCY',
  INFECTION_OUTBREAK = 'INFECTION_OUTBREAK',
  PRESSURE_SORE = 'PRESSURE_SORE',

  // Behavioral Incidents
  BEHAVIOR_AGGRESSION = 'BEHAVIOR_AGGRESSION',
  BEHAVIOR_DISTRESS = 'BEHAVIOR_DISTRESS',
  BEHAVIOR_WITHDRAWAL = 'BEHAVIOR_WITHDRAWAL',
  MENTAL_HEALTH_CRISIS = 'MENTAL_HEALTH_CRISIS',

  // Health & Safety
  FALL = 'FALL',
  INJURY = 'INJURY',
  PROPERTY_DAMAGE = 'PROPERTY_DAMAGE',
  FIRE_SAFETY = 'FIRE_SAFETY',
  ENVIRONMENTAL_HAZARD = 'ENVIRONMENTAL_HAZARD',

  // Care Delivery
  CARE_PLAN_BREACH = 'CARE_PLAN_BREACH',
  NUTRITION_HYDRATION = 'NUTRITION_HYDRATION',
  PERSONAL_CARE_ISSUE = 'PERSONAL_CARE_ISSUE',
  DIGNITY_RESPECT = 'DIGNITY_RESPECT',

  // Staff Related
  STAFF_SHORTAGE = 'STAFF_SHORTAGE',
  STAFF_CONDUCT = 'STAFF_CONDUCT',
  STAFF_INJURY = 'STAFF_INJURY',
  TRAINING_COMPLIANCE = 'TRAINING_COMPLIANCE',

  // External
  VISITOR_INCIDENT = 'VISITOR_INCIDENT',
  CONTRACTOR_INCIDENT = 'CONTRACTOR_INCIDENT',
  EXTERNAL_PROFESSIONAL = 'EXTERNAL_PROFESSIONAL',

  // Other
  EQUIPMENT_FAILURE = 'EQUIPMENT_FAILURE',
  IT_SYSTEMS = 'IT_SYSTEMS',
  OTHER = 'OTHER'
}

export enum IncidentStatus {
  REPORTED = 'REPORTED',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ESCALATED = 'ESCALATED',
  ACTION_REQUIRED = 'ACTION_REQUIRED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum NotificationUrgency {
  IMMEDIATE = 'IMMEDIATE',  // Within 1 hour
  URGENT = 'URGENT',       // Within 4 hours
  HIGH = 'HIGH',          // Within 12 hours
  MEDIUM = 'MEDIUM',      // Within 24 hours
  LOW = 'LOW'            // Within 48 hours
}

export interface NotificationRule {
  category: IncidentCategory;
  severity: IncidentSeverity;
  recipients: {
    role: string;
    urgency: NotificationUrgency;
    method: ('EMAIL' | 'SMS' | 'PHONE' | 'SYSTEM_ALERT')[];
  }[];
  autoEscalation?: {
    timeThreshold: number; // minutes
    escalateTo: string[];
  };
}

export interface IncidentAnalytics {
  trendAnalysis: {
    category: IncidentCategory;
    count: number;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
    timeFrame: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  }[];
  riskPatterns: {
    category: IncidentCategory;
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    contributingFactors: string[];
    recommendedActions: string[];
  }[];
  staffingCorrelation: {
    staffingLevel: number;
    incidentRate: number;
    shift: 'DAY' | 'NIGHT';
    category: IncidentCategory;
  }[];
  residentImpact: {
    residentId: string;
    incidentCount: number;
    categories: IncidentCategory[];
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
}

export interface Incident {
  id: string;
  careHomeId: string;
  residentId?: string;
  reporterId: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  dateOccurred: Date;
  dateReported: Date;
  location: string;
  description: string;
  immediateActions: string;
  witnessIds?: string[];
  involvedStaffIds?: string[];
  notifiedAuthorities?: boolean;
  safeguardingReferral?: boolean;
  investigation?: {
    assignedTo: string;
    startDate: Date;
    findings: string;
    rootCause?: string;
    recommendations: string[];
    completedDate?: Date;
  };
  reviews: {
    reviewerId: string;
    date: Date;
    comments: string;
    outcome: 'APPROVED' | 'NEEDS_REVISION' | 'ESCALATED';
  }[];
  actions: {
    id: string;
    description: string;
    assignedTo: string;
    dueDate: Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
    completedDate?: Date;
    evidence?: string;
  }[];
  notifications: {
    recipientId: string;
    type: 'CQC' | 'LOCAL_AUTHORITY' | 'POLICE' | 'NEXT_OF_KIN' | 'MANAGEMENT';
    dateSent: Date;
    method: 'EMAIL' | 'PHONE' | 'LETTER';
    acknowledgement?: Date;
  }[];
  documents: {
    id: string;
    type: 'STATEMENT' | 'EVIDENCE' | 'REPORT' | 'CORRESPONDENCE';
    filename: string;
    uploadedBy: string;
    uploadDate: Date;
  }[];
  timeline: {
    date: Date;
    action: string;
    userId: string;
    details: string;
  }[];
  lessons: {
    identified: string;
    actions: string;
    sharedWith: string[];
    dateImplemented?: Date;
  }[];
  riskAssessment?: {
    likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    controls: string[];
    reviewDate: Date;
  };
}
