/**
 * @fileoverview Pain Medication Pharmacy Integration Tests
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';
import { PharmacyIntegration } from '@/features/medications/services/pharmacyIntegration';
import { createTestTenant, createTestResident } from '@/lib/testing';

describe('Pain Medication Pharmacy Integration', () => {
  let pharmacyService: PharmacyIntegration;
  let residentId: string;

  beforeAll(async () => {
    const tenantContext = await createTestTenant();
    const resident = await createTestResident(tenantContext.tenantId);
    residentId = resident.id;
    pharmacyService = new PharmacyIntegration(tenantContext);
  });

  it('should automatically reorder when stock is low', async () => {
    // Set up initial stock level
    await prisma.medicationStock.create({
      data: {
        medicationId: 'test-med-1',
        quantity: 5, // Below reorder threshold
        reorderThreshold: 10,
        standardOrderQuantity: 30,
        tenantId: tenantContext.tenantId
      }
    });

    // Trigger stock check
    await pharmacyService.checkAndUpdateStock('test-med-1');

    // Verify order creation
    const order = await prisma.medicationOrder.findFirst({
      where: {
        medicationId: 'test-med-1',
        status: 'PENDING',
        tenantId: tenantContext.tenantId
      }
    });

    expect(order).toMatchObject({
      quantity: 30,
      orderType: 'AUTOMATIC',
      priority: 'NORMAL',
      deliveryPreference: 'STANDARD'
    });

    // Verify pharmacy notification
    const notification = await prisma.pharmacyNotification.findFirst({
      where: {
        orderId: order.id,
        type: 'NEW_ORDER'
      }
    });
    expect(notification).toBeTruthy();
  });

  it('should handle emergency prescriptions', async () => {
    const emergencyRequest = {
      residentId,
      medicationId: 'emergency-med-1',
      reason: 'SEVERE_PAIN',
      requiredWithin: '4_HOURS',
      prescribedBy: 'GP-12345'
    };

    const response = await pharmacyService.requestEmergencyMedication(emergencyRequest);

    expect(response).toMatchObject({
      status: 'ACCEPTED',
      estimatedDelivery: expect.any(Date),
      deliveryMethod: 'URGENT_COURIER',
      trackingCode: expect.any(String)
    });

    // Verify emergency protocols
    const emergencyRecord = await prisma.emergencyMedicationRequest.findFirst({
      where: {
        residentId,
        medicationId: 'emergency-med-1'
      }
    });
    expect(emergencyRecord).toMatchObject({
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      escalationLevel: 'PHARMACY_MANAGER'
    });
  });

  it('should validate controlled drug prescriptions', async () => {
    const controlledPrescription = {
      residentId,
      medicationId: 'controlled-med-1',
      prescriptionDetails: {
        dosage: '5mg',
        frequency: 'TWICE_DAILY',
        duration: '7_DAYS'
      },
      prescribedBy: 'GP-12345'
    };

    await pharmacyService.processControlledDrugPrescription(controlledPrescription);

    // Verify validation checks
    const validationRecord = await prisma.controlledDrugValidation.findFirst({
      where: {
        prescriptionId: expect.any(String),
        medicationId: 'controlled-med-1'
      }
    });

    expect(validationRecord).toMatchObject({
      status: 'VALIDATED',
      validatedBy: expect.any(String),
      checks: expect.arrayContaining([
        'PRESCRIBER_VERIFICATION',
        'QUANTITY_LIMITS',
        'RESIDENT_ELIGIBILITY'
      ])
    });

    // Verify required signatures
    const signatures = await prisma.controlledDrugSignature.findMany({
      where: {
        prescriptionId: validationRecord.prescriptionId
      }
    });

    expect(signatures).toHaveLength(2); // Pharmacist and witness signatures
    expect(signatures[0]).toMatchObject({
      role: 'PHARMACIST',
      signatureType: 'ELECTRONIC',
      verified: true
    });
  });

  it('should manage medication returns and disposals', async () => {
    const returnRequest = {
      residentId,
      medicationId: 'test-med-1',
      quantity: 5,
      reason: 'COURSE_COMPLETED',
      condition: 'UNOPENED'
    };

    await pharmacyService.processMedicationReturn(returnRequest);

    // Verify return record
    const returnRecord = await prisma.medicationReturn.findFirst({
      where: {
        residentId,
        medicationId: 'test-med-1'
      }
    });

    expect(returnRecord).toMatchObject({
      status: 'PROCESSED',
      disposalMethod: 'PHARMACY_RETURN',
      witnessedBy: expect.any(String)
    });

    // Verify stock adjustment
    const stockAdjustment = await prisma.stockAdjustment.findFirst({
      where: {
        medicationId: 'test-med-1',
        type: 'RETURN'
      }
    });

    expect(stockAdjustment).toMatchObject({
      quantity: -5,
      reason: 'COURSE_COMPLETED',
      adjustedBy: expect.any(String)
    });
  });

  it('should handle medication substitutions', async () => {
    const substitutionRequest = {
      originalMedicationId: 'test-med-1',
      residentId,
      reason: 'STOCK_UNAVAILABLE',
      requiredProperties: ['SAME_ACTIVE_INGREDIENT', 'SAME_STRENGTH']
    };

    const substitution = await pharmacyService.findMedicationSubstitute(substitutionRequest);

    expect(substitution).toMatchObject({
      substituteMedicationId: expect.any(String),
      equivalenceType: 'GENERIC_EQUIVALENT',
      pharmacistApproval: {
        approved: true,
        approvedBy: expect.any(String),
        clinicalReasoning: expect.any(String)
      },
      prescriberNotification: {
        sent: true,
        acknowledgedBy: expect.any(String)
      }
    });
  });
}); 