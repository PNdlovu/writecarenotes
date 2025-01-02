/**
 * @fileoverview Health Scoring System
 * @version 1.0.0
 * @created 2024-03-21
 */

import { METRIC_TYPES } from './types';

export interface HealthMetric {
  name: string;
  value: number;
  threshold: number;
  weight: number;
}

export interface ComponentHealth {
  component: string;
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  metrics: HealthMetric[];
  lastUpdated: number;
}

export interface HealthTrend {
  timestamp: number;
  score: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface HealthThresholds {
  warning: number;
  critical: number;
}

const COMPONENT_THRESHOLDS: Record<string, HealthThresholds> = {
  residents: { warning: 85, critical: 75 },
  staff: { warning: 90, critical: 80 },
  medication: { warning: 95, critical: 90 },
  clinical: { warning: 90, critical: 80 },
  compliance: { warning: 95, critical: 90 },
  financial: { warning: 85, critical: 75 },
  environment: { warning: 90, critical: 80 },
  quality: { warning: 90, critical: 80 },
  service: { warning: 90, critical: 80 }
};

const METRIC_WEIGHTS: Record<string, number> = {
  // Resident Metrics
  [METRIC_TYPES.CARE_HOME.RESIDENTS_OCCUPANCY]: 0.15,
  [METRIC_TYPES.CARE_HOME.RESIDENTS_INCIDENTS]: 0.15,
  [METRIC_TYPES.CARE_HOME.RESIDENTS_SATISFACTION]: 0.1,
  [METRIC_TYPES.CARE_HOME.RESIDENTS_WELLBEING]: 0.1,
  [METRIC_TYPES.CARE_HOME.RESIDENTS_ACTIVITIES]: 0.1,
  [METRIC_TYPES.CARE_HOME.RESIDENTS_NUTRITION]: 0.1,
  [METRIC_TYPES.CARE_HOME.RESIDENTS_HYDRATION]: 0.1,
  [METRIC_TYPES.CARE_HOME.RESIDENTS_MOBILITY]: 0.1,
  [METRIC_TYPES.CARE_HOME.RESIDENTS_SOCIAL]: 0.05,
  [METRIC_TYPES.CARE_HOME.RESIDENTS_MENTAL_HEALTH]: 0.05,

  // Staff Metrics
  [METRIC_TYPES.CARE_HOME.STAFF_TO_RESIDENT_RATIO]: 0.15,
  [METRIC_TYPES.CARE_HOME.STAFF_TRAINING_COMPLIANCE]: 0.15,
  [METRIC_TYPES.CARE_HOME.STAFF_TURNOVER]: 0.1,
  [METRIC_TYPES.CARE_HOME.STAFF_SATISFACTION]: 0.1,
  [METRIC_TYPES.CARE_HOME.STAFF_ATTENDANCE]: 0.1,
  [METRIC_TYPES.CARE_HOME.STAFF_PERFORMANCE]: 0.1,
  [METRIC_TYPES.CARE_HOME.STAFF_QUALIFICATIONS]: 0.1,
  [METRIC_TYPES.CARE_HOME.STAFF_DEVELOPMENT]: 0.1,
  [METRIC_TYPES.CARE_HOME.STAFF_SUPERVISION]: 0.05,
  [METRIC_TYPES.CARE_HOME.STAFF_WORKLOAD]: 0.05,

  // Medication Metrics
  [METRIC_TYPES.CARE_HOME.MEDICATION_ERRORS]: 0.15,
  [METRIC_TYPES.CARE_HOME.MEDICATION_STOCK_LEVELS]: 0.15,
  [METRIC_TYPES.CARE_HOME.MEDICATION_COMPLIANCE]: 0.1,
  [METRIC_TYPES.CARE_HOME.MEDICATION_REVIEWS]: 0.1,
  [METRIC_TYPES.CARE_HOME.MEDICATION_STORAGE]: 0.1,
  [METRIC_TYPES.CARE_HOME.MEDICATION_DISPOSAL]: 0.1,
  [METRIC_TYPES.CARE_HOME.MEDICATION_ADMINISTRATION]: 0.1,
  [METRIC_TYPES.CARE_HOME.MEDICATION_DOCUMENTATION]: 0.1,
  [METRIC_TYPES.CARE_HOME.MEDICATION_TRAINING]: 0.05,
  [METRIC_TYPES.CARE_HOME.MEDICATION_AUDITS]: 0.05,

  // Clinical Metrics
  [METRIC_TYPES.CARE_HOME.FALLS_INCIDENTS]: 0.15,
  [METRIC_TYPES.CARE_HOME.PRESSURE_ULCERS]: 0.15,
  [METRIC_TYPES.CARE_HOME.INFECTIONS]: 0.1,
  [METRIC_TYPES.CARE_HOME.HOSPITAL_ADMISSIONS]: 0.1,
  [METRIC_TYPES.CARE_HOME.CLINICAL_ASSESSMENTS]: 0.1,
  [METRIC_TYPES.CARE_HOME.CLINICAL_INTERVENTIONS]: 0.1,
  [METRIC_TYPES.CARE_HOME.CLINICAL_OUTCOMES]: 0.1,
  [METRIC_TYPES.CARE_HOME.CLINICAL_DOCUMENTATION]: 0.1,
  [METRIC_TYPES.CARE_HOME.CLINICAL_REVIEWS]: 0.05,
  [METRIC_TYPES.CARE_HOME.CLINICAL_INCIDENTS]: 0.05,

  // Compliance Metrics
  [METRIC_TYPES.CARE_HOME.CQC_COMPLIANCE]: 0.15,
  [METRIC_TYPES.CARE_HOME.DOCUMENTATION_COMPLIANCE]: 0.15,
  [METRIC_TYPES.CARE_HOME.INCIDENT_REPORTING_COMPLIANCE]: 0.1,
  [METRIC_TYPES.CARE_HOME.TRAINING_COMPLIANCE]: 0.1,
  [METRIC_TYPES.CARE_HOME.POLICY_COMPLIANCE]: 0.1,
  [METRIC_TYPES.CARE_HOME.AUDIT_COMPLIANCE]: 0.1,
  [METRIC_TYPES.CARE_HOME.REGULATORY_COMPLIANCE]: 0.1,
  [METRIC_TYPES.CARE_HOME.SAFETY_COMPLIANCE]: 0.1,
  [METRIC_TYPES.CARE_HOME.INFECTION_CONTROL_COMPLIANCE]: 0.05,
  [METRIC_TYPES.CARE_HOME.DATA_PROTECTION_COMPLIANCE]: 0.05,

  // Financial Metrics
  [METRIC_TYPES.CARE_HOME.OCCUPANCY_REVENUE]: 0.15,
  [METRIC_TYPES.CARE_HOME.STAFF_COSTS]: 0.15,
  [METRIC_TYPES.CARE_HOME.OPERATIONAL_COSTS]: 0.1,
  [METRIC_TYPES.CARE_HOME.MEDICATION_COSTS]: 0.1,
  [METRIC_TYPES.CARE_HOME.MAINTENANCE_COSTS]: 0.1,
  [METRIC_TYPES.CARE_HOME.TRAINING_COSTS]: 0.1,
  [METRIC_TYPES.CARE_HOME.PROFIT_MARGIN]: 0.1,
  [METRIC_TYPES.CARE_HOME.CASH_FLOW]: 0.1,
  [METRIC_TYPES.CARE_HOME.BUDGET_VARIANCE]: 0.05,
  [METRIC_TYPES.CARE_HOME.COST_PER_RESIDENT]: 0.05,

  // Environmental Metrics
  [METRIC_TYPES.CARE_HOME.BUILDING_MAINTENANCE]: 0.15,
  [METRIC_TYPES.CARE_HOME.CLEANLINESS]: 0.15,
  [METRIC_TYPES.CARE_HOME.SAFETY_CHECKS]: 0.1,
  [METRIC_TYPES.CARE_HOME.EQUIPMENT_MAINTENANCE]: 0.1,
  [METRIC_TYPES.CARE_HOME.TEMPERATURE_CONTROL]: 0.1,
  [METRIC_TYPES.CARE_HOME.LIGHTING]: 0.1,
  [METRIC_TYPES.CARE_HOME.ACCESSIBILITY]: 0.1,
  [METRIC_TYPES.CARE_HOME.SECURITY]: 0.1,
  [METRIC_TYPES.CARE_HOME.WASTE_MANAGEMENT]: 0.05,
  [METRIC_TYPES.CARE_HOME.INFECTION_CONTROL]: 0.05,

  // Quality of Life Metrics
  [METRIC_TYPES.CARE_HOME.RESIDENT_DIGNITY]: 0.15,
  [METRIC_TYPES.CARE_HOME.RESIDENT_CHOICE]: 0.15,
  [METRIC_TYPES.CARE_HOME.RESIDENT_PRIVACY]: 0.1,
  [METRIC_TYPES.CARE_HOME.RESIDENT_INDEPENDENCE]: 0.1,
  [METRIC_TYPES.CARE_HOME.RESIDENT_RELATIONSHIPS]: 0.1,
  [METRIC_TYPES.CARE_HOME.RESIDENT_ACTIVITIES_ENGAGEMENT]: 0.1,
  [METRIC_TYPES.CARE_HOME.RESIDENT_FEEDBACK]: 0.1,
  [METRIC_TYPES.CARE_HOME.RESIDENT_COMPLAINTS]: 0.1,
  [METRIC_TYPES.CARE_HOME.RESIDENT_SATISFACTION_SURVEYS]: 0.05,
  [METRIC_TYPES.CARE_HOME.RESIDENT_FAMILY_ENGAGEMENT]: 0.05,

  // Service Delivery Metrics
  [METRIC_TYPES.CARE_HOME.CARE_PLAN_COMPLIANCE]: 0.15,
  [METRIC_TYPES.CARE_HOME.ASSESSMENT_TIMELINESS]: 0.15,
  [METRIC_TYPES.CARE_HOME.HANDOVER_QUALITY]: 0.1,
  [METRIC_TYPES.CARE_HOME.RESPONSE_TIMES]: 0.1,
  [METRIC_TYPES.CARE_HOME.SERVICE_IMPROVEMENTS]: 0.1,
  [METRIC_TYPES.CARE_HOME.INCIDENT_RESOLUTION]: 0.1,
  [METRIC_TYPES.CARE_HOME.COMPLAINT_RESOLUTION]: 0.1,
  [METRIC_TYPES.CARE_HOME.SERVICE_CONTINUITY]: 0.1,
  [METRIC_TYPES.CARE_HOME.SERVICE_COORDINATION]: 0.05,
  [METRIC_TYPES.CARE_HOME.SERVICE_INNOVATION]: 0.05
};

export class HealthScoring {
  private static instance: HealthScoring;
  private healthHistory: Map<string, HealthTrend[]> = new Map();
  private readonly historyLimit = 1000; // Keep last 1000 data points

