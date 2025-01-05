/**
 * @fileoverview Pain Medication AI Prediction Tests
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';
import { PainMedicationAI } from '@/features/ai/services/painMedicationAI';
import { createTestTenant, createTestResident } from '@/lib/testing';

describe('Pain Medication AI Predictions', () => {
  let aiService: PainMedicationAI;
  let residentId: string;

  beforeAll(async () => {
    const tenantContext = await createTestTenant();
    const resident = await createTestResident(tenantContext.tenantId);
    residentId = resident.id;
    aiService = new PainMedicationAI(tenantContext);
  });

  it('should predict medication effectiveness based on historical data', async () => {
    const prediction = await aiService.predictEffectiveness({
      residentId,
      medicationId: 'test-med-1',
      painCharacteristics: {
        type: 'SHARP',
        location: 'LOWER_BACK',
        intensity: 7
      }
    });

    expect(prediction).toMatchObject({
      predictedEffectiveness: expect.any(Number),
      confidence: expect.any(Number),
      recommendedDosage: expect.any(String),
      alternativeRecommendations: expect.any(Array)
    });
  });

  it('should identify optimal timing for medication administration', async () => {
    // Create historical effectiveness data
    const effectivenessData = [
      { hour: 8, effectiveness: 2 },
      { hour: 14, effectiveness: 4 },
      { hour: 20, effectiveness: 3 }
    ];

    for (const data of effectivenessData) {
      const administrationTime = new Date();
      administrationTime.setHours(data.hour, 0, 0, 0);

      await prisma.medicationAdministration.create({
        data: {
          residentId,
          medicationId: 'test-med-1',
          administeredAt: administrationTime,
          effectiveness: data.effectiveness,
          tenantId: tenantContext.tenantId
        }
      });
    }

    const timing = await aiService.predictOptimalTiming({
      residentId,
      medicationId: 'test-med-1',
      painCharacteristics: {
        type: 'CHRONIC',
        pattern: 'DAILY_VARIATION'
      }
    });

    expect(timing).toMatchObject({
      optimalHours: expect.arrayContaining([14]), // Peak effectiveness time
      confidenceScore: expect.any(Number),
      factors: expect.arrayContaining([
        'HISTORICAL_EFFECTIVENESS',
        'PAIN_PATTERN',
        'DAILY_ROUTINE'
      ])
    });
  });

  it('should predict potential side effects', async () => {
    // Set up resident profile and medication history
    await prisma.residentProfile.update({
      where: { id: residentId },
      data: {
        age: 75,
        medicalConditions: ['DIABETES', 'HYPERTENSION'],
        allergies: ['NSAIDS']
      }
    });

    const prediction = await aiService.predictSideEffects({
      residentId,
      medicationId: 'test-med-1',
      proposedDosage: '10mg',
      frequency: 'TWICE_DAILY'
    });

    expect(prediction).toMatchObject({
      highRiskEffects: expect.arrayContaining([
        expect.objectContaining({
          effect: 'DIZZINESS',
          probability: expect.any(Number),
          riskFactors: expect.arrayContaining(['AGE', 'HYPERTENSION'])
        })
      ]),
      recommendedPrecautions: expect.arrayContaining([
        'MONITOR_BLOOD_PRESSURE',
        'FALL_PREVENTION'
      ]),
      alternativeMedications: expect.any(Array)
    });
  });

  it('should predict pain management outcomes', async () => {
    const prediction = await aiService.predictOutcomes({
      residentId,
      currentPlan: {
        medications: [{
          id: 'test-med-1',
          dosage: '10mg',
          frequency: 'TWICE_DAILY'
        }],
        nonPharmacological: ['PHYSIOTHERAPY', 'HEAT_THERAPY']
      },
      timeframe: '4_WEEKS'
    });

    expect(prediction).toMatchObject({
      expectedPainReduction: expect.any(Number),
      probabilityOfSuccess: expect.any(Number),
      potentialChallenges: expect.any(Array),
      recommendedAdjustments: expect.any(Array),
      confidenceInterval: {
        lower: expect.any(Number),
        upper: expect.any(Number)
      }
    });
  });

  it('should adapt predictions based on resident response', async () => {
    // Record actual outcomes
    await prisma.painManagementOutcome.create({
      data: {
        residentId,
        medicationId: 'test-med-1',
        predictedEffectiveness: 4,
        actualEffectiveness: 2,
        factors: ['STRESS', 'POOR_SLEEP'],
        tenantId: tenantContext.tenantId
      }
    });

    const adaptedPrediction = await aiService.getAdaptedPrediction({
      residentId,
      medicationId: 'test-med-1',
      considerFactors: ['STRESS', 'SLEEP_QUALITY']
    });

    expect(adaptedPrediction).toMatchObject({
      adjustedEffectiveness: expect.any(Number),
      confidenceScore: expect.any(Number),
      learningFactors: expect.arrayContaining([
        'STRESS_IMPACT',
        'SLEEP_CORRELATION'
      ]),
      recommendedInterventions: expect.arrayContaining([
        'STRESS_MANAGEMENT',
        'SLEEP_HYGIENE'
      ])
    });
  });
}); 