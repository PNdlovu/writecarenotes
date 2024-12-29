/**
 * @fileoverview Pain Medication Integration Tests
 */

import { prisma } from '@/lib/prisma';
import { PainMedicationIntegration } from '../../services/painMedicationIntegration';
import { MedicationComplianceChecks } from '../../services/medicationComplianceChecks';
import { createTestTenant, createTestResident } from '@/lib/testing';
import { ResidentPainAssessment, CareHomeInterventionType } from '../../types/care-home';

describe('Pain Medication Integration', () => {
  let tenantContext;
  let residentId: string;
  let medicationService: PainMedicationIntegration;
  let complianceService: MedicationComplianceChecks;

  beforeAll(async () => {
    tenantContext = await createTestTenant();
    const resident = await createTestResident(tenantContext.tenantId);
    residentId = resident.id;
    medicationService = new PainMedicationIntegration(tenantContext);
    complianceService = new MedicationComplianceChecks(tenantContext);
  });

  beforeEach(async () => {
    await prisma.painAssessment.deleteMany({
      where: { tenantId: tenantContext.tenantId }
    });
  });

  it('should handle PRN medication administration correctly', async () => {
    const assessment: ResidentPainAssessment = {
      residentId,
      painScore: 7,
      interventions: [{
        type: CareHomeInterventionType.PRN_MEDICATION,
        medicationId: 'test-med-id',
        administeredBy: 'test-nurse',
        startTime: new Date(),
        effectiveness: 4
      }]
    };

    await medicationService.handlePainMedication(assessment);

    // Check MAR entry
    const marEntry = await prisma.medicationAdministrationRecord.findFirst({
      where: { residentId }
    });
    expect(marEntry).toBeTruthy();

    // Check PRN tracking
    const prnRecord = await prisma.prnTracking.findFirst({
      where: { residentId }
    });
    expect(prnRecord).toBeTruthy();
  });

  it('should enforce compliance rules for high pain scores', async () => {
    const assessment: ResidentPainAssessment = {
      residentId,
      painScore: 8,
      interventions: [{
        type: CareHomeInterventionType.PRN_MEDICATION,
        medicationId: 'test-med-id',
        administeredBy: 'test-nurse',
        startTime: new Date()
      }]
    };

    const issues = await complianceService.checkMedicationCompliance(assessment);
    expect(issues).toContain('Missing nurse notification for high pain score');
  });
}); 