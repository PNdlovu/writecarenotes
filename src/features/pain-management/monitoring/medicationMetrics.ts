/**
 * @fileoverview Medication Integration Metrics
 */

import { metrics } from '@/lib/monitoring';
import { TenantContext } from '@/lib/multi-tenant/types';
import { PainAssessment } from '../types';

export class MedicationMetrics {
  constructor(private tenantContext: TenantContext) {}

  trackPRNTrigger(assessment: PainAssessment) {
    metrics.increment('pain_prn_triggers', 1, {
      pain_level: String(assessment.painScore),
      region: this.tenantContext.region
    });
  }

  trackMedicationEffectiveness(previousScore: number, currentScore: number) {
    const reduction = previousScore - currentScore;
    metrics.histogram('pain_medication_effectiveness', reduction, {
      region: this.tenantContext.region
    });
  }

  trackInterventionLatency(triggerTime: Date, interventionTime: Date) {
    const latency = interventionTime.getTime() - triggerTime.getTime();
    metrics.histogram('pain_intervention_latency', latency, {
      region: this.tenantContext.region
    });
  }

  trackMedicationValidation(success: boolean, reason?: string) {
    metrics.increment('medication_validation', 1, {
      success: String(success),
      reason: reason || 'none',
      region: this.tenantContext.region
    });
  }
} 