/**
 * @fileoverview Pain Management Medication Integration Service
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';
import { PainAssessment, PainIntervention } from '../types';
import { PrescriptionService } from '@/features/medications/services/prescriptionService';
import { MARService } from '@/features/medications/services/marService';
import { PRNTracking } from '@/features/medications/services/prnTracking';
import { TenantContext } from '@/lib/multi-tenant/types';
import { withErrorHandling } from '../utils/errorHandling';

export class MedicationIntegrationService {
  private prescriptionService: PrescriptionService;
  private marService: MARService;
  private prnTracking: PRNTracking;

  constructor(private tenantContext: TenantContext) {
    this.prescriptionService = new PrescriptionService(tenantContext);
    this.marService = new MARService(tenantContext);
    this.prnTracking = new PRNTracking(tenantContext);
  }

  async handlePainAssessment(assessment: PainAssessment): Promise<void> {
    // Check for PRN medications if pain score is high
    if (assessment.painScore >= 7) {
      await this.handleHighPainScore(assessment);
    }

    // Record any medication interventions
    await this.recordMedicationInterventions(assessment);

    // Update PRN effectiveness tracking
    await this.updatePRNEffectiveness(assessment);
  }

  private async handleHighPainScore(assessment: PainAssessment): Promise<void> {
    const availablePRNs = await this.prescriptionService.getAvailablePRNs(
      assessment.residentId,
      'PAIN'
    );

    if (availablePRNs.length > 0) {
      await this.prnTracking.recordPRNTrigger({
        residentId: assessment.residentId,
        triggerType: 'PAIN_ASSESSMENT',
        triggerValue: assessment.painScore,
        availableMedications: availablePRNs,
        assessmentId: assessment.id
      });
    }
  }

  private async recordMedicationInterventions(assessment: PainAssessment): Promise<void> {
    const medicationInterventions = assessment.interventions.filter(
      i => i.type === 'MEDICATION'
    );

    for (const intervention of medicationInterventions) {
      await this.marService.recordAdministration({
        residentId: assessment.residentId,
        medicationId: intervention.medicationId,
        administeredBy: intervention.administeredBy,
        administeredAt: intervention.startTime,
        witnessedBy: intervention.witnessedBy,
        effectiveness: intervention.effectiveness,
        notes: intervention.notes
      });
    }
  }

  private async updatePRNEffectiveness(assessment: PainAssessment): Promise<void> {
    const previousAssessment = await this.getPreviousAssessment(assessment);
    
    if (previousAssessment?.interventions.some(i => i.type === 'MEDICATION')) {
      await this.prnTracking.updateEffectiveness({
        residentId: assessment.residentId,
        previousScore: previousAssessment.painScore,
        currentScore: assessment.painScore,
        assessmentId: assessment.id
      });
    }
  }

  async getPreviousAssessment(assessment: PainAssessment): Promise<PainAssessment | null> {
    return await withErrorHandling(
      async () => {
        return await prisma.painAssessment.findFirst({
          where: {
            residentId: assessment.residentId,
            tenantId: this.tenantContext.tenantId,
            assessmentDate: {
              lt: assessment.assessmentDate
            }
          },
          orderBy: {
            assessmentDate: 'desc'
          },
          include: {
            interventions: true
          }
        });
      },
      this.tenantContext,
      { critical: true }
    );
  }

  async validateMedicationInterventions(interventions: PainIntervention[]): Promise<boolean> {
    for (const intervention of interventions) {
      if (intervention.type !== 'MEDICATION') continue;

      // Check if medication is prescribed
      const prescription = await this.prescriptionService.getPrescription(
        intervention.medicationId
      );
      if (!prescription) return false;

      // Check if medication is available
      const stock = await this.prescriptionService.checkMedicationStock(
        intervention.medicationId
      );
      if (!stock.available) return false;

      // Check if staff member is authorized
      const authorized = await this.prescriptionService.validateAdministrationRights(
        intervention.administeredBy,
        prescription
      );
      if (!authorized) return false;
    }

    return true;
  }

  async checkForInteractions(assessment: PainAssessment): Promise<void> {
    const medicationInterventions = assessment.interventions.filter(
      i => i.type === 'MEDICATION'
    );

    for (const intervention of medicationInterventions) {
      await this.prescriptionService.checkInteractions({
        medicationId: intervention.medicationId,
        residentId: assessment.residentId,
        administrationTime: intervention.startTime
      });
    }
  }

  async recordContraindications(assessment: PainAssessment): Promise<void> {
    const medicationInterventions = assessment.interventions.filter(
      i => i.type === 'MEDICATION'
    );

    for (const intervention of medicationInterventions) {
      if (intervention.sideEffects?.length > 0) {
        await this.prescriptionService.recordContraindication({
          medicationId: intervention.medicationId,
          residentId: assessment.residentId,
          symptoms: intervention.sideEffects,
          reportedBy: intervention.administeredBy,
          reportedAt: intervention.startTime
        });
      }
    }
  }
} 