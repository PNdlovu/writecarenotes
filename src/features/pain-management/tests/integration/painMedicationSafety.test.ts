/**
 * @fileoverview Pain Medication Safety Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { PainMedicationSafetyService } from '../../services/painMedicationSafety';
import { createTestTenant, createTestResident } from '@/lib/testing';

describe('Pain Medication Safety', () => {
  let safetyService: PainMedicationSafetyService;
  let residentId: string;
  let tenantContext;

  beforeAll(async () => {
    tenantContext = await createTestTenant();
    const resident = await createTestResident(tenantContext.tenantId);
    residentId = resident.id;
    safetyService = new PainMedicationSafetyService(tenantContext);
  });

  describe('Pain Medication Risk Assessment', () => {
    it('should assess pain medication escalation risks', async () => {
      const assessment = await safetyService.assessEscalationRisk({
        residentId,
        currentPainScore: 8,
        medicationHistory: ['morphine-1', 'oxycodone-1'],
        escalationRequest: {
          proposedMedication: 'fentanyl-1',
          reason: 'INADEQUATE_PAIN_CONTROL'
        }
      });

      expect(assessment).toMatchObject({
        riskLevel: 'HIGH',
        concerns: expect.arrayContaining([
          'RAPID_DOSE_ESCALATION',
          'MULTIPLE_OPIOIDS',
          'HIGH_POTENCY_MEDICATION'
        ]),
        recommendations: expect.arrayContaining([
          'SPECIALIST_REVIEW_REQUIRED',
          'CONSIDER_NON_PHARMACOLOGICAL',
          'ENHANCED_MONITORING'
        ])
      });
    });

    it('should monitor breakthrough pain patterns', async () => {
      const analysis = await safetyService.analyzeBreakthroughPain({
        residentId,
        period: 'LAST_7_DAYS',
        medications: ['morphine-1']
      });

      expect(analysis).toMatchObject({
        frequency: expect.any(Number),
        timing: expect.any(Object),
        triggers: expect.any(Array),
        effectivenessPattern: expect.any(Object),
        recommendations: expect.arrayContaining([
          'ADJUST_BASELINE_MEDICATION',
          'REVIEW_PRN_TIMING'
        ])
      });
    });
  });

  describe('Pain-Specific Safety Protocols', () => {
    it('should validate pain medication combinations', async () => {
      const validation = await safetyService.validatePainMedicationCombination({
        residentId,
        baselineMedications: ['morphine-1'],
        proposedAdditions: ['pregabalin-1'],
        painType: 'NEUROPATHIC'
      });

      expect(validation).toMatchObject({
        isAppropriate: true,
        clinicalReasoning: expect.any(String),
        monitoringRequirements: expect.arrayContaining([
          'SEDATION_LEVEL',
          'PAIN_SCORES',
          'SIDE_EFFECTS'
        ])
      });
    });
  });

  describe('Withdrawal Monitoring', () => {
    it('should assess withdrawal risk during medication reduction', async () => {
      const assessment = await safetyService.assessWithdrawalRisk({
        residentId,
        medication: 'morphine-1',
        currentDose: '60mg',
        proposedReduction: {
          targetDose: '30mg',
          reductionPeriod: '4_WEEKS',
          stepSize: '5mg'
        },
        usageDuration: '6_MONTHS'
      });

      expect(assessment).toMatchObject({
        riskLevel: 'MODERATE',
        factors: expect.arrayContaining([
          'LONG_TERM_USE',
          'HIGH_INITIAL_DOSE',
          'PREVIOUS_WITHDRAWAL_HISTORY'
        ]),
        monitoringPlan: {
          frequency: 'TWICE_DAILY',
          duration: '6_WEEKS',
          parameters: expect.arrayContaining([
            'WITHDRAWAL_SYMPTOMS',
            'PAIN_SCORES',
            'VITAL_SIGNS',
            'MOOD_CHANGES'
          ])
        },
        interventions: expect.arrayContaining([
          'GRADUAL_REDUCTION',
          'PSYCHOLOGICAL_SUPPORT',
          'PRN_PROTOCOL'
        ])
      });
    });

    it('should track withdrawal symptoms over time', async () => {
      const withdrawalMonitoring = await safetyService.trackWithdrawalSymptoms({
        residentId,
        medication: 'morphine-1',
        period: 'LAST_7_DAYS',
        symptoms: [
          {
            date: new Date(),
            score: 6,
            symptoms: ['ANXIETY', 'INSOMNIA', 'MUSCLE_ACHES'],
            interventions: ['PRN_MEDICATION', 'RELAXATION_TECHNIQUES']
          }
        ]
      });

      expect(withdrawalMonitoring).toMatchObject({
        trend: 'IMPROVING',
        severityScore: expect.any(Number),
        symptomPatterns: {
          timeOfDay: expect.any(Object),
          triggers: expect.any(Array)
        },
        effectiveInterventions: expect.arrayContaining([
          'RELAXATION_TECHNIQUES'
        ]),
        recommendations: expect.arrayContaining([
          'CONTINUE_CURRENT_PLAN',
          'MAINTAIN_SUPPORT_MEASURES'
        ])
      });
    });
  });

  describe('Tolerance Assessment', () => {
    it('should evaluate medication tolerance development', async () => {
      const toleranceAssessment = await safetyService.assessMedicationTolerance({
        residentId,
        medication: 'morphine-1',
        period: '3_MONTHS',
        painScores: [
          { date: new Date('2024-01-01'), score: 4, dose: '30mg' },
          { date: new Date('2024-02-01'), score: 5, dose: '40mg' },
          { date: new Date('2024-03-01'), score: 6, dose: '50mg' }
        ]
      });

      expect(toleranceAssessment).toMatchObject({
        toleranceDeveloped: true,
        indicators: expect.arrayContaining([
          'INCREASING_DOSE_REQUIREMENT',
          'DIMINISHING_EFFECTIVENESS',
          'SHORTER_DURATION_OF_ACTION'
        ]),
        analysis: {
          doseEscalationRate: expect.any(Number),
          effectivenessTrend: 'DECREASING',
          timeToEffect: expect.any(Object)
        },
        recommendations: expect.arrayContaining([
          'ROTATION_CONSIDERATION',
          'ADJUVANT_THERAPY',
          'SPECIALIST_REVIEW'
        ])
      });
    });

    it('should plan medication rotation strategy', async () => {
      const rotationPlan = await safetyService.planMedicationRotation({
        residentId,
        currentMedication: {
          name: 'morphine-1',
          dose: '60mg',
          toleranceLevel: 'HIGH'
        },
        painCharacteristics: {
          type: 'MIXED',
          severity: 'MODERATE',
          pattern: 'CONSTANT'
        }
      });

      expect(rotationPlan).toMatchObject({
        recommendedMedication: expect.any(String),
        conversionProtocol: {
          initialDose: expect.any(String),
          titrationSchedule: expect.any(Array),
          crossoverMethod: 'GRADUAL_ROTATION'
        },
        monitoringRequirements: expect.arrayContaining([
          'PAIN_CONTROL',
          'WITHDRAWAL_SYMPTOMS',
          'SIDE_EFFECTS'
        ]),
        safetyMeasures: expect.arrayContaining([
          'BREAKTHROUGH_PROTOCOL',
          'RESCUE_MEDICATION',
          'WITHDRAWAL_MANAGEMENT'
        ])
      });
    });
  });

  describe('Non-Pharmacological Integration', () => {
    it('should assess combined intervention effectiveness', async () => {
      const assessment = await safetyService.evaluateCombinedInterventions({
        residentId,
        pharmacological: {
          medication: 'morphine-1',
          dose: '30mg'
        },
        nonPharmacological: [
          { type: 'PHYSIOTHERAPY', frequency: 'TWICE_WEEKLY' },
          { type: 'HEAT_THERAPY', frequency: 'DAILY' },
          { type: 'MINDFULNESS', frequency: 'DAILY' }
        ],
        period: 'LAST_14_DAYS'
      });

      expect(assessment).toMatchObject({
        overallEffectiveness: expect.any(Number),
        synergisticEffects: expect.arrayContaining([
          {
            combination: ['MEDICATION', 'HEAT_THERAPY'],
            effectiveness: expect.any(Number)
          }
        ]),
        optimalTiming: {
          heatTherapy: 'BEFORE_MEDICATION',
          physiotherapy: 'AFTER_PEAK_MEDICATION'
        },
        recommendations: expect.arrayContaining([
          'CONTINUE_COMBINED_APPROACH',
          'ADJUST_INTERVENTION_TIMING'
        ])
      });
    });
  });

  describe('Pain Crisis Management', () => {
    it('should handle acute pain exacerbation', async () => {
      const crisisResponse = await safetyService.managePainCrisis({
        residentId,
        currentPainScore: 9,
        baselineMedications: ['morphine-1'],
        vitalSigns: {
          respiratoryRate: 16,
          oxygenSaturation: 98,
          bloodPressure: '120/80'
        }
      });

      expect(crisisResponse).toMatchObject({
        immediateActions: expect.arrayContaining([
          'RESCUE_MEDICATION',
          'POSITION_CHANGE',
          'VITAL_SIGNS_MONITORING'
        ]),
        escalationProtocol: {
          conditions: expect.any(Array),
          contactOrder: ['SENIOR_NURSE', 'GP', 'EMERGENCY_SERVICES']
        },
        safetyChecks: expect.arrayContaining([
          'OPIOID_TOXICITY_MONITORING',
          'CONSCIOUSNESS_LEVEL',
          'PAIN_REASSESSMENT'
        ])
      });
    });
  });

  describe('Long-Term Effectiveness', () => {
    it('should track long-term pain management outcomes', async () => {
      const effectiveness = await safetyService.analyzeLongTermEffectiveness({
        residentId,
        period: '6_MONTHS',
        interventions: {
          medications: ['morphine-1'],
          nonPharmacological: ['PHYSIOTHERAPY', 'HEAT_THERAPY']
        }
      });

      expect(effectiveness).toMatchObject({
        painControl: {
          trend: expect.any(String),
          averageScore: expect.any(Number),
          variability: expect.any(Number)
        },
        functionalImprovement: {
          mobility: expect.any(String),
          dailyActivities: expect.any(String),
          sleepQuality: expect.any(String)
        },
        adverseEffects: {
          severity: expect.any(String),
          impact: expect.any(String),
          managementSuccess: expect.any(Boolean)
        },
        sustainedBenefits: expect.arrayContaining([
          'IMPROVED_MOBILITY',
          'BETTER_SLEEP',
          'REDUCED_ANXIETY'
        ])
      });
    });
  });

  describe('Quality of Life Impact', () => {
    it('should assess pain management impact on quality of life', async () => {
      const qolAssessment = await safetyService.evaluateQualityOfLife({
        residentId,
        assessmentPeriod: '3_MONTHS',
        domains: ['PHYSICAL', 'PSYCHOLOGICAL', 'SOCIAL', 'FUNCTIONAL']
      });

      expect(qolAssessment).toMatchObject({
        overallImpact: expect.any(String),
        domainScores: {
          physical: expect.any(Number),
          psychological: expect.any(Number),
          social: expect.any(Number),
          functional: expect.any(Number)
        },
        improvements: expect.arrayContaining([
          'MOBILITY',
          'MOOD',
          'SOCIAL_ENGAGEMENT'
        ]),
        challenges: expect.arrayContaining([
          'MEDICATION_SIDE_EFFECTS',
          'ACTIVITY_LIMITATIONS'
        ]),
        recommendations: expect.arrayContaining([
          'ADJUST_MEDICATION_TIMING',
          'ENHANCE_SUPPORT_MEASURES',
          'LIFESTYLE_MODIFICATIONS'
        ])
      });
    });

    it('should track resident satisfaction with pain management', async () => {
      const satisfaction = await safetyService.trackResidentSatisfaction({
        residentId,
        period: 'LAST_MONTH',
        aspects: ['PAIN_CONTROL', 'SIDE_EFFECTS', 'CARE_APPROACH']
      });

      expect(satisfaction).toMatchObject({
        overallScore: expect.any(Number),
        aspectScores: {
          painControl: expect.any(Number),
          sideEffects: expect.any(Number),
          careApproach: expect.any(Number)
        },
        feedback: {
          positiveAspects: expect.any(Array),
          areasForImprovement: expect.any(Array)
        },
        trends: {
          satisfaction: expect.any(String),
          compliance: expect.any(String)
        }
      });
    });
  });
}); 