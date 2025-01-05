/**
 * @fileoverview Pain Medication Compliance Checks
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';
import { TenantContext } from '@/lib/multi-tenant/types';
import { ResidentPainAssessment } from '../types/care-home';

export class MedicationComplianceChecks {
  constructor(private tenantContext: TenantContext) {}

  async checkMedicationCompliance(assessment: ResidentPainAssessment): Promise<string[]> {
    const issues: string[] = [];

    // Check PRN documentation
    if (this.hasPRNMedication(assessment)) {
      const prnIssues = await this.validatePRNDocumentation(assessment);
      issues.push(...prnIssues);
    }

    // Check medication effectiveness tracking
    const effectivenessIssues = await this.validateEffectivenessTracking(assessment);
    issues.push(...effectivenessIssues);

    // Check escalation procedures
    if (assessment.painScore >= 7) {
      const escalationIssues = await this.validateEscalationProcedures(assessment);
      issues.push(...escalationIssues);
    }

    return issues;
  }

  private hasPRNMedication(assessment: ResidentPainAssessment): boolean {
    return assessment.interventions.some(i => 
      i.type === CareHomeInterventionType.PRN_MEDICATION
    );
  }

  private async validatePRNDocumentation(assessment: ResidentPainAssessment): Promise<string[]> {
    const issues: string[] = [];
    const prnInterventions = assessment.interventions.filter(i => 
      i.type === CareHomeInterventionType.PRN_MEDICATION
    );

    for (const intervention of prnInterventions) {
      // Check MAR entry exists
      const marEntry = await this.marService.findEntry(intervention.medicationId, intervention.startTime);
      if (!marEntry) {
        issues.push(`Missing MAR entry for PRN medication - resident ${assessment.residentId}`);
      }

      // Check witness signature if required
      if (this.requiresWitness(intervention.medicationId) && !intervention.witnessedBy) {
        issues.push(`Missing witness signature for PRN medication - resident ${assessment.residentId}`);
      }

      // Check effectiveness documentation
      if (!intervention.effectiveness) {
        issues.push(`Missing effectiveness record for PRN medication - resident ${assessment.residentId}`);
      }
    }

    return issues;
  }

  private async validateEffectivenessTracking(assessment: ResidentPainAssessment): Promise<string[]> {
    const issues: string[] = [];
    const prnInterventions = assessment.interventions.filter(i => 
      i.type === CareHomeInterventionType.PRN_MEDICATION
    );

    for (const intervention of prnInterventions) {
      // Check initial pain score recorded
      if (assessment.painScore === undefined) {
        issues.push(`Missing initial pain score for PRN effectiveness tracking - resident ${assessment.residentId}`);
      }

      // Check follow-up assessment exists
      const followUp = await this.getFollowUpAssessment(assessment);
      if (!followUp && intervention.requiresFollowUp) {
        issues.push(`Missing follow-up assessment for PRN medication - resident ${assessment.residentId}`);
      }

      // Check effectiveness score recorded
      if (intervention.effectiveness === undefined) {
        issues.push(`Missing effectiveness score for PRN medication - resident ${assessment.residentId}`);
      }

      // Check care plan updated if ineffective
      if (intervention.effectiveness < 3) {
        const carePlanUpdated = await this.checkCarePlanUpdate(assessment.residentId, assessment.assessmentDate);
        if (!carePlanUpdated) {
          issues.push(`Care plan not updated after ineffective PRN - resident ${assessment.residentId}`);
        }
      }
    }

    return issues;
  }

  private async validateEscalationProcedures(assessment: ResidentPainAssessment): Promise<string[]> {
    const issues: string[] = [];

    if (assessment.painScore >= 7) {
      // Check nurse notification
      if (!assessment.notifiedNurse) {
        issues.push(`High pain score without nurse notification - resident ${assessment.residentId}`);
      }

      // Check GP notification if required
      const gpNotified = await this.checkGPNotification(assessment);
      if (!gpNotified) {
        issues.push(`Missing GP notification for high pain score - resident ${assessment.residentId}`);
      }

      // Check increased monitoring frequency
      const monitoringAdjusted = await this.checkMonitoringFrequency(assessment);
      if (!monitoringAdjusted) {
        issues.push(`Monitoring frequency not increased for high pain score - resident ${assessment.residentId}`);
      }

      // Check care plan review
      const carePlanReviewed = await this.checkCarePlanReview(assessment);
      if (!carePlanReviewed) {
        issues.push(`Care plan not reviewed after high pain score - resident ${assessment.residentId}`);
      }
    }

    return issues;
  }

  private async checkGPNotification(assessment: ResidentPainAssessment): Promise<boolean> {
    const notification = await prisma.gpNotification.findFirst({
      where: {
        residentId: assessment.residentId,
        assessmentId: assessment.id,
        type: 'HIGH_PAIN',
        createdAt: {
          gte: assessment.assessmentDate,
          lte: new Date(assessment.assessmentDate.getTime() + 24 * 60 * 60 * 1000) // Within 24 hours
        }
      }
    });

    return !!notification;
  }

  private async checkMonitoringFrequency(assessment: ResidentPainAssessment): Promise<boolean> {
    const subsequentAssessments = await prisma.painAssessment.findMany({
      where: {
        residentId: assessment.residentId,
        assessmentDate: {
          gt: assessment.assessmentDate,
          lte: new Date(assessment.assessmentDate.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      orderBy: {
        assessmentDate: 'asc'
      }
    });

    if (subsequentAssessments.length < 2) {
      return false;
    }

    // Check if assessments are at increased frequency (every 2-4 hours)
    for (let i = 1; i < subsequentAssessments.length; i++) {
      const timeDiff = subsequentAssessments[i].assessmentDate.getTime() - 
                      subsequentAssessments[i-1].assessmentDate.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff > 4) { // Maximum 4 hours between assessments for high pain
        return false;
      }
    }

    return true;
  }

  private async checkCarePlanReview(assessment: ResidentPainAssessment): Promise<boolean> {
    const review = await prisma.carePlanReview.findFirst({
      where: {
        residentId: assessment.residentId,
        type: 'PAIN_MANAGEMENT',
        reviewDate: {
          gte: assessment.assessmentDate,
          lte: new Date(assessment.assessmentDate.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    return !!review;
  }
} 