  private constructor() {}

  public static getInstance(): HealthScoring {
    if (!HealthScoring.instance) {
      HealthScoring.instance = new HealthScoring();
    }
    return HealthScoring.instance;
  }

  /**
   * Calculate health score for a component based on its metrics
   */
  public calculateComponentHealth(
    component: string,
    metrics: HealthMetric[]
  ): ComponentHealth {
    let totalScore = 0;
    let totalWeight = 0;

    metrics.forEach(metric => {
      const weight = METRIC_WEIGHTS[metric.name] || 1;
      const metricScore = this.calculateMetricScore(metric);
      totalScore += metricScore * weight;
      totalWeight += weight;
    });

    const finalScore = Math.round((totalScore / totalWeight) * 100) / 100;
    const status = this.determineStatus(component, finalScore);

    const health: ComponentHealth = {
      component,
      score: finalScore,
      status,
      metrics,
      lastUpdated: Date.now()
    };

    this.updateHealthHistory(component, health);
    return health;
  }

  /**
   * Calculate score for a single metric
   */
  private calculateMetricScore(metric: HealthMetric): number {
    const { value, threshold } = metric;
    
    // For metrics where lower is better
    if (metric.name.includes('ERRORS') || 
        metric.name.includes('INCIDENTS') || 
        metric.name.includes('COSTS') ||
        metric.name.includes('TURNOVER') ||
        metric.name.includes('COMPLAINTS') ||
        metric.name.includes('ADMISSIONS')) {
      return value <= threshold ? 1 : threshold / value;
    }
    
    // For metrics where higher is better
    return value >= threshold ? 1 : value / threshold;
  }

