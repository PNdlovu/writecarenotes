/**
 * @fileoverview Pain Tracking Service
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';
import { TenantContext } from '@/lib/multi-tenant/types';
import { PainAssessment, PainTrend } from '../types';
import { MedicationIntegrationService } from './medicationIntegration';
import { PainManagementMetrics } from '../monitoring/metrics';
import { DataIntegrityChecker } from '../utils/dataIntegrity';
import { RecoveryStrategies } from '../utils/recovery';
import { validatePainAssessment } from '../validation/schemas';

export class PainTrackingService {
  private medicationIntegration: MedicationIntegrationService;
  private metrics: PainManagementMetrics;
  private dataIntegrity: DataIntegrityChecker;
  private recovery: RecoveryStrategies;

  constructor(private tenantContext: TenantContext) {
    this.medicationIntegration = new MedicationIntegrationService(tenantContext);
    this.metrics = new PainManagementMetrics(tenantContext);
    this.dataIntegrity = new DataIntegrityChecker(tenantContext);
    this.recovery = new RecoveryStrategies(tenantContext);
  }

  async trackPainAssessment(assessment: PainAssessment): Promise<void> {
    try {
      // Validate assessment data
      validatePainAssessment(assessment, this.tenantContext.region);

      // Check data integrity
      const isValid = await this.dataIntegrity.validateAssessment(assessment);
      if (!isValid) {
        throw new Error('Data integrity check failed');
      }

      // Store assessment
      await this.storeAssessment(assessment);

      // Handle medication integrations
      await this.medicationIntegration.handlePainAssessment(assessment);

      // Track metrics
      this.metrics.trackAssessmentPatterns(assessment);
      this.metrics.trackComplianceMetrics(assessment);

      // Handle high pain scores
      if (assessment.painScore >= 7) {
        await this.handleHighPainScore(assessment);
      }

    } catch (error) {
      await this.recovery.handleValidationFailure(assessment);
      throw error;
    }
  }

  async analyzePainTrends(residentId: string, period: { start: Date; end: Date }): Promise<PainTrend[]> {
    const assessments = await prisma.painAssessment.findMany({
      where: {
        residentId,
        tenantId: this.tenantContext.tenantId,
        assessmentDate: {
          gte: period.start,
          lte: period.end
        }
      },
      orderBy: {
        assessmentDate: 'asc'
      }
    });

    return this.calculateTrends(assessments);
  }

  private async storeAssessment(assessment: PainAssessment): Promise<void> {
    try {
      await prisma.painAssessment.create({
        data: {
          ...assessment,
          tenantId: this.tenantContext.tenantId
        }
      });
    } catch (error) {
      await this.recovery.handleDatabaseFailure('storeAssessment', assessment);
      throw error;
    }
  }

  private async handleHighPainScore(assessment: PainAssessment): Promise<void> {
    // Notify care team
    await this.notifyCareTeam(assessment);

    // Update care plan if needed
    await this.updateCarePlan(assessment);

    // Schedule follow-up assessment
    await this.scheduleFollowUp(assessment);
  }

  private calculateTrends(assessments: PainAssessment[]): PainTrend[] {
    // Implementation for trend calculation
    return [];
  }

  private async notifyCareTeam(assessment: PainAssessment): Promise<void> {
    // Implementation for care team notification
  }

  private async updateCarePlan(assessment: PainAssessment): Promise<void> {
    // Implementation for care plan updates
  }

  private async scheduleFollowUp(assessment: PainAssessment): Promise<void> {
    // Implementation for follow-up scheduling
  }
} 