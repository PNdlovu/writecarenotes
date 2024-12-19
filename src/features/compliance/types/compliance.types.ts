export type Region = 'UK' | 'US' | 'AU' | 'CA';

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  region: Region;
  requirements: ComplianceRequirement[];
  lastUpdated: Date;
}

export interface ComplianceRequirement {
  id: string;
  code: string;
  category: string;
  description: string;
  guidance: string;
  evidenceRequired: string[];
  applicableRoles: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ComplianceEvidence {
  id: string;
  requirementId: string;
  type: string;
  content: string;
  uploadedBy: string;
  uploadedAt: Date;
  validUntil?: Date;
  metadata: Record<string, any>;
}

export interface ComplianceAudit {
  id: string;
  frameworkId: string;
  organizationId: string;
  careHomeId: string;
  auditedBy: string;
  auditDate: Date;
  findings: ComplianceFinding[];
  score: number;
  nextAuditDue: Date;
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'APPROVED';
}

export interface ComplianceFinding {
  id: string;
  requirementId: string;
  status: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT';
  evidence: string[];
  notes: string;
  actionRequired: boolean;
  actionPlan?: ComplianceAction;
}

export interface ComplianceAction {
  id: string;
  findingId: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  completedAt?: Date;
  completedBy?: string;
}

export interface ComplianceSchedule {
  id: string;
  organizationId: string;
  careHomeId: string;
  frameworkId: string;
  frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  lastAuditDate?: Date;
  nextAuditDue: Date;
  assignedTo: string[];
  status: 'ACTIVE' | 'PAUSED';
}


