/**
 * Types for Medication Analytics
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type InteractionSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export type InteractionType = 
  | 'DRUG_DRUG' 
  | 'TIMING_CONFLICT' 
  | 'CUMULATIVE_EFFECT' 
  | 'CONTRAINDICATION';

export interface DrugInteraction {
  medications: string[];
  type: InteractionType;
  severity: InteractionSeverity;
  description: string;
  recommendations: string[];
  evidenceLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  references?: string[];
}

export interface TrendData {
  // Medication Trends
  totalMedications?: number;
  activeRegularMedications?: number;
  activePRNMedications?: number;
  recentChanges?: number;
  complianceRate?: number;

  // Administration Trends
  totalAdministrations?: number;
  onTimeRate?: number;
  missedRate?: number;
  refusedRate?: number;
  lateAdministrations?: number;

  // Missed Dose Analysis
  totalMissed?: number;
  criticalMissed?: number;
  patterns?: string[];
  impactScore?: number;
}

export interface MedicationAnalytics {
  medications: TrendData;
  administrations: TrendData;
  missedDoses: TrendData;
  interactions: DrugInteraction[];
  riskLevel: RiskLevel;
}

export interface AnalyticsTimeframe {
  start: Date;
  end: Date;
  period: '7d' | '30d' | '90d' | 'custom';
}

export interface StaffPerformanceMetrics {
  staffId: string;
  administrationCount: number;
  onTimeRate: number;
  errorRate: number;
  documentationQuality: number;
  trainingStatus: {
    lastTraining: Date;
    certifications: string[];
    expiringCertifications: string[];
  };
}

export interface QualityMetrics {
  errorRate: number;
  nearMissRate: number;
  interventionRate: number;
  documentationCompliance: number;
  stockAccuracy: number;
  auditFindings: {
    date: Date;
    type: string;
    findings: string[];
    actionItems: string[];
  }[];
}

export interface CostAnalytics {
  totalCost: number;
  costPerResident: number;
  wastage: {
    amount: number;
    reasons: {
      reason: string;
      count: number;
      cost: number;
    }[];
  };
  savings: {
    actual: number;
    potential: number;
    recommendations: string[];
  };
}

export interface RegionalCompliance {
  region: string;
  careHomeType: string;
  complianceRate: number;
  violations: {
    type: string;
    description: string;
    severity: RiskLevel;
    actionRequired: string;
    dueDate: Date;
  }[];
  upcomingDeadlines: {
    requirement: string;
    dueDate: Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  }[];
}

export interface AIInsights {
  riskPredictions: {
    resident: string;
    riskLevel: RiskLevel;
    factors: string[];
    recommendations: string[];
  }[];
  optimizationSuggestions: {
    type: string;
    description: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    implementation: string[];
  }[];
  patterns: {
    type: string;
    description: string;
    confidence: number;
    supportingData: any;
  }[];
}


