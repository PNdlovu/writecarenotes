/**
 * @fileoverview Pain Specialist Referral Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { SpecialistReferralService } from '@/features/medications/services/specialistReferral';
import { MARService } from '@/features/medications/services/marService';
import { HealthcareIntegration } from '@/features/medications/services/healthcareIntegration';
import { PRNTracking } from '@/features/medications/services/prnTracking';
import { createTestTenant, createTestResident } from '@/lib/testing';

describe('Pain Specialist Referrals', () => {
  let referralService: SpecialistReferralService;
  let marService: MARService;
  let healthcareService: HealthcareIntegration;
  let prnTracking: PRNTracking;
  let residentId: string;
  let tenantContext;

  beforeAll(async () => {
    tenantContext = await createTestTenant();
    const resident = await createTestResident(tenantContext.tenantId);
    residentId = resident.id;

    marService = new MARService(tenantContext);
    healthcareService = new HealthcareIntegration(tenantContext);
    prnTracking = new PRNTracking(tenantContext);
    referralService = new SpecialistReferralService(tenantContext);
  });

  it('should generate referral when pain is poorly controlled', async () => {
    // Create history of poor pain control
    const painHistory = [
      { score: 8, date: new Date('2024-03-20') },
      { score: 7, date: new Date('2024-03-19') },
      { score: 8, date: new Date('2024-03-18') }
    ];

    for (const record of painHistory) {
      await prisma.painAssessment.create({
        data: {
          residentId,
          painScore: record.score,
          assessmentDate: record.date,
          tenantId: tenantContext.tenantId
        }
      });
    }

    const referral = await referralService.generatePainSpecialistReferral({
      residentId,
      reason: 'POORLY_CONTROLLED_PAIN',
      painHistory,
      currentMedications: ['test-med-1', 'test-med-2']
    });

    expect(referral).toMatchObject({
      status: 'PENDING',
      priority: 'HIGH',
      specialistType: 'PAIN_MANAGEMENT',
      referralDocuments: expect.arrayContaining([
        'PAIN_HISTORY',
        'MEDICATION_CHART',
        'ASSESSMENT_NOTES'
      ])
    });

    // Verify healthcare integration
    const notification = await healthcareService.getProviderNotification(referral.id);
    expect(notification).toMatchObject({
      type: 'SPECIALIST_REFERRAL',
      urgency: 'HIGH',
      requiresResponse: true
    });
  });

  it('should track specialist recommendations', async () => {
    const recommendation = {
      referralId: 'test-referral-1',
      specialistId: 'PAIN-SPEC-123',
      recommendations: [
        {
          type: 'MEDICATION_CHANGE',
          details: {
            currentMedication: 'test-med-1',
            proposedMedication: 'new-med-1',
            rationale: 'BETTER_PAIN_CONTROL'
          }
        },
        {
          type: 'ADDITIONAL_THERAPY',
          details: {
            therapy: 'PHYSIOTHERAPY',
            frequency: 'TWICE_WEEKLY'
          }
        }
      ],
      followUpPlan: {
        reviewIn: '2_WEEKS',
        monitoringRequirements: ['PAIN_SCORES', 'SIDE_EFFECTS']
      }
    };

    await referralService.processSpecialistRecommendations(recommendation);

    // Verify recommendations are tracked
    const trackedRecommendations = await prisma.specialistRecommendation.findMany({
      where: { referralId: 'test-referral-1' }
    });

    expect(trackedRecommendations).toHaveLength(2);
    expect(trackedRecommendations[0]).toMatchObject({
      status: 'PENDING_IMPLEMENTATION',
      type: 'MEDICATION_CHANGE'
    });

    // Verify care plan updates
    const carePlan = await prisma.carePlan.findFirst({
      where: { residentId }
    });

    expect(carePlan.specialistRecommendations).toContainEqual(
      expect.objectContaining({
        type: 'MEDICATION_CHANGE',
        status: 'PENDING_IMPLEMENTATION'
      })
    );
  });

  it('should integrate specialist care plans', async () => {
    const specialistPlan = {
      residentId,
      specialistId: 'PAIN-SPEC-123',
      carePlanUpdates: {
        medications: [
          {
            id: 'new-med-1',
            dosage: '10mg',
            frequency: 'TWICE_DAILY',
            specialInstructions: 'TAKE_WITH_FOOD'
          }
        ],
        nonPharmacological: [
          {
            type: 'PHYSIOTHERAPY',
            frequency: 'TWICE_WEEKLY',
            duration: '6_WEEKS'
          }
        ],
        monitoringRequirements: {
          painScores: { frequency: 'DAILY' },
          sideEffects: { frequency: 'DAILY' }
        }
      }
    };

    await referralService.integrateSpecialistCarePlan(specialistPlan);

    // Verify medication updates
    const marUpdates = await marService.getMedicationSchedule(residentId);
    expect(marUpdates.medications).toContainEqual(
      expect.objectContaining({
        medicationId: 'new-med-1',
        frequency: 'TWICE_DAILY'
      })
    );

    // Verify monitoring schedule
    const monitoringSchedule = await prisma.monitoringSchedule.findFirst({
      where: { residentId }
    });
    expect(monitoringSchedule).toMatchObject({
      painAssessment: { frequency: 'DAILY' },
      sideEffectChecks: { frequency: 'DAILY' }
    });
  });

  it('should handle urgent referrals', async () => {
    const urgentReferral = {
      residentId,
      reason: 'SEVERE_UNCONTROLLED_PAIN',
      painScore: 9,
      symptoms: ['SEVERE_DISTRESS', 'MOBILITY_IMPACT'],
      currentMedications: ['test-med-1']
    };

    const referral = await referralService.createUrgentReferral(urgentReferral);

    expect(referral).toMatchObject({
      status: 'URGENT',
      responseRequired: '24_HOURS',
      escalationPath: expect.arrayContaining([
        'ON_CALL_GP',
        'PAIN_SPECIALIST',
        'EMERGENCY_SERVICES'
      ])
    });

    // Verify escalation notifications
    const notifications = await prisma.urgentCareNotification.findMany({
      where: { referralId: referral.id }
    });

    expect(notifications).toHaveLength(3); // One for each escalation level
    expect(notifications[0]).toMatchObject({
      recipientRole: 'ON_CALL_GP',
      status: 'SENT'
    });
  });
}); 