  /**
   * Determine health status based on component thresholds
   */
  private determineStatus(
    component: string,
    score: number
  ): 'healthy' | 'warning' | 'critical' {
    const thresholds = COMPONENT_THRESHOLDS[component] || {
      warning: 90,
      critical: 80
    };

    if (score < thresholds.critical) return 'critical';
    if (score < thresholds.warning) return 'warning';
    return 'healthy';
  }

  /**
   * Update health history for trend analysis
   */
  private updateHealthHistory(component: string, health: ComponentHealth) {
    if (!this.healthHistory.has(component)) {
      this.healthHistory.set(component, []);
    }

    const history = this.healthHistory.get(component)!;
    history.push({
      timestamp: health.lastUpdated,
      score: health.score,
      status: health.status
    });

    // Maintain history limit
    if (history.length > this.historyLimit) {
      history.shift();
    }

    this.healthHistory.set(component, history);
  }

  /**
   * Get health history for a component
   */
  public getHealthHistory(
    component: string,
    startTime?: number,
    endTime?: number
  ): HealthTrend[] {
    const history = this.healthHistory.get(component) || [];
    if (!startTime && !endTime) return history;

    return history.filter(h => {
      if (startTime && h.timestamp < startTime) return false;
      if (endTime && h.timestamp > endTime) return false;
      return true;
    });
  }

