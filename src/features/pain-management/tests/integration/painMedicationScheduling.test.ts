/**
 * @fileoverview Pain Medication Scheduling Integration Tests
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';
import { PainMedicationSchedulingService } from '../../services/painMedicationScheduling';
import { MARService } from '@/features/medications/services/marService';
import { PrescriptionService } from '@/features/medications/services/prescriptionService';
import { PRNTracking } from '@/features/medications/services/prnTracking';
import { createTestTenant, createTestResident } from '@/lib/testing';
import { ResidentPainAssessment, CareHomeInterventionType } from '../../types/care-home';

describe('Pain Medication Scheduling Integration', () => {
  let tenantContext;
  let residentId: string;
  let schedulingService: PainMedicationSchedulingService;
  let marService: MARService;
  let prnTracking: PRNTracking;

  beforeAll(async () => {
    tenantContext = await createTestTenant();
    const resident = await createTestResident(tenantContext.tenantId);
    residentId = resident.id;

    marService = new MARService(tenantContext);
    const prescriptionService = new PrescriptionService(tenantContext);
    prnTracking = new PRNTracking(tenantContext);

    schedulingService = new PainMedicationSchedulingService(
      tenantContext,
      marService,
      prescriptionService,
      prnTracking
    );
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.painAssessment.deleteMany({
      where: { tenantId: tenantContext.tenantId }
    });
    await prisma.medicationAdministrationRecord.deleteMany({
      where: { tenantId: tenantContext.tenantId }
    });
    await prisma.prnTracking.deleteMany({
      where: { tenantId: tenantContext.tenantId }
    });
  });

  it('should record PRN with pain context correctly', async () => {
    const assessment: ResidentPainAssessment = {
      residentId,
      painScore: 6,
      painLocation: 'LOWER_BACK',
      triggers: ['MOVEMENT', 'POSITION_CHANGE'],
      assessmentDate: new Date(),
      interventions: [{
        type: CareHomeInterventionType.PRN_MEDICATION,
        medicationId: 'test-med-1',
        startTime: new Date(),
        effectiveness: 3
      }]
    };

    await schedulingService.handlePainAssessment(assessment);

    // Verify PRN record with context
    const prnRecord = await prisma.prnTracking.findFirst({
      where: {
        residentId,
        medicationId: 'test-med-1'
      }
    });

    expect(prnRecord).toBeTruthy();
    expect(prnRecord.context).toMatchObject({
      type: 'PAIN_ASSESSMENT',
      painScore: 6,
      location: 'LOWER_BACK'
    });
  });

  it('should schedule appropriate follow-up for high pain score', async () => {
    const assessment: ResidentPainAssessment = {
      residentId,
      painScore: 8,
      assessmentDate: new Date(),
      interventions: [{
        type: CareHomeInterventionType.PRN_MEDICATION,
        medicationId: 'test-med-1',
        startTime: new Date()
      }]
    };

    await schedulingService.handlePainAssessment(assessment);

    // Verify follow-up schedule
    const followUp = await marService.getScheduledFollowUps(residentId);
    expect(followUp[0]).toMatchObject({
      timing: 'ONSET_OF_ACTION',
      requireNurseReview: true,
      escalateToGP: true,
      monitoringFrequency: 'EVERY_2_HOURS'
    });
  });

  it('should retrieve pain-specific assessment history', async () => {
    // Create some test PRN records
    await prnTracking.recordPRNWithContext({
      residentId,
      medicationId: 'test-med-1',
      context: {
        type: 'PAIN_ASSESSMENT',
        painScore: 5
      }
    });

    await prnTracking.recordPRNWithContext({
      residentId,
      medicationId: 'test-med-2',
      context: {
        type: 'OTHER_ASSESSMENT'
      }
    });

    const history = await schedulingService.getPainAssessmentHistory(residentId);
    
    expect(history).toHaveLength(1);
    expect(history[0].context.type).toBe('PAIN_ASSESSMENT');
  });

  it('should handle moderate pain follow-up requirements', async () => {
    const assessment: ResidentPainAssessment = {
      residentId,
      painScore: 5,
      assessmentDate: new Date(),
      interventions: [{
        type: CareHomeInterventionType.PRN_MEDICATION,
        medicationId: 'test-med-1',
        startTime: new Date()
      }]
    };

    await schedulingService.handlePainAssessment(assessment);

    const followUp = await marService.getScheduledFollowUps(residentId);
    expect(followUp[0]).toMatchObject({
      timing: 'PEAK_EFFECT',
      requireNurseReview: true,
      escalateToGP: false,
      monitoringFrequency: 'EVERY_4_HOURS'
    });
  });

  it('should handle missing medication records gracefully', async () => {
    const assessment: ResidentPainAssessment = {
      residentId,
      painScore: 6,
      assessmentDate: new Date(),
      interventions: [{
        type: CareHomeInterventionType.PRN_MEDICATION,
        medicationId: 'non-existent-med',
        startTime: new Date()
      }]
    };

    await expect(schedulingService.handlePainAssessment(assessment))
      .rejects
      .toThrow('Medication not found in resident prescription');
  });

  it('should enforce regional compliance requirements', async () => {
    // Set tenant region to Scotland
    await prisma.tenant.update({
      where: { id: tenantContext.tenantId },
      data: { region: 'SCOTLAND' }
    });

    const assessment: ResidentPainAssessment = {
      residentId,
      painScore: 7,
      assessmentDate: new Date(),
      interventions: [{
        type: CareHomeInterventionType.PRN_MEDICATION,
        medicationId: 'test-med-1',
        startTime: new Date()
      }]
    };

    await schedulingService.handlePainAssessment(assessment);

    // Verify Scottish requirements (e.g., Care Inspectorate notification)
    const followUp = await marService.getScheduledFollowUps(residentId);
    expect(followUp[0]).toMatchObject({
      requireCareInspectorateNotification: true,
      requireTwoPersonVerification: true
    });
  });

  it('should handle end-of-life care requirements differently', async () => {
    // Set resident as end-of-life care
    await prisma.resident.update({
      where: { id: residentId },
      data: { careType: 'END_OF_LIFE' }
    });

    const assessment: ResidentPainAssessment = {
      residentId,
      painScore: 4, // Even moderate pain gets escalated for end-of-life
      assessmentDate: new Date(),
      interventions: [{
        type: CareHomeInterventionType.PRN_MEDICATION,
        medicationId: 'test-med-1',
        startTime: new Date()
      }]
    };

    await schedulingService.handlePainAssessment(assessment);

    const followUp = await marService.getScheduledFollowUps(residentId);
    expect(followUp[0]).toMatchObject({
      timing: 'ONSET_OF_ACTION',
      requireNurseReview: true,
      escalateToGP: true,
      monitoringFrequency: 'EVERY_2_HOURS',
      palliativeCareReview: true
    });
  });

  it('should handle concurrent medication administrations', async () => {
    const assessment: ResidentPainAssessment = {
      residentId,
      painScore: 6,
      assessmentDate: new Date(),
      interventions: [
        {
          type: CareHomeInterventionType.PRN_MEDICATION,
          medicationId: 'test-med-1',
          startTime: new Date()
        },
        {
          type: CareHomeInterventionType.PRN_MEDICATION,
          medicationId: 'test-med-2',
          startTime: new Date()
        }
      ]
    };

    await schedulingService.handlePainAssessment(assessment);

    // Verify interaction checks were performed
    const interactions = await prisma.medicationInteractionCheck.findMany({
      where: { residentId }
    });
    expect(interactions).toHaveLength(1);
    expect(interactions[0].medications).toContain('test-med-1');
    expect(interactions[0].medications).toContain('test-med-2');
  });

  it('should respect medication timing restrictions', async () => {
    // Set up a medication with timing restrictions
    await prisma.medication.update({
      where: { id: 'test-med-1' },
      data: {
        timingRestrictions: {
          minimumInterval: 4, // hours
          maximumDailyDoses: 4
        }
      }
    });

    // Create recent administration
    await prnTracking.recordPRNWithContext({
      residentId,
      medicationId: 'test-med-1',
      administeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      context: { type: 'PAIN_ASSESSMENT' }
    });

    const assessment: ResidentPainAssessment = {
      residentId,
      painScore: 6,
      assessmentDate: new Date(),
      interventions: [{
        type: CareHomeInterventionType.PRN_MEDICATION,
        medicationId: 'test-med-1',
        startTime: new Date()
      }]
    };

    await expect(schedulingService.handlePainAssessment(assessment))
      .rejects
      .toThrow('Minimum interval between doses not met');
  });
}); 