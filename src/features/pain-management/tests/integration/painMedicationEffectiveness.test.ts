/**
 * @fileoverview Pain Medication Effectiveness Tracking Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { PainMedicationSchedulingService } from '../../services/painMedicationScheduling';
import { PRNTracking } from '@/features/medications/services/prnTracking';
import { MARService } from '@/features/medications/services/marService';
import { createTestTenant, createTestResident } from '@/lib/testing';
import { ResidentPainAssessment, CareHomeInterventionType } from '../../types/care-home';
import { EffectivenessScore } from '@/features/medications/types/mar';

describe('Pain Medication Effectiveness Tracking', () => {
  let tenantContext;
  let residentId: string;
  let schedulingService: PainMedicationSchedulingService;
  let prnTracking: PRNTracking;
  let marService: MARService;

  beforeAll(async () => {
    tenantContext = await createTestTenant();
    const resident = await createTestResident(tenantContext.tenantId);
    residentId = resident.id;

    prnTracking = new PRNTracking(tenantContext);
    marService = new MARService(tenantContext);
    schedulingService = new PainMedicationSchedulingService(
      tenantContext,
      marService,
      prnTracking
    );
  });

  describe('Effectiveness Tracking', () => {
    it('should track medication effectiveness over time', async () => {
      const assessments = [
        { painScore: 8, effectiveness: 4 }, // Good response
        { painScore: 7, effectiveness: 3 }, // Moderate response
        { painScore: 8, effectiveness: 2 }  // Poor response
      ];

      for (const data of assessments) {
        const assessment: ResidentPainAssessment = {
          residentId,
          painScore: data.painScore,
          assessmentDate: new Date(),
          interventions: [{
            type: CareHomeInterventionType.PRN_MEDICATION,
            medicationId: 'test-med-1',
            startTime: new Date(),
            effectiveness: data.effectiveness
          }]
        };

        await schedulingService.handlePainAssessment(assessment);
      }

      const effectiveness = await prnTracking.getMedicationEffectiveness(
        residentId,
        'test-med-1',
        { days: 7 }
      );

      expect(effectiveness).toMatchObject({
        averageEffectiveness: 3,
        trend: 'DECREASING',
        requiresReview: true
      });
    });

    it('should identify patterns in effectiveness based on pain characteristics', async () => {
      const painTypes = ['SHARP', 'DULL', 'THROBBING'];
      
      for (const painType of painTypes) {
        const assessment: ResidentPainAssessment = {
          residentId,
          painScore: 7,
          painType,
          assessmentDate: new Date(),
          interventions: [{
            type: CareHomeInterventionType.PRN_MEDICATION,
            medicationId: 'test-med-1',
            startTime: new Date(),
            effectiveness: painType === 'SHARP' ? 4 : 2
          }]
        };

        await schedulingService.handlePainAssessment(assessment);
      }

      const analysis = await prnTracking.analyzeEffectivenessByPainType(
        residentId,
        'test-med-1'
      );

      expect(analysis.mostEffectiveFor).toBe('SHARP');
      expect(analysis.leastEffectiveFor).toEqual(expect.arrayContaining(['DULL', 'THROBBING']));
    });

    it('should track time to effectiveness', async () => {
      const assessment: ResidentPainAssessment = {
        residentId,
        painScore: 8,
        assessmentDate: new Date(),
        interventions: [{
          type: CareHomeInterventionType.PRN_MEDICATION,
          medicationId: 'test-med-1',
          startTime: new Date(),
          effectiveness: 4
        }]
      };

      await schedulingService.handlePainAssessment(assessment);

      // Record follow-up assessments at different intervals
      const followUps = [
        { minutes: 15, painScore: 7 },
        { minutes: 30, painScore: 5 },
        { minutes: 45, painScore: 4 }
      ];

      for (const followUp of followUps) {
        await marService.recordFollowUpAssessment({
          residentId,
          medicationId: 'test-med-1',
          painScore: followUp.painScore,
          assessmentTime: new Date(assessment.assessmentDate.getTime() + followUp.minutes * 60000)
        });
      }

      const effectiveness = await prnTracking.getTimeToEffectiveness(
        residentId,
        'test-med-1'
      );

      expect(effectiveness).toMatchObject({
        timeToInitialResponse: 15,
        timeToMaxEffect: 45,
        painReductionRate: 'GRADUAL'
      });
    });

    it('should track effectiveness in relation to other interventions', async () => {
      const assessment: ResidentPainAssessment = {
        residentId,
        painScore: 7,
        assessmentDate: new Date(),
        interventions: [
          {
            type: CareHomeInterventionType.PRN_MEDICATION,
            medicationId: 'test-med-1',
            startTime: new Date(),
            effectiveness: 3
          },
          {
            type: CareHomeInterventionType.NON_PHARMACOLOGICAL,
            interventionType: 'POSITIONING',
            startTime: new Date(),
            effectiveness: 2
          }
        ]
      };

      await schedulingService.handlePainAssessment(assessment);

      const combinedEffectiveness = await prnTracking.analyzeCombinedInterventions(
        residentId,
        'test-med-1'
      );

      expect(combinedEffectiveness).toMatchObject({
        medicationAlone: 3,
        withPositioning: 5,
        recommendedCombinations: expect.arrayContaining(['POSITIONING'])
      });
    });
  });
}); 