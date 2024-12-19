import { Region } from '@/types/region'
import { CareHomeType } from '@/features/carehome/types/care'

export enum AccessLevel {
    NONE = 'NONE',
    READ = 'READ',
    WRITE = 'WRITE',
    APPROVE = 'APPROVE',
    ADMIN = 'ADMIN'
}

export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ORG_ADMIN = 'ORG_ADMIN',
    CARE_HOME_MANAGER = 'CARE_HOME_MANAGER',
    CLINICAL_LEAD = 'CLINICAL_LEAD',
    NURSE = 'NURSE',
    CARE_WORKER = 'CARE_WORKER',
    SPECIALIST = 'SPECIALIST',
    FAMILY_MEMBER = 'FAMILY_MEMBER',
    RESIDENT = 'RESIDENT',
    EXTERNAL_HEALTHCARE = 'EXTERNAL_HEALTHCARE',
    REGULATOR = 'REGULATOR'
}

export enum ResourceType {
    CARE_PLAN = 'CARE_PLAN',
    MEDICAL_RECORD = 'MEDICAL_RECORD',
    INCIDENT_REPORT = 'INCIDENT_REPORT',
    ASSESSMENT = 'ASSESSMENT',
    MEDICATION = 'MEDICATION',
    STAFF_RECORD = 'STAFF_RECORD',
    RESIDENT_RECORD = 'RESIDENT_RECORD',
    CARE_HOME = 'CARE_HOME',
    ORGANIZATION = 'ORGANIZATION'
}

export enum PermissionAction {
    VIEW = 'VIEW',
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    APPROVE = 'APPROVE',
    EXPORT = 'EXPORT',
    SHARE = 'SHARE',
    AUDIT = 'AUDIT'
}

export enum JurisdictionType {
  NHS = 'NHS',
  HSE = 'HSE',
  NHS_SCOTLAND = 'NHS_SCOTLAND',
  NHS_WALES = 'NHS_WALES'
}

export enum ComplianceFramework {
  NHS_DSPT = 'NHS_DSPT',
  UK_GDPR = 'UK_GDPR',
  HSE_ISP = 'HSE_ISP',
  NHS_SCOTLAND_ISF = 'NHS_SCOTLAND_ISF',
  NHS_WALES = 'NHS_WALES',
  ISO_27001 = 'ISO_27001',
  ISO_27701 = 'ISO_27701',
  OFSTED = 'OFSTED'
}

export enum DataClassification {
  OFFICIAL = 'OFFICIAL',
  OFFICIAL_SENSITIVE = 'OFFICIAL_SENSITIVE',
  SECRET = 'SECRET',
  TOP_SECRET = 'TOP_SECRET'
}

export enum SecurityLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum CareHomeRegulation {
  SAFE = 'SAFE',
  EFFECTIVE = 'EFFECTIVE',
  CARING = 'CARING',
  RESPONSIVE = 'RESPONSIVE',
  WELL_LED = 'WELL_LED'
}

export enum CareHomeInspectionArea {
  CARE_QUALITY = 'CARE_QUALITY',
  MEDICATION_MANAGEMENT = 'MEDICATION_MANAGEMENT',
  SAFEGUARDING = 'SAFEGUARDING',
  STAFF_MANAGEMENT = 'STAFF_MANAGEMENT',
  HEALTH_SAFETY = 'HEALTH_SAFETY',
  RESIDENT_WELLBEING = 'RESIDENT_WELLBEING',
  NUTRITION_HYDRATION = 'NUTRITION_HYDRATION',
  INFECTION_CONTROL = 'INFECTION_CONTROL'
}

export enum SafeguardingRequirement {
  STAFF_CHECKS = 'STAFF_CHECKS',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  INCIDENT_REPORTING = 'INCIDENT_REPORTING',
  RESIDENT_PROTECTION = 'RESIDENT_PROTECTION',
  MEDICATION_SAFETY = 'MEDICATION_SAFETY',
  CARE_PLANNING = 'CARE_PLANNING'
}

export interface AccessPolicy {
    id: string
    name: string
    description: string
    roles: Role[]
    resources: ResourceType[]
    actions: PermissionAction[]
    conditions?: AccessCondition[]
    priority: number
    isActive: boolean
    organizationId?: string
    careHomeId?: string
    region?: Region
    createdAt: Date
    updatedAt: Date
    version: number
}

export interface AccessCondition {
    attribute: string
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex'
    value: string | number | boolean
    context?: 'user' | 'resource' | 'environment'
}

export interface AccessRequest {
    userId: string
    userRoles: Role[]
    resourceType: ResourceType
    resourceId: string
    action: PermissionAction
    context: AccessContext
}

