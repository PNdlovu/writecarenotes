/**
 * @fileoverview Pain Medication Stock Tests
 */

import { prisma } from '@/lib/prisma';
import { PainMedicationStockService } from '../../services/painMedicationStock';
import { StockManagementService } from '@/features/medications/services/stockManagement';
import { PrescriptionService } from '@/features/medications/services/prescriptionService';
import { createTestTenant, createTestResident } from '@/lib/testing';
import { ResidentPainAssessment, CareHomeInterventionType } from '../../types/care-home';

describe('Pain Medication Stock Management', () => {
  let tenantContext;
  let residentId: string;
  let stockService: PainMedicationStockService;
  let testMedicationId: string;

  beforeAll(async () => {
    tenantContext = await createTestTenant();
    const resident = await createTestResident(tenantContext.tenantId);
    residentId = resident.id;
    
    const stockManagement = new StockManagementService(tenantContext);
    const prescriptionService = new PrescriptionService(tenantContext);
    stockService = new PainMedicationStockService(
      tenantContext,
      stockManagement,
      prescriptionService
    );

    // Create test medication
    testMedicationId = await createTestMedication();
  });

  beforeEach(async () => {
    await prisma.stockLevel.deleteMany({
      where: { tenantId: tenantContext.tenantId }
    });
    await prisma.stockAlert.deleteMany({
      where: { tenantId: tenantContext.tenantId }
    });
  });

  it('should validate stock availability correctly', async () => {
    const assessment: ResidentPainAssessment = {
      residentId,
      painScore: 7,
      interventions: [{
        type: CareHomeInterventionType.PRN_MEDICATION,
        medicationId: testMedicationId,
        startTime: new Date()
      }]
    };

    // Set stock level below minimum
    await setTestStockLevel(testMedicationId, 2);

    const isAvailable = await stockService.validateStockAvailability(assessment);
    expect(isAvailable).toBe(false);

    // Check if alert was created
    const alert = await prisma.stockAlert.findFirst({
      where: {
        medicationId: testMedicationId,
        alertType: 'LOW_STOCK'
      }
    });
    expect(alert).toBeTruthy();
  });

  it('should initiate reorder when stock is low', async () => {
    const assessment: ResidentPainAssessment = {
      residentId,
      painScore: 7,
      interventions: [{
        type: CareHomeInterventionType.PRN_MEDICATION,
        medicationId: testMedicationId,
        startTime: new Date()
      }]
    };

    await setTestStockLevel(testMedicationId, 1);
    await stockService.validateStockAvailability(assessment);

    const order = await prisma.medicationOrder.findFirst({
      where: {
        medicationId: testMedicationId,
        reason: 'LOW_STOCK_PAIN_MEDICATION'
      }
    });
    expect(order).toBeTruthy();
    expect(order.urgency).toBe('HIGH');
  });
}); 