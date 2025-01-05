/**
 * @fileoverview Pain Management Monitoring
 * @version 1.0.0
 * @created 2024-03-21
 */

import { metrics } from '@/lib/monitoring';
import { TenantContext } from '@/lib/multi-tenant/types';

export class PainManagementMonitoring {
  private tenantContext: TenantContext;

  constructor(tenantContext: TenantContext) {
    this.tenantContext = tenantContext;
  }

  trackAssessmentCreation(duration: number, success: boolean) {
    metrics.recordMetric('pain_assessment_creation', {
      duration,
      success,
      region: this.tenantContext.region,
      tenantId: this.tenantContext.tenantId
    });
  }

  trackSyncOperation(assessmentCount: number, success: boolean) {
    metrics.recordMetric('pain_assessment_sync', {
      count: assessmentCount,
      success,
      region: this.tenantContext.region,
      tenantId: this.tenantContext.tenantId
    });
  }

  trackHighPainScore(score: number) {
    if (score >= 7) {
      metrics.recordMetric('high_pain_score_recorded', {
        score,
        region: this.tenantContext.region,
        tenantId: this.tenantContext.tenantId
      });
    }
  }

  trackComplianceIssue(issue: string) {
    metrics.recordMetric('pain_compliance_issue', {
      issue,
      region: this.tenantContext.region,
      tenantId: this.tenantContext.tenantId
    });
  }
} 