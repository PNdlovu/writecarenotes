/**
 * @fileoverview Pain Management Medication Integration
 * @version 1.0.0
 * @created 2024-03-21
 */

import { PrescriptionService } from '@/features/medications/services/prescriptionService';
import { MARService } from '@/features/medications/services/marService';
import { PRNTracking } from '@/features/medications/services/prnTracking';
import { ResidentPainAssessment, CareHomeInterventionType } from '../types/care-home';
import { TenantContext } from '@/lib/multi-tenant/types';

export class PainMedicationIntegration {
  constructor(
    private tenantContext: TenantContext,
    private prescriptionService: PrescriptionService,
    private marService: MARService,
    private prnTracking: PRNTracking
  ) {}

  async handlePainMedication(assessment: ResidentPainAssessment): Promise<void> {
    const medicationInterventions = assessment.interventions.filter(
      i => i.type === CareHomeInterventionType.PRN_MEDICATION
    );

    for (const intervention of medicationInterventions) {
      // Validate medication administration
      await this.validateMedicationAdministration(intervention);

      // Record in MAR
      await this.recordInMAR(assessment, intervention);

      // Track PRN effectiveness
      await this.trackPRNEffectiveness(assessment, intervention);
    }
  }

  private async validateMedicationAdministration(intervention: CareHomeIntervention): Promise<void> {
    // Check prescription exists and is valid
    const prescription = await this.prescriptionService.getPrescription(intervention.medicationId);
    if (!prescription) {
      throw new Error('No valid prescription found');
    }

    // Check stock availability
    const stockCheck = await this.prescriptionService.checkMedicationStock(intervention.medicationId);
    if (!stockCheck.available) {
      throw new Error('Medication not in stock');
    }

    // Validate staff member authorization
    const authorized = await this.prescriptionService.validateAdministrationRights(
      intervention.administeredBy,
      prescription
    );
    if (!authorized) {
      throw new Error('Staff member not authorized to administer medication');
    }
  }

  private async recordInMAR(assessment: ResidentPainAssessment, intervention: CareHomeIntervention): Promise<void> {
    await this.marService.recordAdministration({
      residentId: assessment.residentId,
      medicationId: intervention.medicationId,
      administeredBy: intervention.administeredBy,
      administeredAt: intervention.startTime,
      painScore: assessment.painScore,
      effectiveness: intervention.effectiveness,
      notes: intervention.notes
    });
  }

  private async trackPRNEffectiveness(assessment: ResidentPainAssessment, intervention: CareHomeIntervention): Promise<void> {
    await this.prnTracking.recordPRNUse({
      residentId: assessment.residentId,
      medicationId: intervention.medicationId,
      painScoreBefore: assessment.painScore,
      administeredAt: intervention.startTime,
      administeredBy: intervention.administeredBy,
      reason: 'PAIN_MANAGEMENT',
      effectiveness: intervention.effectiveness
    });
  }
} 