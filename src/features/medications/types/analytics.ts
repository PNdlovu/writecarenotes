/**
 * @writecarenotes.com
 * @fileoverview Enterprise medication analytics types
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for enterprise-grade medication analytics.
 * Includes compliance, safety, operational, and cost metrics.
 */

export interface MedicationAnalytics {
  compliance: ComplianceMetrics;
  safety: SafetyMetrics;
  operational: OperationalMetrics;
  cost: CostMetrics;
  predictive: PredictiveInsights;
}

export interface ComplianceMetrics {
  administrationCompliance: number;
  stockCompliance: number;
  controlledDrugsCompliance: number;
  documentationCompliance: number;
  overallScore: number;
  details?: {
    missedDoses: number;
    lateAdministrations: number;
    stockDiscrepancies: number;
    documentationErrors: number;
  };
}

export interface SafetyMetrics {
  medicationErrors: MedicationError[];
  nearMisses: NearMiss[];
  adverseEvents: AdverseEvent[];
  interventions: Intervention[];
  riskScore: number;
  trends?: {
    errorRate: number;
    severityDistribution: Record<string, number>;
    commonCauses: string[];
  };
}

export interface OperationalMetrics {
  stockEfficiency: {
    turnoverRate: number;
    stockoutRate: number;
    expiryRate: number;
    orderingAccuracy: number;
  };
  administrationTiming: {
    onTimeRate: number;
    averageDelay: number;
    peakTimes: string[];
  };
  staffUtilization: {
    efficiency: number;
    workload: number;
    competencyLevels: Record<string, number>;
  };
  orderingEfficiency: {
    accuracy: number;
    leadTime: number;
    costEfficiency: number;
  };
  overallEfficiency: number;
}

export interface CostMetrics {
  medicationCosts: {
    total: number;
    byCategory: Record<string, number>;
    trends: CostTrend[];
  };
  wastage: {
    amount: number;
    causes: Record<string, number>;
    preventableCost: number;
  };
  staffingCosts: {
    administration: number;
    training: number;
    overtime: number;
  };
  supplierPerformance: {
    reliability: number;
    costEfficiency: number;
    qualityScore: number;
  };
  costEfficiency: number;
}

export interface PredictiveInsights {
  stockPredictions: {
    expectedDemand: number;
    recommendedOrder: number;
    confidenceLevel: number;
  };
  riskPredictions: {
    errorLikelihood: number;
    highRiskAreas: string[];
    recommendedActions: string[];
  };
  costPredictions: {
    projectedCosts: number;
    savingsOpportunities: SavingsOpportunity[];
    budgetRecommendations: string[];
  };
  compliancePredictions: {
    riskAreas: string[];
    recommendedControls: string[];
    expectedScore: number;
  };
}

export interface MedicationError {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  medication: string;
  resident: string;
  staff: string;
  date: string;
  contributingFactors: string[];
  actions: string[];
  status: 'REPORTED' | 'INVESTIGATING' | 'RESOLVED';
}

export interface NearMiss {
  id: string;
  type: string;
  potentialSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  preventiveMeasures: string[];
  reportedBy: string;
  date: string;
}

export interface AdverseEvent {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  medication: string;
  resident: string;
  outcome: string;
  interventions: string[];
  followUp: string[];
  date: string;
}

export interface Intervention {
  id: string;
  type: string;
  reason: string;
  description: string;
  medication: string;
  resident: string;
  staff: string;
  outcome: string;
  date: string;
}

export interface CostTrend {
  period: string;
  amount: number;
  change: number;
  factors: string[];
}

export interface SavingsOpportunity {
  area: string;
  potentialSavings: number;
  implementation: string;
  timeframe: string;
  roi: number;
}

export type TimeFrame = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type MetricTrend = {
  value: number;
  change: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  period: TimeFrame;
};


