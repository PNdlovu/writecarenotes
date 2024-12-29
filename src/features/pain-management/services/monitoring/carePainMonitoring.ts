/**
 * @fileoverview Care Home Pain Monitoring Service
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';
import { TenantContext } from '@/lib/multi-tenant/types';
import { ResidentPainAssessment, PainCareLevel, CareHomeShift } from '../types/care-home';
import { HandoverService } from '@/features/handover/services/handoverService';
import { CareplanService } from '@/features/careplans/services/careplanService';
import { NotificationService } from '@/features/notifications/services/notificationService';

export class CarePainMonitoring {
  constructor(
    private tenantContext: TenantContext,
    private handoverService: HandoverService,
    private careplanService: CareplanService,
    private notificationService: NotificationService
  ) {}

  async recordPainAssessment(assessment: ResidentPainAssessment): Promise<void> {
    // Validate assessment based on resident's cognitive status
    await this.validateAssessmentMethod(assessment);

    // Store assessment
    const stored = await prisma.painAssessment.create({
      data: {
        ...assessment,
        tenantId: this.tenantContext.tenantId
      }
    });

    // Update care plan if needed
    await this.updateCarePlanIfNeeded(stored);

    // Handle handover notes
    await this.createHandoverNote(stored);

    // Schedule follow-up
    await this.scheduleFollowUp(stored);

    // Notify relevant staff
    await this.notifyRelevantStaff(stored);
  }

  private async validateAssessmentMethod(assessment: ResidentPainAssessment): Promise<void> {
    const resident = await prisma.resident.findUnique({
      where: { id: assessment.residentId },
      include: { cognitiveStatus: true }
    });

    // Validate pain scale is appropriate for resident's cognitive status
    if (!this.isAppropriateScale(resident.cognitiveStatus, assessment.painScale)) {
      throw new Error('Inappropriate pain scale for resident\'s cognitive status');
    }
  }

  private async updateCarePlanIfNeeded(assessment: ResidentPainAssessment): Promise<void> {
    const recentAssessments = await this.getRecentAssessments(assessment.residentId);
    const careLevel = this.determineCareLevel(recentAssessments);

    if (this.requiresCarePlanUpdate(careLevel, assessment)) {
      await this.careplanService.updatePainManagement(assessment.residentId, {
        painLevel: careLevel.level,
        assessmentFrequency: careLevel.assessmentFrequency,
        interventions: this.getEffectiveInterventions(recentAssessments),
        specialInstructions: careLevel.specialInstructions
      });
    }
  }

  private async createHandoverNote(assessment: ResidentPainAssessment): Promise<void> {
    const resident = await prisma.resident.findUnique({
      where: { id: assessment.residentId }
    });

    await this.handoverService.addNote({
      residentId: assessment.residentId,
      type: 'PAIN_ASSESSMENT',
      details: {
        residentName: resident.name,
        roomNumber: resident.roomNumber,
        painLevel: assessment.painScore,
        currentInterventions: assessment.interventions,
        nextAssessmentDue: assessment.nextAssessmentDue,
        specialInstructions: this.getSpecialInstructions(assessment)
      },
      priority: this.determinePriority(assessment)
    });
  }

  private async scheduleFollowUp(assessment: ResidentPainAssessment): Promise<void> {
    const nextShift = this.getNextShift(assessment.shift);
    
    await this.notificationService.scheduleReminder({
      type: 'PAIN_ASSESSMENT',
      residentId: assessment.residentId,
      dueAt: assessment.nextAssessmentDue,
      assignedTo: nextShift,
      priority: this.determinePriority(assessment)
    });
  }

  private getNextShift(currentShift: CareHomeShift): CareHomeShift {
    const shifts = {
      [CareHomeShift.EARLY]: CareHomeShift.LATE,
      [CareHomeShift.LATE]: CareHomeShift.NIGHT,
      [CareHomeShift.NIGHT]: CareHomeShift.EARLY
    };
    return shifts[currentShift];
  }

  private determinePriority(assessment: ResidentPainAssessment): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (assessment.painScore >= 7) return 'HIGH';
    if (assessment.painScore >= 5) return 'MEDIUM';
    return 'LOW';
  }
} 