/**
 * @fileoverview Pain Medication Side Effects Tracking Tests
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';
import { PainMedicationSchedulingService } from '../../services/painMedicationScheduling';
import { SideEffectTracking } from '@/features/medications/services/sideEffectTracking';
import { createTestTenant, createTestResident } from '@/lib/testing';

describe('Pain Medication Side Effects', () => {
  let tenantContext;
  let residentId: string;
  let sideEffectService: SideEffectTracking;

  beforeAll(async () => {
    tenantContext = await createTestTenant();
    const resident = await createTestResident(tenantContext.tenantId);
    residentId = resident.id;
    sideEffectService = new SideEffectTracking(tenantContext);
  });

  it('should track side effects over time', async () => {
    const sideEffects = [
      { type: 'DROWSINESS', severity: 'MILD', duration: 120 }, // 2 hours
      { type: 'NAUSEA', severity: 'MODERATE', duration: 60 },
      { type: 'CONSTIPATION', severity: 'SEVERE', duration: 1440 } // 24 hours
    ];

    for (const effect of sideEffects) {
      await sideEffectService.recordSideEffect({
        residentId,
        medicationId: 'test-med-1',
        ...effect,
        reportedAt: new Date()
      });
    }

    const analysis = await sideEffectService.analyzeSideEffects(residentId, 'test-med-1');
    expect(analysis).toMatchObject({
      mostCommon: 'DROWSINESS',
      mostSevere: 'CONSTIPATION',
      requiresReview: true
    });
  });

  it('should correlate side effects with pain scores', async () => {
    // Create pain assessments with side effects
    const assessments = [
      {
        painScore: 8,
        sideEffects: [{ type: 'DROWSINESS', severity: 'SEVERE' }]
      },
      {
        painScore: 6,
        sideEffects: [{ type: 'DROWSINESS', severity: 'MODERATE' }]
      },
      {
        painScore: 4,
        sideEffects: [{ type: 'DROWSINESS', severity: 'MILD' }]
      }
    ];

    for (const data of assessments) {
      await sideEffectService.recordSideEffectWithContext({
        residentId,
        medicationId: 'test-med-1',
        painScore: data.painScore,
        sideEffects: data.sideEffects,
        reportedAt: new Date()
      });
    }

    const correlation = await sideEffectService.analyzeSideEffectCorrelation(
      residentId,
      'test-med-1'
    );

    expect(correlation).toMatchObject({
      sideEffectSeverityCorrelation: {
        painScore: 'POSITIVE', // Higher pain scores correlate with more severe side effects
        confidence: expect.any(Number)
      },
      recommendations: expect.arrayContaining([
        expect.objectContaining({
          type: 'DOSAGE_REVIEW',
          reason: 'SIDE_EFFECT_CORRELATION'
        })
      ])
    });
  });

  it('should track cumulative effects of multiple medications', async () => {
    // Set up multiple medications with side effects
    const medications = ['test-med-1', 'test-med-2'];
    
    for (const medicationId of medications) {
      await sideEffectService.recordSideEffect({
        residentId,
        medicationId,
        type: 'DROWSINESS',
        severity: 'MODERATE',
        duration: 120,
        reportedAt: new Date()
      });
    }

    const cumulativeAnalysis = await sideEffectService.analyzeCumulativeEffects(residentId);
    
    expect(cumulativeAnalysis).toMatchObject({
      riskLevel: 'HIGH',
      interactingMedications: medications,
      cumulativeEffects: expect.arrayContaining([{
        type: 'DROWSINESS',
        severity: 'SEVERE', // Cumulative effect is more severe
        contributingMedications: medications
      }]),
      recommendations: expect.arrayContaining([
        expect.objectContaining({
          type: 'MEDICATION_REVIEW',
          priority: 'HIGH',
          reason: 'CUMULATIVE_SIDE_EFFECTS'
        })
      ])
    });
  });

  it('should track side effect patterns over time of day', async () => {
    const timePatterns = [
      { hour: 8, severity: 'MILD' },
      { hour: 14, severity: 'MODERATE' },
      { hour: 20, severity: 'SEVERE' }
    ];

    for (const pattern of timePatterns) {
      const reportTime = new Date();
      reportTime.setHours(pattern.hour, 0, 0, 0);

      await sideEffectService.recordSideEffect({
        residentId,
        medicationId: 'test-med-1',
        type: 'DROWSINESS',
        severity: pattern.severity,
        reportedAt: reportTime
      });
    }

    const timeAnalysis = await sideEffectService.analyzeTimePatterns(
      residentId,
      'test-med-1'
    );

    expect(timeAnalysis).toMatchObject({
      peakSeverityTime: 20, // 8 PM
      recommendedTimingAdjustments: expect.any(Array),
      dailyPattern: expect.any(Object)
    });
  });

  it('should identify side effect risk factors', async () => {
    await sideEffectService.recordSideEffectWithContext({
      residentId,
      medicationId: 'test-med-1',
      type: 'NAUSEA',
      severity: 'MODERATE',
      contextualFactors: {
        timeOfDay: 'MORNING',
        withFood: false,
        hydrationStatus: 'LOW'
      }
    });

    const riskAnalysis = await sideEffectService.analyzeRiskFactors(
      residentId,
      'test-med-1'
    );

    expect(riskAnalysis).toMatchObject({
      identifiedRiskFactors: expect.arrayContaining([
        'TIMING',
        'EMPTY_STOMACH',
        'DEHYDRATION'
      ]),
      mitigationStrategies: expect.arrayContaining([
        expect.objectContaining({
          factor: 'EMPTY_STOMACH',
          recommendation: 'TAKE_WITH_FOOD'
        })
      ])
    });
  });
}); 