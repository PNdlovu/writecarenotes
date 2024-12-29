/**
 * @fileoverview Pain Management Metrics
 * @version 1.0.0
 * @created 2024-03-21
 */

import { metrics } from '@/lib/monitoring';
import { TenantContext } from '@/lib/multi-tenant/types';
import { PainAssessment } from '../types';

export class PainManagementMetrics {
  private tenantContext: TenantContext;

  constructor(tenantContext: TenantContext) {
    this.tenantContext = tenantContext;
  }

  // Performance metrics
  trackPerformance(operation: string, duration: number, success: boolean) {
    metrics.histogram('pain_management_operation_duration', duration, {
      operation,
      success: String(success),
      region: this.tenantContext.region,
    });
  }

  // Business metrics
  trackAssessmentPatterns(assessment: PainAssessment) {
    metrics.increment('pain_assessments_total', 1, {
      scale: assessment.painScale,
      score_range: this.getPainScoreRange(assessment.painScore),
      region: this.tenantContext.region,
    });

    if (assessment.painScore >= 7) {
      metrics.increment('high_pain_scores', 1, {
        region: this.tenantContext.region,
        has_escalation: String(Boolean(assessment.escalationProcedure)),
      });
    }
  }

  // Compliance metrics
  trackComplianceMetrics(assessment: PainAssessment) {
    const rules = this.getRegionalRules();
    const isCompliant = this.checkCompliance(assessment, rules);

    metrics.gauge('pain_assessment_compliance', isCompliant ? 1 : 0, {
      region: this.tenantContext.region,
      rule_set: rules.version,
    });
  }

  // Resource usage metrics
  trackResourceUsage(operation: string, resourceType: string) {
    metrics.increment('pain_management_resource_usage', 1, {
      operation,
      resource_type: resourceType,
      region: this.tenantContext.region,
    });
  }

  // Error tracking
  trackError(errorType: string, context: Record<string, any>) {
    metrics.increment('pain_management_errors', 1, {
      error_type: errorType,
      region: this.tenantContext.region,
      ...context,
    });
  }

  private getPainScoreRange(score: number): string {
    if (score <= 3) return 'mild';
    if (score <= 6) return 'moderate';
    return 'severe';
  }

  private getRegionalRules() {
    // Implementation to get regional rules
    return { version: '1.0' };
  }

  private checkCompliance(assessment: PainAssessment, rules: any): boolean {
    // Implementation to check compliance
    return true;
  }
} 