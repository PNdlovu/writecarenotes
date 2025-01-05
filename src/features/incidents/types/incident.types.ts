/**
 * @writecarenotes.com
 * @fileoverview Type definitions for incident management system
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Core type definitions for the incident management system including
 * enums for incident types, status, and severity levels. Contains
 * interfaces for incidents, investigations, attachments, and related
 * entities. Supports type safety across the incident management module.
 */

import { Organization } from '@/types/organization';
import { Region } from '@/types/region';

/**
 * Types of incidents supported by the system
 * @readonly
 */
export enum IncidentType {
  MEDICATION_ERROR = 'MEDICATION_ERROR',
  FALL_WITH_INJURY = 'FALL_WITH_INJURY',
  FALL_NO_INJURY = 'FALL_NO_INJURY',
  ABUSE_ALLEGATION = 'ABUSE_ALLEGATION',
  UNEXPECTED_DEATH = 'UNEXPECTED_DEATH',
  SERIOUS_INJURY = 'SERIOUS_INJURY',
  INFECTIOUS_OUTBREAK = 'INFECTIOUS_OUTBREAK',
  MISSING_PERSON = 'MISSING_PERSON',
  RESTRAINT_USE = 'RESTRAINT_USE',
  PROPERTY_DAMAGE = 'PROPERTY_DAMAGE',
  BEHAVIORAL_INCIDENT = 'BEHAVIORAL_INCIDENT',
  SECURITY_BREACH = 'SECURITY_BREACH',
  OTHER = 'OTHER'
}

/**
 * Status of an incident
 * @readonly
 */
export enum IncidentStatus {
  REPORTED = 'REPORTED',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REQUIRES_REVIEW = 'REQUIRES_REVIEW'
}

/**
 * Severity levels for incidents
 * @readonly
 */
export enum IncidentSeverity {
  CRITICAL = 'CRITICAL',
  MAJOR = 'MAJOR',
  MINOR = 'MINOR'
}

/**
 * Core incident interface
 */
