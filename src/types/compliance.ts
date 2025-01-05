export enum ComplianceRegion {
  UK_ENGLAND = 'UK_ENGLAND',
  UK_SCOTLAND = 'UK_SCOTLAND',
  UK_WALES = 'UK_WALES',
  UK_NORTHERN_IRELAND = 'UK_NORTHERN_IRELAND',
  IRELAND = 'IRELAND'
}

export enum ComplianceCategory {
  CARE_QUALITY = 'CARE_QUALITY',
  HEALTH_SAFETY = 'HEALTH_SAFETY',
  MEDICATION_MANAGEMENT = 'MEDICATION_MANAGEMENT',
  INFECTION_CONTROL = 'INFECTION_CONTROL',
  STAFF_TRAINING = 'STAFF_TRAINING',
  RESIDENT_RIGHTS = 'RESIDENT_RIGHTS',
  DATA_PROTECTION = 'DATA_PROTECTION',
  ENVIRONMENTAL = 'ENVIRONMENTAL'
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  PARTIALLY_COMPLIANT = 'PARTIALLY_COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  REQUIRES_ACTION = 'REQUIRES_ACTION'
}

export interface ComplianceRequirement {
  id: string;
  category: ComplianceCategory;
  region: ComplianceRegion;
  title: string;
  description: string;
  regulatoryBody: string;
  lastUpdated: Date;
  nextReviewDate: Date;
  documentationRequired: string[];
  assessmentCriteria: string[];
}

export interface ComplianceAssessment {
  id: string;
  requirementId: string;
  organizationId: string;
  facilityId?: string;
  status: ComplianceStatus;
  assessmentDate: Date;
  assessedBy: string;
  evidence: {
    documentIds: string[];
    notes: string;
    attachments: string[];
  };
  findings: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  actionItems: ComplianceActionItem[];
}

export interface ComplianceActionItem {
  id: string;
  assessmentId: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  assignedTo: string;
  dueDate: Date;
  completedDate?: Date;
  evidence?: {
    documentIds: string[];
    notes: string;
    attachments: string[];
  };
}

export interface RegulatoryUpdate {
  id: string;
  region: ComplianceRegion;
  category: ComplianceCategory;
  title: string;
  description: string;
  publishedDate: Date;
  effectiveDate: Date;
  source: string;
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  affectedRequirements: string[]; // ComplianceRequirement IDs
  documentUrl: string;
}

export interface ComplianceDocument {
  id: string;
  organizationId: string;
  facilityId?: string;
  title: string;
  type: 'POLICY' | 'PROCEDURE' | 'RECORD' | 'CERTIFICATE' | 'REPORT' | 'OTHER';
  category: ComplianceCategory;
  version: string;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ARCHIVED';
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  expiryDate?: Date;
  fileUrl: string;
  metadata: Record<string, any>;
}

export interface ComplianceAuditTrail {
  id: string;
  organizationId: string;
  facilityId?: string;
  entityType: 'REQUIREMENT' | 'ASSESSMENT' | 'ACTION_ITEM' | 'DOCUMENT';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'DOWNLOAD' | 'STATUS_CHANGE';
  performedBy: string;
  performedAt: Date;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata: Record<string, any>;
}

export interface ComplianceData {
  regulatory_body: 'CQC' | 'HIQA' | 'CI' | 'RQIA' | 'CSI'
  standards: RegionalStandards
  metrics: QualityMetrics
  monitoring: MonitoringConfig
  reports: ReportTemplate[]
}

export interface RegionalStandards {
  standards: {
    id: string
    category: string
    description: string
    requirements: string[]
    evidence_needed: string[]
    compliance_status: 'met' | 'partially_met' | 'not_met'
  }[]
  inspections: {
    date: Date
    type: 'scheduled' | 'unannounced' | 'follow-up'
    findings: {
      area: string
      rating: number
      comments: string[]
      actions_required: string[]
    }[]
  }[]
  improvements: {
    id: string
    area: string
    actions: string[]
    deadline: Date
    status: 'pending' | 'in_progress' | 'completed'
    evidence: string[]
  }[]
}

export interface QualityMetrics {
  categories: {
    name: string
    metrics: {
      id: string
      name: string
      value: number
      target: number
      trend: 'improving' | 'stable' | 'declining'
      last_updated: Date
    }[]
  }[]
  benchmarks: {
    metric_id: string
    national_average: number
    regional_average: number
    peer_average: number
  }[]
  trends: {
    metric_id: string
    period: string
    values: number[]
    analysis: {
      trend: string
      factors: string[]
      recommendations: string[]
    }
  }[]
}

export interface MonitoringConfig {
  alerts: {
    category: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    conditions: {
      metric: string
      threshold: number
      operator: '>' | '<' | '=' | '>=' | '<='
    }[]
    notifications: {
      roles: string[]
      channels: string[]
      escalation_time: number
    }
  }[]
  automated_checks: {
    id: string
    name: string
    frequency: string
    last_run: Date
    next_run: Date
    status: 'active' | 'paused' | 'error'
    dependencies: string[]
  }[]
  data_collection: {
    source: string
    frequency: string
    validation_rules: string[]
    storage_policy: {
      retention_period: number
      archival_rules: string[]
    }
  }[]
}

export interface ReportTemplate {
  id: string
  name: string
  type: 'regulatory' | 'incident' | 'quality' | 'audit'
  sections: {
    title: string
    fields: {
      name: string
      type: 'text' | 'number' | 'date' | 'select' | 'file'
      required: boolean
      validation?: string[]
    }[]
  }[]
  submission: {
    frequency: string
    deadline_type: 'fixed' | 'rolling'
    notifications: number[]
    approvers: string[]
  }
  history: {
    version: string
    date: Date
    changes: string[]
    approved_by: string
  }[]
}

export interface AccessibilityOptions {
  highContrast: boolean
  largeText: boolean
  screenReader: boolean
  reducedMotion: boolean
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  keyboardNavigation: boolean
  textToSpeech: boolean
  simplifiedView: boolean
  fontSize: number
  lineSpacing: number
  textAlignment: 'left' | 'center' | 'right'
}