export interface AccessContext {
    organizationId: string
    careHomeId?: string
    region: Region
    careHomeType?: CareHomeType
    timestamp: Date
    emergency?: boolean
    deviceType?: string
    location?: {
        ip: string
        country: string
    }
}

export interface AccessDecision {
    granted: boolean
    policy?: string
    reason?: string
    conditions?: AccessCondition[]
    expires?: Date
    audit: {
        id: string
        timestamp: Date
        requestId: string
    }
}

export interface EmergencyAccess {
    id: string
    userId: string
    resourceType: ResourceType
    resourceId: string
    reason: string
    approvedBy?: string
    startTime: Date
    endTime: Date
    isActive: boolean
    auditTrail: EmergencyAccessAudit[]
}

export interface EmergencyAccessAudit {
    id: string
    emergencyAccessId: string
    action: 'GRANT' | 'REVOKE' | 'USE' | 'EXTEND'
    performedBy: string
    timestamp: Date
    details: string
}

export interface AccessAudit {
    id: string
    timestamp: Date
    userId: string
    userRoles: Role[]
    resourceType: ResourceType
    resourceId: string
    action: PermissionAction
    decision: boolean
    policyId?: string
    reason?: string
    context: AccessContext
    changes?: {
        before: any
        after: any
    }
}

export interface TenantConfig {
    id: string;
    name: string;
    settings: {
        maxEmergencyDuration: number;
        requireApproval: boolean;
        allowedApprovers: Role[];
        customPolicies: boolean;
        ipWhitelist?: string[];
        mfaRequired: boolean;
    };
    compliance: {
        dataRetention: number;
        auditFrequency: number;
        requiredApprovals: number;
    };
}

export interface EmergencyAccessWorkflow {
    id: string;
    emergencyAccessId: string;
    requiredApprovals: number;
    approvers: Array<{
        userId: string;
        role: Role;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
        timestamp?: Date;
        reason?: string;
    }>;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    expiresAt: Date;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    notifications: {
        channels: ('EMAIL' | 'SMS' | 'SLACK')[];
        escalation: boolean;
        lastNotified?: Date;
        escalationLevel: number;
    };
    postAccessReview: boolean;
    reviewCompleted?: boolean;
    reviewNotes?: string;
}

export interface ComplianceControl {
    id: string;
    framework: ComplianceFramework;
    controlId: string;        // e.g., "A.9.2.3" for ISO 27001
    category: string;         // e.g., "Access Control"
    subCategory?: string;     // e.g., "User Access Management"
    title: string;
    description: string;
    requirements: string[];
    implementationGuidance?: string;
    relatedControls?: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    applicability: {
        scope: ('ORGANIZATION' | 'SYSTEM' | 'DATA')[];
        exceptions?: string[];
    };
}

export interface ComplianceEvidence {
    id: string;
    controlId: string;
    timestamp: Date;
    type: 'POLICY' | 'PROCEDURE' | 'RECORD' | 'LOG' | 'AUDIT' | 'REVIEW';
    content: string;
    metadata: {
        source: string;
        collector: string;
        version?: string;
        relatedAssets?: string[];
    };
    attachments?: Array<{
        name: string;
        type: string;
        url: string;
        hash: string;
    }>;
    status: 'COLLECTED' | 'VALIDATED' | 'REJECTED';
    validatedBy?: string;
    validatedAt?: Date;
}

export interface ComplianceReport {
    id: string;
    frameworks: ComplianceFramework[];
    period: {
        start: Date;
        end: Date;
    };
    scope: {
        organizational: string[];
        systems: string[];
        locations: string[];
        exclusions?: string[];
    };
    summary: {
        overallCompliance: number;
        criticalFindings: number;
        majorFindings: number;
        minorFindings: number;
        improvements: number;
    };
    controls: Array<{
        controlId: string;
        status: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';
        evidence: string[];
        findings?: Array<{
            type: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'IMPROVEMENT';
            description: string;
            risk: string;
            recommendation: string;
            dueDate?: Date;
        }>;
        implementationStatus?: {
            status: 'NOT_STARTED' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'VERIFIED';
            progress: number;
            notes?: string;
        };
    }>;
    attestation?: {
        assessor: string;
        date: Date;
        signature: string;
        notes?: string;
    };
    status: 'DRAFT' | 'REVIEW' | 'FINAL';
    reviewedBy?: string;
    approvedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    nextReviewDate: Date;
}

