/**
 * @fileoverview Pain Medication Audit Trail Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { AuditService } from '@/features/medications/services/auditService';
import { MARService } from '@/features/medications/services/marService';
import { RegionalComplianceService } from '@/features/medications/services/regionalCompliance';
import { createTestTenant, createTestResident } from '@/lib/testing';

describe('Pain Medication Audit Trail', () => {
  let auditService: AuditService;
  let marService: MARService;
  let complianceService: RegionalComplianceService;
  let residentId: string;
  let tenantContext;

  beforeAll(async () => {
    tenantContext = await createTestTenant();
    const resident = await createTestResident(tenantContext.tenantId);
    residentId = resident.id;

    auditService = new AuditService(tenantContext);
    marService = new MARService(tenantContext);
    complianceService = new RegionalComplianceService(tenantContext);
  });

  it('should track medication administration audit trail', async () => {
    // Create medication administration record
    const administration = await marService.recordMedicationAdministration({
      residentId,
      medicationId: 'test-med-1',
      dosage: '10mg',
      administeredBy: 'NURSE-123',
      administeredAt: new Date(),
      painScore: 7
    });

    // Verify audit trail creation
    const auditTrail = await auditService.getMedicationAuditTrail(
      administration.id
    );

    expect(auditTrail).toMatchObject({
      type: 'MEDICATION_ADMINISTRATION',
      action: 'CREATE',
      performedBy: 'NURSE-123',
      details: {
        medicationId: 'test-med-1',
        dosage: '10mg',
        painScore: 7
      },
      metadata: {
        deviceId: expect.any(String),
        ipAddress: expect.any(String),
        location: expect.any(String)
      }
    });
  });

  it('should track prescription modifications', async () => {
    // Create a series of prescription changes
    const changes = [
      { dosage: '5mg', reason: 'INITIAL_PRESCRIPTION' },
      { dosage: '7.5mg', reason: 'INADEQUATE_PAIN_CONTROL' },
      { dosage: '10mg', reason: 'PAIN_SPECIALIST_RECOMMENDATION' }
    ];

    for (const change of changes) {
      await marService.updatePrescription({
        residentId,
        medicationId: 'test-med-1',
        changes: {
          dosage: change.dosage,
          modifiedBy: 'GP-123',
          reason: change.reason
        }
      });
    }

    // Verify prescription audit trail
    const prescriptionHistory = await auditService.getPrescriptionHistory(
      residentId,
      'test-med-1'
    );

    expect(prescriptionHistory).toHaveLength(3);
    expect(prescriptionHistory[0]).toMatchObject({
      type: 'PRESCRIPTION_MODIFICATION',
      oldValue: { dosage: '7.5mg' },
      newValue: { dosage: '10mg' },
      reason: 'PAIN_SPECIALIST_RECOMMENDATION',
      authorizedBy: 'GP-123'
    });
  });

  it('should maintain regulatory compliance records', async () => {
    // Set up compliance requirements
    await complianceService.setRegionalRequirements({
      region: 'ENGLAND',
      requirements: ['CQC_CONTROLLED_DRUGS', 'NHS_PRESCRIBING_STANDARDS']
    });

    // Record controlled drug administration
    await marService.recordControlledDrugAdministration({
      residentId,
      medicationId: 'controlled-med-1',
      dosage: '5mg',
      administeredBy: 'NURSE-123',
      witnessedBy: 'NURSE-456'
    });

    // Verify compliance audit trail
    const complianceAudit = await auditService.getComplianceAuditTrail(
      residentId,
      'controlled-med-1'
    );

    expect(complianceAudit).toMatchObject({
      type: 'CONTROLLED_DRUG_ADMINISTRATION',
      complianceStandards: ['CQC_CONTROLLED_DRUGS'],
      signatures: [
        { role: 'ADMINISTRATOR', staffId: 'NURSE-123' },
        { role: 'WITNESS', staffId: 'NURSE-456' }
      ],
      verifications: [
        { type: 'STOCK_CHECK', status: 'COMPLETED' },
        { type: 'DOUBLE_SIGNATURE', status: 'VERIFIED' }
      ]
    });
  });

  it('should track access to sensitive medication records', async () => {
    // Simulate various record accesses
    const accessEvents = [
      { staffId: 'NURSE-123', purpose: 'MEDICATION_ADMINISTRATION' },
      { staffId: 'GP-456', purpose: 'PRESCRIPTION_REVIEW' },
      { staffId: 'PHARMACIST-789', purpose: 'MEDICATION_REVIEW' }
    ];

    for (const event of accessEvents) {
      await auditService.recordAccessEvent({
        residentId,
        staffId: event.staffId,
        recordType: 'CONTROLLED_MEDICATION',
        purpose: event.purpose
      });
    }

    // Verify access audit trail
    const accessLogs = await auditService.getAccessLogs(residentId);

    expect(accessLogs).toHaveLength(3);
    expect(accessLogs[0]).toMatchObject({
      staffId: expect.any(String),
      accessType: 'READ',
      timestamp: expect.any(Date),
      purpose: expect.any(String),
      authorized: true
    });

    // Verify unauthorized access attempts are logged
    const unauthorizedAccess = await auditService.recordAccessEvent({
      residentId,
      staffId: 'UNAUTHORIZED-STAFF',
      recordType: 'CONTROLLED_MEDICATION',
      purpose: 'ATTEMPTED_ACCESS'
    });

    expect(unauthorizedAccess).toMatchObject({
      status: 'DENIED',
      reason: 'INSUFFICIENT_PERMISSIONS',
      escalated: true
    });
  });
}); 