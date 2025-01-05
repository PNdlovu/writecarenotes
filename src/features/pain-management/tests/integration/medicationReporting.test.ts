/**
 * @fileoverview Pain Medication Reporting Tests
 */

import { prisma } from '@/lib/prisma';
import { PainMedicationReporting } from '../../services/medicationReporting';
import { createTestTenant, createTestResident } from '@/lib/testing';
import { ResidentPainAssessment, CareHomeInterventionType } from '../../types/care-home';

describe('Pain Medication Reporting', () => {
  let tenantContext;
  let residentId: string;
  let reportingService: PainMedicationReporting;

  beforeAll(async () => {
    tenantContext = await createTestTenant();
    const resident = await createTestResident(tenantContext.tenantId);
    residentId = resident.id;
    reportingService = new PainMedicationReporting(tenantContext);
  });

  beforeEach(async () => {
    await prisma.painAssessment.deleteMany({
      where: { tenantId: tenantContext.tenantId }
    });
  });

  it('should analyze PRN usage patterns correctly', async () => {
    // Create test assessments with PRN interventions
    await createTestAssessments(residentId, [
      { painScore: 7, effectiveness: 4 },
      { painScore: 6, effectiveness: 3 },
      { painScore: 8, effectiveness: 2 }
    ]);

    const report = await reportingService.generateMedicationEffectivenessReport({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    });

    expect(report.prnUsage).toHaveLength(1);
    expect(report.prnUsage[0].effectiveRate).toBe(66.67);
    expect(report.prnUsage[0].totalUses).toBe(3);
  });

  it('should identify escalation patterns', async () => {
    // Create test assessments with escalations
    await createTestAssessments(residentId, [
      { painScore: 8, notifiedNurse: true, gpNotified: true },
      { painScore: 7, notifiedNurse: true },
      { painScore: 6, notifiedNurse: false }
    ]);

    const report = await reportingService.generateMedicationEffectivenessReport({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    });

    expect(report.escalationPatterns.highPainIncidents).toBe(2);
    expect(report.escalationPatterns.escalationsToNurse).toBe(2);
    expect(report.escalationPatterns.escalationsToGP).toBe(1);
  });

  it('should track medication effectiveness over time', async () => {
    const assessments = [
      {
        painScore: 8,
        interventions: [{
          type: CareHomeInterventionType.PRN_MEDICATION,
          medicationId: 'test-med-1',
          effectiveness: 4,
          startTime: new Date('2024-03-21T10:00:00Z')
        }]
      },
      {
        painScore: 6,
        interventions: [{
          type: CareHomeInterventionType.PRN_MEDICATION,
          medicationId: 'test-med-1',
          effectiveness: 3,
          startTime: new Date('2024-03-21T14:00:00Z')
        }]
      },
      {
        painScore: 7,
        interventions: [{
          type: CareHomeInterventionType.PRN_MEDICATION,
          medicationId: 'test-med-1',
          effectiveness: 2,
          startTime: new Date('2024-03-21T18:00:00Z')
        }]
      }
    ];

    await createTestAssessments(residentId, assessments);

    const report = await reportingService.generateMedicationEffectivenessReport({
      start: new Date('2024-03-21T00:00:00Z'),
      end: new Date('2024-03-22T00:00:00Z')
    });

    expect(report.medicationEffectiveness).toHaveLength(1);
    expect(report.medicationEffectiveness[0]).toMatchObject({
      medicationId: 'test-med-1',
      averageInitialPain: 7,
      averagePainReduction: 3,
      medianResponseTime: expect.any(Number)
    });
  });

  it('should generate appropriate recommendations', async () => {
    const assessments = [
      // Ineffective medication
      {
        painScore: 8,
        interventions: [{
          type: CareHomeInterventionType.PRN_MEDICATION,
          medicationId: 'test-med-2',
          effectiveness: 1,
          startTime: new Date()
        }]
      },
      // Frequently used effective medication
      {
        painScore: 7,
        interventions: [{
          type: CareHomeInterventionType.PRN_MEDICATION,
          medicationId: 'test-med-3',
          effectiveness: 4,
          startTime: new Date()
        }]
      }
    ];

    await createTestAssessments(residentId, assessments);

    const report = await reportingService.generateMedicationEffectivenessReport({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    });

    const recommendations = report.recommendations;
    expect(recommendations).toContainEqual(expect.objectContaining({
      type: 'MEDICATION_REVIEW',
      priority: 'HIGH',
      description: expect.stringContaining('test-med-2')
    }));
  });
}); 