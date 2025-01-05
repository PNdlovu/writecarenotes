// src/features/carehome/types/compliance.ts

export enum Region {
  UK = 'UK',
  IRELAND = 'IRELAND',
  SCOTLAND = 'SCOTLAND',
  WALES = 'WALES',
  NORTHERN_IRELAND = 'NORTHERN_IRELAND'
}

export type RegulatoryBody = 
  | 'CQC'           // Care Quality Commission (England)
  | 'CIW'           // Care Inspectorate Wales
  | 'CI'            // Care Inspectorate (Scotland)
  | 'RQIA'          // Regulation and Quality Improvement Authority (Northern Ireland)
  | 'HIQA'          // Health Information and Quality Authority (Ireland)
  | 'OTHER';

export type InspectionRating = 
  | 'OUTSTANDING'   // CQC
  | 'GOOD'          // CQC
  | 'REQUIRES_IMPROVEMENT' // CQC
  | 'INADEQUATE'    // CQC
  | 'EXCELLENT'     // CI/CIW
  | 'VERY_GOOD'     // CI
  | 'GOOD'          // CI/CIW
  | 'ADEQUATE'      // CI/CIW
  | 'POOR'          // CI/CIW
  | 'UNSATISFACTORY'; // CI/CIW

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  PARTIALLY_COMPLIANT = 'PARTIALLY_COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  UNDER_REVIEW = 'UNDER_REVIEW'
}

export interface RegionalRegulation {
  id: string;
  region: Region;
  code: string;
  description: string;
  requirements: RegulationRequirement[];
  lastUpdated: Date;
}

export interface RegulationRequirement {
  id: string;
  category: string;
  description: string;
  minimumStandard: string;
  evidenceRequired: string[];
  applicableRoles: string[];
}

export interface ComplianceReport {
  careHomeId: string;
  region: Region;
  timestamp: Date;
  overallStatus: ComplianceStatus;
  regulations: RegulationCompliance[];
  recommendations: string[];
  criticalIssues: string[];
  nextReviewDate: Date;
}

export interface RegulationCompliance {
  regulationId: string;
  status: ComplianceStatus;
  evidence: ComplianceEvidence[];
  gaps: string[];
  actionRequired: boolean;
  dueDate?: Date;
}

export interface ComplianceEvidence {
  type: string;
  description: string;
  documentRefs: string[];
  verifiedBy: string;
  verifiedDate: Date;
}

export interface ComplianceTraining {
  id: string;
  title: string;
  description: string;
  category: string;
  required: boolean;
  frequency: 'ONCE' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  validityPeriod: number;
  providers: string[];
  certificationRequired: boolean;
}

export interface InspectionReport {
  id: string;
  date: Date;
  regulatoryBody: RegulatoryBody;
  overallRating: InspectionRating;
  categoryRatings: Record<string, InspectionRating>;
  findings: Array<{
    category: string;
    observation: string;
    recommendation: string;
    actionRequired: boolean;
    deadline?: Date;
  }>;
  inspector: {
    name: string;
    badge: string;
    contact: string;
  };
  documents: string[];
  followUpDate?: Date;
}


