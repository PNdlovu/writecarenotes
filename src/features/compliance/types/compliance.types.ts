/**
 * @writecarenotes.com
 * @fileoverview Compliance Types
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for compliance-related functionality.
 */

export enum Region {
  ENGLAND = 'ENGLAND',
  WALES = 'WALES',
  SCOTLAND = 'SCOTLAND',
  NORTHERN_IRELAND = 'NORTHERN_IRELAND',
  IRELAND = 'IRELAND'
}

export interface ComplianceAudit {
  id: string;
  organizationId: string;
  careHomeId: string;
  auditDate: Date;
  status: 'PASSED' | 'FAILED' | 'NEEDS_IMPROVEMENT';
  score: number;
  findings: ComplianceFindings[];
  evidence?: ComplianceEvidence[];
  schedule?: ComplianceSchedule[];
}

export interface ComplianceFindings {
  id: string;
  requirementId: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  evidence?: string[];
  dueDate?: Date;
  assignedTo?: string;
}

export interface ComplianceEvidence {
  id: string;
  requirementId: string;
  type: string;
  description: string;
  attachments?: string[];
  dateCollected: Date;
  collectedBy: string;
  verified?: boolean;
  verifiedBy?: string;
  verificationDate?: Date;
}

export interface ComplianceSchedule {
  id: string;
  requirementId: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  lastAuditDate?: Date;
  nextAuditDate: Date;
  assignedTo?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
}


