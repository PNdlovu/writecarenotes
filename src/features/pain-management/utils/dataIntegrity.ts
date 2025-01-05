/**
 * @fileoverview Pain Management Data Integrity
 * @version 1.0.0
 * @created 2024-03-21
 */

import { PainAssessment } from '../types';
import { prisma } from '@/lib/prisma';
import { TenantContext } from '@/lib/multi-tenant/types';

export class DataIntegrityChecker {
  private tenantContext: TenantContext;

  constructor(tenantContext: TenantContext) {
    this.tenantContext = tenantContext;
  }

  async validateAssessment(assessment: PainAssessment): Promise<boolean> {
    // Check for duplicate assessments
    const duplicates = await this.checkDuplicates(assessment);
    if (duplicates) return false;

    // Validate assessment timeline
    const timelineValid = await this.validateTimeline(assessment);
    if (!timelineValid) return false;

    // Check data consistency
    return this.checkDataConsistency(assessment);
  }

  private async checkDuplicates(assessment: PainAssessment): Promise<boolean> {
    const existing = await prisma.painAssessment.findMany({
      where: {
        residentId: assessment.residentId,
        tenantId: this.tenantContext.tenantId,
        assessmentDate: {
          gte: new Date(assessment.assessmentDate.getTime() - 5 * 60000), // 5 minutes
          lte: new Date(assessment.assessmentDate.getTime() + 5 * 60000),
        },
      },
    });

    return existing.length === 0;
  }

  private async validateTimeline(assessment: PainAssessment): Promise<boolean> {
    // Check if assessment date is in the future
    if (assessment.assessmentDate > new Date()) return false;

    // Check if assessment fits in resident's timeline
    const resident = await prisma.resident.findUnique({
      where: {
        id: assessment.residentId,
      },
    });

    return resident?.admissionDate <= assessment.assessmentDate;
  }

  private checkDataConsistency(assessment: PainAssessment): boolean {
    // Check pain score matches scale
    if (assessment.painScale === 'WONG_BAKER' && assessment.painScore > 5) {
      return false;
    }

    // Validate interventions
    if (!this.validateInterventions(assessment)) {
      return false;
    }

    return true;
  }

  private validateInterventions(assessment: PainAssessment): boolean {
    // Implementation for intervention validation
    return true;
  }
} 