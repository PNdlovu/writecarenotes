/**
 * @fileoverview Pain Alert Service for managing high pain scores and notifications
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Handles alerts, notifications, and follow-up scheduling for pain assessments
 */

import { TenantContext } from '@/lib/tenant/types';
import { PainAssessment, PainCareLevel } from '../types/care-home';
import { NotificationService } from '@/lib/notifications';
import { SchedulingService } from '@/lib/scheduling';
import { CareTeamService } from '@/features/care-team/services';
import { PainManagementMetrics } from './painManagementMetrics';

export class PainAlertService {
  private notificationService: NotificationService;
  private schedulingService: SchedulingService;
  private careTeamService: CareTeamService;
  private metrics: PainManagementMetrics;

  constructor(private tenantContext: TenantContext) {
    this.notificationService = new NotificationService(tenantContext);
    this.schedulingService = new SchedulingService(tenantContext);
    this.careTeamService = new CareTeamService(tenantContext);
    this.metrics = new PainManagementMetrics(tenantContext);
  }

  async handleHighPainScore(assessment: PainAssessment): Promise<void> {
    const careLevel = this.determineCareLevel(assessment);
    
    // Track high pain score incident
    await this.metrics.trackHighPainScore(assessment);

    // Send immediate notifications
    await this.notifyCareTeam(assessment, careLevel);

    // Schedule follow-up assessment
    await this.scheduleFollowUpAssessment(assessment, careLevel);

    // Create escalation if needed
    if (careLevel.requiresGPReview) {
      await this.createGPEscalation(assessment);
    }
  }

  async scheduleFollowUpAssessment(
    assessment: PainAssessment,
    careLevel: PainCareLevel
  ): Promise<void> {
    const followUpTime = new Date(assessment.assessmentDate);
    followUpTime.setHours(
      followUpTime.getHours() + careLevel.assessmentFrequency
    );

    await this.schedulingService.scheduleTask({
      type: 'PAIN_ASSESSMENT',
      residentId: assessment.residentId,
      dueDate: followUpTime,
      priority: careLevel.level,
      details: {
        previousScore: assessment.painScore,
        previousInterventions: assessment.interventions,
        specialInstructions: careLevel.specialInstructions
      }
    });
  }

  async notifyCareTeam(
    assessment: PainAssessment,
    careLevel: PainCareLevel
  ): Promise<void> {
    const careTeam = await this.careTeamService.getResidentCareTeam(
      assessment.residentId
    );

    // Determine who needs to be notified based on care level
    const recipients = this.getNotificationRecipients(careTeam, careLevel);

    // Send notifications
    await this.notificationService.sendBulk({
      type: 'HIGH_PAIN_SCORE',
      recipients,
      priority: careLevel.level,
      data: {
        residentId: assessment.residentId,
        painScore: assessment.painScore,
        location: assessment.painLocation,
        interventions: assessment.interventions,
        requiresNurseReview: careLevel.requiresNurseReview,
        requiresGPReview: careLevel.requiresGPReview
      }
    });
  }

  private determineCareLevel(assessment: PainAssessment): PainCareLevel {
    if (assessment.painScore >= 7) {
      return {
        level: 'HIGH',
        assessmentFrequency: 2, // 2 hours
        requiresNurseReview: true,
        requiresGPReview: true,
        specialInstructions: [
          'Monitor vital signs',
          'Review current pain medication',
          'Consider PRN medication if prescribed'
        ]
      };
    }

    if (assessment.painScore >= 4) {
      return {
        level: 'MEDIUM',
        assessmentFrequency: 4, // 4 hours
        requiresNurseReview: true,
        requiresGPReview: false,
        specialInstructions: [
          'Review comfort measures',
          'Consider non-pharmacological interventions'
        ]
      };
    }

    return {
      level: 'LOW',
      assessmentFrequency: 8, // 8 hours
      requiresNurseReview: false,
      requiresGPReview: false
    };
  }

  private getNotificationRecipients(careTeam: any[], careLevel: PainCareLevel): string[] {
    const recipients = [
      ...careTeam.filter(member => member.role === 'CARE_STAFF').map(m => m.id)
    ];

    if (careLevel.requiresNurseReview) {
      recipients.push(
        ...careTeam.filter(member => member.role === 'NURSE').map(m => m.id)
      );
    }

    if (careLevel.requiresGPReview) {
      recipients.push(
        ...careTeam.filter(member => member.role === 'GP').map(m => m.id)
      );
    }

    return recipients;
  }

  private async createGPEscalation(assessment: PainAssessment): Promise<void> {
    await this.notificationService.createEscalation({
      type: 'GP_REVIEW_REQUIRED',
      residentId: assessment.residentId,
      priority: 'HIGH',
      reason: `High pain score (${assessment.painScore}/10) requiring GP review`,
      details: {
        painScore: assessment.painScore,
        location: assessment.painLocation,
        interventions: assessment.interventions,
        assessmentDate: assessment.assessmentDate
      }
    });
  }
} 