export interface Incident {
  id: string;
  organizationId: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  location: string;
  dateTime: Date;
  reportedBy: {
    id: string;
    name: string;
    role: string;
  };
  involvedResidents: Array<{
    id: string;
    name: string;
  }>;
  involvedStaff: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  witnesses: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  immediateActions: string[];
  status: IncidentStatus;
  notificationsSent: boolean;
  safeguardingReferral: boolean;
  cqcReportable: boolean;
  investigation?: Investigation;
  attachments?: IncidentAttachment[];
  history: IncidentHistory[];
  region: Region;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

/**
 * Incident investigation details
 */
export interface Investigation {
  id: string;
  incidentId: string;
  investigator: {
    id: string;
    name: string;
    role: string;
  };
  findings: string[];
  rootCauses: string[];
  recommendations: string[];
  preventiveMeasures: string[];
  startDate: Date;
  completedDate?: Date;
  status: 'IN_PROGRESS' | 'COMPLETED';
  attachments?: IncidentAttachment[];
  witnesses?: Array<{
    id: string;
    name: string;
    role: string;
    statement: string;
    dateInterviewed: Date;
  }>;
}

/**
 * Incident attachment
 */
export interface IncidentAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedBy: {
    id: string;
    name: string;
  };
  uploadedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Incident history entry
 */
export interface IncidentHistory {
  id: string;
  incidentId: string;
  type: 'STATUS_CHANGE' | 'INVESTIGATION_UPDATE' | 'NOTE_ADDED' | 'ATTACHMENT_ADDED';
  description: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Incident notification
 */
export interface IncidentNotification {
  id: string;
  incidentId: string;
  type: 'CQC' | 'MANAGEMENT' | 'NOK' | 'SAFEGUARDING';
  recipient: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  sentAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Incident action item
 */
export interface IncidentActionItem {
  id: string;
  incidentId: string;
  investigationId?: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  assignedTo: {
    id: string;
    name: string;
    role: string;
  };
  dueDate: Date;
  completedDate?: Date;
  notes?: string;
}

/**
 * Incident safeguarding referral
 */
export interface SafeguardingReferral {
  id: string;
  incidentId: string;
  status: 'PENDING' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  priority: IncidentSeverity;
  submittedTo: string;
  submittedAt?: Date;
  response?: string;
  responseDate?: Date;
  notes?: string;
}

/**
 * Props for incident form component
 */
export interface IncidentFormProps {
  incident?: Incident;
  onSubmit: (data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<void>;
  onSaveDraft?: (data: Partial<Incident>) => Promise<void>;
  onCancel: () => void;
}

/**
 * Props for incident investigation component
 */
export interface InvestigationFormProps {
  incident: Incident;
  investigation?: Investigation;
  onSubmit: (data: Omit<Investigation, 'id' | 'incidentId'>) => Promise<void>;
  onSaveDraft?: (data: Partial<Investigation>) => Promise<void>;
  onCancel: () => void;
}

/**
 * Props for incident dashboard component
 */
export interface IncidentDashboardProps {
  incidents: Incident[];
  filters: IncidentFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  isLoading?: boolean;
  error?: Error;
  onCreateIncident: () => void;
  onViewIncident: (id: string) => void;
  onFilterChange: (filters: IncidentFilters) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * Incident filter options
 */
export interface IncidentFilters {
  status?: IncidentStatus[];
  severity?: IncidentSeverity[];
  type?: IncidentType[];
  timeframe?: {
    start: Date;
    end: Date;
  };
  residentId?: string;
  reportedBy?: string;
  searchTerm?: string;
  tags?: string[];
}

/**
 * Incident analytics interface
 */
export interface IncidentAnalytics {
  summary: {
    total: number;
    critical: number;
    major: number;
    minor: number;
    resolved: number;
    pending: number;
  };
  byType: Record<IncidentType, number>;
  bySeverity: Record<IncidentSeverity, number>;
  metrics: {
    averageResolutionTime: number;
    regulatoryCompliance: number;
    reportingTimeliness: number;
  };
  trends: {
    daily: Array<{ date: string; count: number }>;
    weekly: Array<{ week: string; count: number }>;
    monthly: Array<{ month: string; count: number }>;
  };
  staffInvolvement: Array<{
    role: string;
    incidentCount: number;
    resolutionRate: number;
  }>;
  residentImpact: Array<{
    category: string;
    count: number;
    severity: IncidentSeverity;
  }>;
}

/**
 * Incident report interface
 */
export interface IncidentReport {
  metadata: {
    organizationId: string;
    reportType: 'CQC' | 'OFSTED' | 'CIW' | 'CI' | 'RQIA';
    period: {
      start: Date;
      end: Date;
    };
    generatedAt: Date;
    version: string;
  };
  summary: {
    totalIncidents: number;
    notifiableIncidents: number;
    safeguardingReferrals: number;
    completedInvestigations: number;
  };
  compliance: {
    reportingTimeliness: {
      within24Hours: number;
      within48Hours: number;
      over48Hours: number;
    };
    investigationOutcomes: {
      substantiated: number;
      unsubstantiated: number;
      inconclusive: number;
    };
    correctiveActions: {
      completed: number;
      pending: number;
      overdue: number;
    };
  };
  incidents: Array<{
    id: string;
    type: IncidentType;
    severity: IncidentSeverity;
    dateTime: Date;
    location: string;
    description: string;
    immediateActions: string[];
    investigation?: {
      findings: string[];
      recommendations: string[];
    };
    regulatoryNotifications: {
      type: string;
      sentDate: Date;
      status: string;
    }[];
  }>;
  lessonLearned: {
    category: string;
    description: string;
    implementedActions: string[];
    effectiveness: string;
  }[];
}

/**
 * Archived incident interface
 */
export interface ArchivedIncident {
  id: string;
  originalId: string;
  organizationId: string;
  archivedData: string; // Encrypted data
  archivalDate: Date;
  retentionPeriod: '7_YEARS' | '10_YEARS' | 'PERMANENT';
  metadata?: {
    type: IncidentType;
    severity: IncidentSeverity;
    dateTime: Date;
    archivalReason: string;
  };
}

/**
 * Risk assessment interface
 */
export interface IncidentRiskAssessment {
  id: string;
  incidentId: string;
  likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  mitigationMeasures: string[];
  assessedBy: {
    id: string;
    name: string;
    role: string;
  };
  reviewDate: Date;
  status: 'ACTIVE' | 'ARCHIVED';
  lastReviewedAt?: Date;
  nextReviewDate?: Date;
  history?: Array<{
    date: Date;
    previousScore: string;
    newScore: string;
    reason: string;
  }>;
}

/**
 * Workflow configuration interface
 */
export interface IncidentWorkflow {
  id: string;
  organizationId: string;
  type: IncidentType;
  config: {
    steps: Array<{
      name: string;
      order: number;
      requiredActions: string[];
      autoNotifications?: boolean;
      escalationRules?: {
        condition: string;
        action: string;
      }[];
    }>;
    autoAssignment?: {
      roles: string[];
      roundRobin?: boolean;
    };
    slaConfig?: {
      responseTime: number;
      resolutionTime: number;
      escalationLevels: number;
    };
  };
  version: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
}

/**
 * External system integration interface
 */
export interface ExternalIntegration {
  id: string;
  organizationId: string;
  system: 'NHS' | 'SOCIAL_SERVICES' | 'PUBLIC_HEALTH' | 'LOCAL_AUTHORITY';
  config: {
    apiKey: string; // Encrypted
    endpoint: string;
    syncDirection: 'PUSH' | 'PULL' | 'BIDIRECTIONAL';
    filters?: {
      types?: IncidentType[];
      severity?: IncidentSeverity[];
      dateRange?: {
        start: Date;
        end: Date;
      };
    };
    mappings?: Record<string, string>; // Field mappings
    transformations?: Record<string, string>; // Data transformations
  };
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  lastSync?: Date;
  lastError?: string;
  metadata?: {
    successfulSyncs: number;
    failedSyncs: number;
    lastSyncDuration: number;
  };
}

/**
 * Batch operation result interface
 */
export interface BatchOperationResult {
  succeeded: string[];
  failed: Array<{
    id: string;
    error: string;
    details?: any;
  }>;
  metadata: {
    totalOperations: number;
    successRate: number;
    duration: number;
    timestamp: Date;
  };
}


