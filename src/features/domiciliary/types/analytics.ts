/**
 * @writecarenotes.com
 * @fileoverview Analytics types for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for analytics data in the domiciliary care module.
 * Includes types for visit metrics, staff performance, and service quality.
 *
 * Features:
 * - Visit analytics types
 * - Staff metrics types
 * - Service quality types
 * - Compliance types
 * - Time range types
 *
 * Mobile-First Considerations:
 * - Optimized data structures
 * - Efficient serialization
 * - Minimal memory usage
 * - Network-friendly types
 * - Cache-friendly shapes
 *
 * Enterprise Features:
 * - Type safety
 * - Documentation
 * - Validation rules
 * - Audit support
 * - Analytics tracking
 */

export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y';

export interface VisitMetrics {
  total: number;
  completed: number;
  missed: number;
  late: number;
  onTime: number;
  cancelled: number;
  rescheduled: number;
  averageDuration: number;
  completionRate: number;
  punctualityRate: number;
}

export interface StaffMetrics {
  total: number;
  active: number;
  onLeave: number;
  utilization: number;
  averageVisitsPerDay: number;
  averageTravelTime: number;
  averageVisitDuration: number;
  skillCoverage: Record<string, number>;
}

export interface ServiceQualityMetrics {
  clientSatisfaction: number;
  staffSatisfaction: number;
  incidentRate: number;
  complaintRate: number;
  feedbackScore: number;
  responseTime: number;
  continuityOfCare: number;
}

export interface ComplianceMetrics {
  overdueVisits: number;
  missedMedications: number;
  incompleteRecords: number;
  staffTrainingCompliance: number;
  riskAssessmentCompliance: number;
  documentationCompliance: number;
}

export interface RegionalMetrics {
  region: string;
  visitMetrics: VisitMetrics;
  staffMetrics: StaffMetrics;
  serviceQuality: ServiceQualityMetrics;
  compliance: ComplianceMetrics;
}

export interface VisitAnalytics {
  timeRange: TimeRange;
  lastUpdated: string;
  overall: {
    visitMetrics: VisitMetrics;
    staffMetrics: StaffMetrics;
    serviceQuality: ServiceQualityMetrics;
    compliance: ComplianceMetrics;
  };
  byRegion: RegionalMetrics[];
  trends: {
    visitCompletion: Array<{ date: string; value: number }>;
    staffUtilization: Array<{ date: string; value: number }>;
    clientSatisfaction: Array<{ date: string; value: number }>;
    complianceScore: Array<{ date: string; value: number }>;
  };
} 