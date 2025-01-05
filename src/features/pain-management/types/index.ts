/**
 * @fileoverview Pain Management Types for Care Homes
 */

export enum PainCareLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum PainScale {
  NUMERIC = 'NUMERIC',
  WONG_BAKER = 'WONG_BAKER',
  PAINAD = 'PAINAD', // For residents with dementia
  ABBEY = 'ABBEY'    // For non-verbal residents
}

export interface PainIncident {
  id: string;
  residentId: string;
  reportedBy: string;
  reportedAt: Date;
  severity: number;
  location: string[];
  description: string;
  triggers?: string[];
  immediateActions: string[];
  requiresFollowUp: boolean;
}

export interface PainReport {
  trends: PainTrend[];
  interventionEffectiveness: InterventionEffectiveness[];
  recommendations: PainRecommendation[];
  complianceStatus: ComplianceStatus;
}

export interface PainAssessmentSchedule {
  residentId: string;
  frequency: number; // Hours
  startDate: Date;
  endDate?: Date;
  assessmentTimes: Date[];
  assignedStaff: string[];
  reviewDate: Date;
}

export interface ComplianceStatus {
  compliant: boolean;
  missingAssessments: number;
  lateAssessments: number;
  incompleteDocumentation: string[];
  regulatoryIssues: string[];
}

export interface PainRecommendation {
  type: 'ASSESSMENT' | 'INTERVENTION' | 'REFERRAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  rationale: string;
  timeframe: string;
  assignedTo?: string[];
} 