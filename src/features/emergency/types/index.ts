import { CareHome, Resident, Staff } from '@prisma/client';

export type EmergencyType = 
  | 'MEDICAL'
  | 'MEDICATION'
  | 'FIRE'
  | 'SECURITY'
  | 'NATURAL_DISASTER'
  | 'INFRASTRUCTURE'
  | 'OTHER';

export type EmergencyStatus =
  | 'ACTIVE'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'ARCHIVED';

export type EmergencySeverity =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export type EmergencyProtocol = {
  id: string;
  type: EmergencyType;
  title: string;
  description: string;
  steps: EmergencyStep[];
  requiredRoles: string[];
  autoNotify: string[];
  escalationPath: string[];
  reviewFrequency: number; // in days
  lastReviewed: Date;
  nextReview: Date;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type EmergencyStep = {
  id: string;
  order: number;
  title: string;
  description: string;
  isRequired: boolean;
  timeLimit?: number; // in minutes
  assignedTo?: string[];
  dependencies?: string[]; // IDs of steps that must be completed first
  verificationRequired: boolean;
  completionCriteria?: string[];
};

export type EmergencyIncident = {
  id: string;
  type: EmergencyType;
  status: EmergencyStatus;
  severity: EmergencySeverity;
  title: string;
  description: string;
  location: string;
  careHomeId: string;
  careHome?: CareHome;
  protocolId?: string;
  protocol?: EmergencyProtocol;
  affectedResidents: string[];
  residents?: Resident[];
  responders: string[];
  staff?: Staff[];
  timeline: EmergencyAction[];
  currentStep?: number;
  startedAt: Date;
  resolvedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type EmergencyAction = {
  id: string;
  incidentId: string;
  type: string;
  description: string;
  performedBy: string;
  performedAt: Date;
  status: 'COMPLETED' | 'FAILED' | 'SKIPPED';
  notes?: string;
  attachments?: string[];
  metadata?: Record<string, any>;
};

export type EmergencyNotification = {
  id: string;
  incidentId: string;
  type: 'SMS' | 'EMAIL' | 'PUSH' | 'SYSTEM';
  recipient: string;
  message: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  status: 'PENDING' | 'SENT' | 'FAILED' | 'RECEIVED' | 'READ';
  sentAt?: Date;
  readAt?: Date;
  metadata?: Record<string, any>;
};

export type EmergencyAccess = {
  id: string;
  incidentId: string;
  grantedTo: string;
  grantedBy: string;
  accessType: 'FULL' | 'LIMITED' | 'READ_ONLY';
  resources: string[];
  reason: string;
  expiresAt: Date;
  revokedAt?: Date;
  revokedBy?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type EmergencyReport = {
  id: string;
  incidentId: string;
  type: 'INITIAL' | 'PROGRESS' | 'FINAL' | 'REVIEW';
  author: string;
  content: string;
  attachments?: string[];
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'APPROVED';
  metadata?: Record<string, any>;
};

export interface EmergencyDashboardFilters {
  type?: EmergencyType[];
  status?: EmergencyStatus[];
  severity?: EmergencySeverity[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: string[];
  responders?: string[];
}
