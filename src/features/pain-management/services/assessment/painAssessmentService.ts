/**
 * @fileoverview Pain Assessment Service for managing pain assessments
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Core service for managing pain assessments and integration with other services
 */

import { TenantContext } from '@/lib/tenant/types';
import { PainAssessment } from '../../types/care-home';
import { prisma } from '@/lib/db';
import { CacheService } from '@/lib/cache';
import { ComplianceService } from '@/lib/compliance';
import { PainAlertService } from '../monitoring/painAlertService';
import { CarePlanService } from '@/features/care-plan/services';
import { ValidationService } from '@/lib/validation';
import { AuditService } from '@/lib/audit';

export class PainAssessmentService {
  private cacheService: CacheService;
  private complianceService: ComplianceService;
  private alertService: PainAlertService;
  private carePlanService: CarePlanService;
  private validationService: ValidationService;
  private auditService: AuditService;

  constructor(private tenantContext: TenantContext) {
    this.cacheService = new CacheService();
    this.complianceService = new ComplianceService(tenantContext);
    this.alertService = new PainAlertService(tenantContext);
    this.carePlanService = new CarePlanService(tenantContext);
    this.validationService = new ValidationService(tenantContext);
    this.auditService = new AuditService(tenantContext);
  }

  async createPainAssessment(assessment: PainAssessment): Promise<PainAssessment> {
    try {
      // Validate assessment data
      await this.validateAssessment(assessment);

      // Create assessment record
      const createdAssessment = await prisma.painAssessment.create({
        data: {
          ...assessment,
          tenantId: this.tenantContext.tenantId
        }
      });

      // Handle high pain scores
      if (assessment.painScore >= 4) {
        await this.alertService.handleHighPainScore(createdAssessment);
      }

      // Update care plan with pain assessment data
      await this.updateCarePlan(createdAssessment);

      // Audit the assessment
      await this.auditService.logAssessment({
        type: 'PAIN_ASSESSMENT',
        residentId: assessment.residentId,
        assessedBy: assessment.assessedBy,
        details: {
          painScore: assessment.painScore,
          location: assessment.painLocation,
          interventions: assessment.interventions
        }
      });

      // Invalidate cache
      await this.invalidateCache(assessment.residentId);

      return createdAssessment;
    } catch (error) {
      await this.handleAssessmentError(error, assessment);
      throw error;
    }
  }

  async getResidentAssessments(residentId: string): Promise<PainAssessment[]> {
    const cacheKey = `pain-assessments:${residentId}`;
    
    // Try cache first
    const cached = await this.cacheService.get<PainAssessment[]>(cacheKey);
    if (cached) return cached;

    const assessments = await prisma.painAssessment.findMany({
      where: {
        residentId,
        tenantId: this.tenantContext.tenantId
      },
      orderBy: {
        assessmentDate: 'desc'
      },
      include: {
        interventions: true
      }
    });

    // Cache results
    await this.cacheService.set(cacheKey, assessments, 300); // 5 minutes

    return assessments;
  }

  private async validateAssessment(assessment: PainAssessment): Promise<void> {
    // Validate required fields
    await this.validationService.validateRequired(assessment, [
      'residentId',
      'assessedBy',
      'painScore',
      'assessmentDate'
    ]);

    // Validate pain score range
    if (assessment.painScore < 0 || assessment.painScore > 10) {
      throw new Error('Pain score must be between 0 and 10');
    }

    // Validate assessment date
    if (new Date(assessment.assessmentDate) > new Date()) {
      throw new Error('Assessment date cannot be in the future');
    }

    // Validate interventions if present
    if (assessment.interventions?.length > 0) {
      for (const intervention of assessment.interventions) {
        await this.validationService.validateIntervention(intervention);
      }
    }

    // Validate against regional requirements
    await this.complianceService.validatePainAssessment(assessment);
  }

  private async updateCarePlan(assessment: PainAssessment): Promise<void> {
    // Get current care plan
    const carePlan = await this.carePlanService.getResidentCarePlan(assessment.residentId);
    
    // Update pain management section in care plan
    await this.carePlanService.updateCarePlanSection(carePlan.id, {
      sectionType: 'PAIN_MANAGEMENT',
      data: {
        lastAssessment: {
          date: assessment.assessmentDate,
          score: assessment.painScore,
          location: assessment.painLocation,
          interventions: assessment.interventions
        },
        triggers: assessment.triggers,
        requiresMonitoring: assessment.painScore >= 4
      }
    });
  }

  private async handleAssessmentError(error: any, assessment: PainAssessment): Promise<void> {
    await this.auditService.logError({
      type: 'PAIN_ASSESSMENT_ERROR',
      residentId: assessment.residentId,
      error: error.message,
      details: {
        assessment,
        stackTrace: error.stack
      }
    });
  }

  private async invalidateCache(residentId: string): Promise<void> {
    await Promise.all([
      this.cacheService.delete(`pain-assessments:${residentId}`),
      this.carePlanService.invalidateCache(residentId)
    ]);
  }
} 