/**
 * @fileoverview Pain Tracking Integration Tests
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';
import { PainTrackingService } from '../../services/painTrackingService';
import { MedicationIntegrationService } from '../../services/medicationIntegration';
import { createTestTenant, createTestResident } from '@/lib/testing';
import { PainScale, PainType } from '../../types';

describe('Pain Tracking Integration', () => {
  let tenantContext;
  let residentId: string;
  let service: PainTrackingService;

  beforeAll(async () => {
    tenantContext = await createTestTenant();
    const resident = await createTestResident(tenantContext.tenantId);
    residentId = resident.id;
    service = new PainTrackingService(tenantContext);
  });

  beforeEach(async () => {
    await prisma.painAssessment.deleteMany({
      where: { tenantId: tenantContext.tenantId }
    });
  });

  it('should handle complete pain assessment flow', async () => {
    const assessment = {
      residentId,
      assessedBy: 'test-user',
      assessmentDate: new Date(),
      painScale: PainScale.NUMERIC,
      painScore: 8,
      painType: PainType.ACUTE,
      location: ['Lower Back'],
      characteristics: ['Sharp', 'Constant'],
      interventions: [
        {
          type: 'MEDICATION',
          medicationId: 'test-med-id',
          administeredBy: 'test-user',
          startTime: new Date(),
          effectiveness: 7
        }
      ]
    };

    await service.trackPainAssessment(assessment);

    // Verify assessment storage
    const stored = await prisma.painAssessment.findFirst({
      where: { residentId }
    });
    expect(stored).toBeTruthy();

    // Verify medication integration
    const marEntry = await prisma.medicationAdministrationRecord.findFirst({
      where: { residentId }
    });
    expect(marEntry).toBeTruthy();

    // Verify PRN tracking
    const prnRecord = await prisma.prnTracking.findFirst({
      where: { residentId }
    });
    expect(prnRecord).toBeTruthy();
  });

  // Add more integration tests...
}); 