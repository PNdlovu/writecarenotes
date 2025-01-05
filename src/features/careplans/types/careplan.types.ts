/**
 * @fileoverview Care Plan type definitions
 * @version 1.2.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

export type SyncStatus = 'synced' | 'pending' | 'error';

export type CarePlanStatus = 'active' | 'archived' | 'draft' | 'under_review';

export type CarePlanType =
  | 'personal_care'
  | 'health'
  | 'social'
  | 'mental_health'
  | 'end_of_life'
  | 'nutrition'
  | 'mobility';

export interface CarePlan {
  id: string;
  residentId: string;
  careHomeId: string;
  title: string;
  description: string;
  status: CarePlanStatus;
  type: CarePlanType;
  syncStatus: SyncStatus;
  goals: CarePlanGoal[];
  reviews: CarePlanReview[];
  riskAssessments: RiskAssessment[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  metadata?: Record<string, unknown>;
  language?: string;
  region?: string;
}

export interface CarePlanGoal {
  id: string;
  carePlanId: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress?: number;
  notes?: string;
}

export interface CarePlanReview {
  id: string;
  carePlanId: string;
  reviewedBy: string;
  reviewDate: string;
  findings: string;
  recommendations?: string;
  nextReviewDate: string;
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface RiskAssessment {
  id: string;
  carePlanId: string;
  type: string;
  assessedBy: string;
  assessmentDate: string;
  riskLevel: 'low' | 'medium' | 'high';
  mitigationPlan?: string;
  nextAssessmentDate: string;
}

export interface CarePlanTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  isActive: boolean;
  language: string;
  region: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface CarePlanStats {
  total: number;
  active: number;
  archived: number;
  draft: number;
  lastUpdated: string;
}

export interface CarePlanFilters {
  status?: CarePlanStatus;
  fromDate?: string;
  toDate?: string;
  language?: string;
  region?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
  residentId?: string;
  type?: CarePlanType;
}


