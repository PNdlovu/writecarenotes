/**
 * @fileoverview Pain Management Medication Scheduling Integration
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 * 
 * Description:
 * Integrates pain assessments with the existing medication scheduling system,
 * focusing on pain-specific scheduling requirements and follow-up assessments.
 */

import { MARService } from '@/features/medications/services/marService';
import { PrescriptionService } from '@/features/medications/services/prescriptionService';
import { PRNTracking } from '@/features/medications/services/prnTracking';
import { TenantContext } from '@/lib/multi-tenant/types';
import { ResidentPainAssessment, CareHomeInterventionType } from '../types/care-home';
import { 
  MedicationSchedule, 
  PRNAssessment,
  FollowUpRequirement 
} from '@/features/medications/types/mar';

export class PainMedicationSchedulingService {
  constructor(
    private tenantContext: TenantContext,
    private marService: MARService,
    private prescriptionService: PrescriptionService,
    private prnTracking: PRNTracking
  ) {}

  async handlePainAssessment(assessment: ResidentPainAssessment): Promise<void> {
    const prnInterventions = assessment.interventions.filter(
      i => i.type === CareHomeInterventionType.PRN_MEDICATION
    );

    for (const intervention of prnInterventions) {
      // Record PRN usage with pain context
      await this.prnTracking.recordPRNWithContext({
        ...intervention,
        context: {
          type: 'PAIN_ASSESSMENT',
          painScore: assessment.painScore,
          triggers: assessment.triggers,
          location: assessment.painLocation
        }
      });

      // Determine follow-up requirements based on pain severity
      const followUp = this.determineFollowUpRequirements(assessment);
      
      // Use existing MAR service to schedule follow-up
      await this.marService.scheduleFollowUp({
        medicationId: intervention.medicationId,
        residentId: assessment.residentId,
        requirements: followUp,
        baselineAssessment: {
          type: 'PAIN',
          score: assessment.painScore,
          timestamp: assessment.assessmentDate
        }
      });
    }
  }

  private determineFollowUpRequirements(assessment: ResidentPainAssessment): FollowUpRequirement {
    // Pain-specific follow-up logic
    if (assessment.painScore >= 7) {
      return {
        timing: 'ONSET_OF_ACTION', // Use medication's onset time
        requireNurseReview: true,
        escalateToGP: true,
        monitoringFrequency: 'EVERY_2_HOURS'
      };
    }

    if (assessment.painScore >= 4) {
      return {
        timing: 'PEAK_EFFECT', // Use medication's peak effect time
        requireNurseReview: true,
        escalateToGP: false,
        monitoringFrequency: 'EVERY_4_HOURS'
      };
    }

    return {
      timing: 'STANDARD',
      requireNurseReview: false,
      escalateToGP: false,
      monitoringFrequency: 'EVERY_8_HOURS'
    };
  }

  async getPainAssessmentHistory(residentId: string): Promise<PRNAssessment[]> {
    // Use existing PRN tracking but filter for pain assessments
    const prnHistory = await this.prnTracking.getResidentPRNHistory(residentId);
    
    return prnHistory.filter(record => 
      record.context?.type === 'PAIN_ASSESSMENT'
    );
  }
} 