  /**
   * Get overall system health
   */
  public calculateSystemHealth(): ComponentHealth {
    const componentScores = Array.from(this.healthHistory.entries())
      .map(([component, history]) => ({
        component,
        score: history[history.length - 1]?.score || 0
      }));

    const totalScore = componentScores.reduce((sum, { score }) => sum + score, 0);
    const averageScore = totalScore / componentScores.length;

    return {
      component: 'system',
      score: averageScore,
      status: this.determineStatus('system', averageScore),
      metrics: componentScores.map(({ component, score }) => ({
        name: component,
        value: score,
        threshold: COMPONENT_THRESHOLDS[component]?.warning || 90,
        weight: 1
      })),
      lastUpdated: Date.now()
    };
  }

  /**
   * Predict future health scores using simple linear regression
   */
  public predictHealthTrend(
    component: string,
    hoursAhead: number
  ): HealthTrend[] {
    const history = this.healthHistory.get(component) || [];
    if (history.length < 2) return [];

    // Calculate slope using last 24 data points (if available)
    const dataPoints = history.slice(-24);
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((sum, _, i) => sum + i, 0);
    const sumY = dataPoints.reduce((sum, d) => sum + d.score, 0);
    const sumXY = dataPoints.reduce((sum, d, i) => sum + (i * d.score), 0);
    const sumX2 = dataPoints.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate predictions
    const lastTimestamp = history[history.length - 1].timestamp;
    const predictions: HealthTrend[] = [];

    for (let i = 1; i <= hoursAhead; i++) {
      const predictedScore = Math.max(0, Math.min(100, intercept + slope * (n + i)));
      predictions.push({
        timestamp: lastTimestamp + (i * 60 * 60 * 1000),
        score: predictedScore,
        status: this.determineStatus(component, predictedScore)
      });
    }

    return predictions;
  }
} 