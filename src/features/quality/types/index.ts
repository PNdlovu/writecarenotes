/**
 * WriteCareNotes.com
 * @fileoverview Quality Feature Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

export interface QualityAudit {
  id: string;
  careHomeId: string;
  type: AuditType;
  status: AuditStatus;
  scheduledDate: string;
  completedDate?: string;
  auditor: {
    id: string;
    name: string;
    role: string;
  };
  sections: AuditSection[];
  overallScore?: number;
  recommendations?: string[];
  actionPlan?: ActionPlan;
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    version: number;
  };
}

export type AuditType = 
  | 'CARE_QUALITY'
  | 'MEDICATION'
  | 'INFECTION_CONTROL'
  | 'HEALTH_SAFETY'
  | 'DOCUMENTATION'
  | 'STAFF_TRAINING'
  | 'RESIDENT_FEEDBACK'
  | 'ENVIRONMENTAL';

export type AuditStatus = 
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'CANCELLED';

export interface AuditSection {
  id: string;
  title: string;
  criteria: AuditCriterion[];
  score?: number;
  notes?: string;
}

export interface AuditCriterion {
  id: string;
  description: string;
  evidence?: string;
  compliance: ComplianceLevel;
  impact: ImpactLevel;
  notes?: string;
}

export type ComplianceLevel = 
  | 'COMPLIANT'
  | 'PARTIAL'
  | 'NON_COMPLIANT'
  | 'NOT_APPLICABLE';

export type ImpactLevel = 
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export interface ActionPlan {
  id: string;
  actions: Action[];
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  reviewDate: string;
}

export interface Action {
  id: string;
  description: string;
  assignedTo: {
    id: string;
    name: string;
    role: string;
  };
  dueDate: string;
  status: ActionStatus;
  priority: ImpactLevel;
  progress?: number;
  notes?: string;
}

export type ActionStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'BLOCKED';

export interface QualityFilter {
  careHomeId?: string;
  type?: AuditType;
  status?: AuditStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  auditorId?: string;
  complianceLevel?: ComplianceLevel;
}

export interface QualityStats {
  totalAudits: number;
  byType: Record<AuditType, number>;
  byStatus: Record<AuditStatus, number>;
  averageScore: number;
  criticalFindings: number;
  overallCompliance: number; // percentage
  actionCompletion: number; // percentage
  trendsLastMonth: {
    improvement: number;
    decline: number;
    unchanged: number;
  };
}