export interface RiskAssessment {
    id: string;
    controlId: string;
    assessmentDate: Date;
    assessor: string;
    threat: {
        description: string;
        likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
        impact: 'LOW' | 'MEDIUM' | 'HIGH';
    };
    vulnerabilities: Array<{
        description: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH';
        exploitability: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
    existingControls: Array<{
        controlId: string;
        effectiveness: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
    residualRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    treatment: {
        decision: 'ACCEPT' | 'MITIGATE' | 'TRANSFER' | 'AVOID';
        plan?: string;
        owner?: string;
        dueDate?: Date;
    };
    review: {
        frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
        nextReviewDate: Date;
        lastReviewedBy?: string;
        lastReviewDate?: Date;
    };
}

export interface MonitoringAlert {
    id: string;
    type: 'UNUSUAL_ACCESS' | 'POLICY_VIOLATION' | 'GEO_ANOMALY' | 'EMERGENCY_ACCESS';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    timestamp: Date;
    details: {
        userId?: string;
        resourceType?: ResourceType;
        resourceId?: string;
        location?: {
            ip: string;
            country: string;
            city?: string;
        };
        policyId?: string;
        description: string;
    };
    status: 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
    assignedTo?: string;
    resolution?: {
        action: string;
        notes: string;
        timestamp: Date;
        by: string;
    };
}

export interface AuditEvent {
  userId?: string;
  dataId: string;
  action: string;
  reason: string;
  metadata?: {
    jurisdiction?: JurisdictionType;
    complianceFramework?: ComplianceFramework;
    [key: string]: any;
  };
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  content: string;
  version: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'ARCHIVED';
  jurisdiction: JurisdictionType;
  complianceFrameworks: ComplianceFramework[];
  riskLevel: SecurityLevel;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface PolicyVersion {
  id: string;
  policyId: string;
  version: number;
  content: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface PolicyApproval {
  id: string;
  policyId: string;
  approverId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  createdAt: Date;
  approvedAt?: Date;
}

export interface PolicyDistribution {
  id: string;
  policyId: string;
  userId: string;
  status: 'PENDING' | 'ACKNOWLEDGED';
  distributedAt: Date;
  acknowledgedAt?: Date;
}

export interface HealthcareDataAccess {
  id: string;
  userId: string;
  dataId: string;
  accessType: string;
  purpose: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface SecurityIncident {
  id: string;
  type: string;
  severity: SecurityLevel;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string;
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

export interface CareHomeCompliance {
  id: string;
  setting: {
    type: 'CHILDRENS_HOME' | 'RESIDENTIAL_HOME';
    registrationNumber: string;
    registrationDate: Date;
    capacity: number;
    currentOccupancy: number;
  };
  inspectionAreas: {
    area: CareHomeInspectionArea;
    lastInspection?: Date;
    rating?: 'OUTSTANDING' | 'GOOD' | 'REQUIRES_IMPROVEMENT' | 'INADEQUATE';
    evidence: string[];
    improvements: string[];
    actionPlan?: string;
  }[];
  safeguarding: {
    requirement: SafeguardingRequirement;
    status: 'COMPLIANT' | 'NON_COMPLIANT' | 'IN_PROGRESS';
    lastReview: Date;
    nextReview: Date;
    evidence: string[];
    incidents?: {
      date: Date;
      type: string;
      description: string;
      action: string;
      status: 'OPEN' | 'CLOSED' | 'UNDER_REVIEW';
    }[];
  }[];
  staffing: {
    dbs: {
      status: 'VALID' | 'EXPIRED' | 'PENDING';
      lastCheck: Date;
      nextCheck: Date;
      enhanced: boolean;
      barredListCheck: boolean;
    };
    qualifications: {
      type: string;
      level: string;
      verified: boolean;
      verificationDate?: Date;
      expiryDate?: Date;
    }[];
    training: {
      type: string;
      completionDate: Date;
      expiryDate?: Date;
      status: 'VALID' | 'EXPIRED' | 'DUE';
      mandatory: boolean;
    }[];
    shifts: {
      type: 'DAY' | 'NIGHT';
      minimumStaff: number;
      currentStaff: number;
    }[];
  }[];
  careQuality: {
    carePlans: {
      upToDate: boolean;
      lastReview: Date;
      nextReview: Date;
      personCentered: boolean;
    };
    medications: {
      storage: 'COMPLIANT' | 'NON_COMPLIANT';
      administration: 'COMPLIANT' | 'NON_COMPLIANT';
      lastAudit: Date;
      issues: string[];
    };
    residentFeedback: {
      lastSurvey: Date;
      satisfaction: number;
      issues: string[];
      actions: string[];
    };
  };
  policies: {
    type: string;
    version: string;
    lastReview: Date;
    nextReview: Date;
    status: 'CURRENT' | 'NEEDS_REVIEW' | 'UPDATING';
    mandatoryStaffRead: boolean;
    staffConfirmations: {
      staffId: string;
      readDate: Date;
      confirmed: boolean;
    }[];
  }[];
}
