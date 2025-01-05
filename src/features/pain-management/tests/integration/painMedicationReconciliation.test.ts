/**
 * @fileoverview Pain Medication Reconciliation Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { MedicationReconciliationService } from '@/features/medications/services/medicationReconciliation';
import { HealthcareIntegration } from '@/features/medications/services/healthcareIntegration';
import { PrescriptionService } from '@/features/medications/services/prescriptionService';
import { createTestTenant, createTestResident } from '@/lib/testing';

describe('Pain Medication Reconciliation', () => {
  let reconciliationService: MedicationReconciliationService;
  let healthcareService: HealthcareIntegration;
  let prescriptionService: PrescriptionService;
  let residentId: string;
  let tenantContext;

  beforeAll(async () => {
    tenantContext = await createTestTenant();
    const resident = await createTestResident(tenantContext.tenantId);
    residentId = resident.id;

    reconciliationService = new MedicationReconciliationService(tenantContext);
    healthcareService = new HealthcareIntegration(tenantContext);
    prescriptionService = new PrescriptionService(tenantContext);
  });

  it('should reconcile medications after hospital discharge', async () => {
    // Set up hospital discharge medications
    const dischargeMedications = [
      {
        name: 'Morphine Sulfate',
        dosage: '10mg',
        frequency: 'TWICE_DAILY',
        route: 'ORAL',
        startDate: new Date(),
        prescribedBy: 'HOSPITAL-DOC-123'
      },
      {
        name: 'Paracetamol',
        dosage: '1000mg',
        frequency: 'FOUR_TIMES_DAILY',
        route: 'ORAL',
        startDate: new Date(),
        prescribedBy: 'HOSPITAL-DOC-123'
      }
    ];

    const reconciliation = await reconciliationService.reconcileHospitalDischarge({
      residentId,
      dischargeMedications,
      dischargeDate: new Date(),
      hospitalReference: 'HOSP-123'
    });

    expect(reconciliation).toMatchObject({
      status: 'COMPLETED',
      source: 'HOSPITAL_DISCHARGE',
      changes: expect.arrayContaining([
        expect.objectContaining({
          type: 'NEW_MEDICATION',
          medication: expect.objectContaining({
            name: 'Morphine Sulfate'
          })
        })
      ]),
      verifications: expect.arrayContaining([
        'DOSAGE_CHECK',
        'INTERACTION_CHECK',
        'DUPLICATE_THERAPY_CHECK'
      ])
    });
  });

  it('should handle cross-border medication reconciliation', async () => {
    // Set up medications prescribed in different regions
    const prescriptions = [
      {
        region: 'SCOTLAND',
        medications: [{
          name: 'Codeine',
          dosage: '30mg',
          frequency: 'FOUR_TIMES_DAILY'
        }]
      },
      {
        region: 'ENGLAND',
        medications: [{
          name: 'Co-codamol',
          dosage: '30/500mg',
          frequency: 'FOUR_TIMES_DAILY'
        }]
      }
    ];

    const reconciliation = await reconciliationService.reconcileCrossBorderMedications({
      residentId,
      prescriptions,
      primaryRegion: 'ENGLAND'
    });

    expect(reconciliation).toMatchObject({
      status: 'REQUIRES_REVIEW',
      conflicts: expect.arrayContaining([{
        type: 'DUPLICATE_THERAPY',
        medications: ['Codeine', 'Co-codamol'],
        recommendation: 'CONSOLIDATE_TO_SINGLE_THERAPY'
      }]),
      regulatoryChecks: expect.arrayContaining([
        'CQC_COMPLIANCE',
        'CONTROLLED_DRUG_REGULATIONS'
      ])
    });
  });

  it('should reconcile medications from multiple providers', async () => {
    // Set up medications from different providers
    const providerMedications = [
      {
        provider: 'GP',
        medications: [{
          name: 'Tramadol',
          dosage: '50mg',
          frequency: 'FOUR_TIMES_DAILY'
        }]
      },
      {
        provider: 'PAIN_CLINIC',
        medications: [{
          name: 'Gabapentin',
          dosage: '300mg',
          frequency: 'THREE_TIMES_DAILY'
        }]
      },
      {
        provider: 'PRIVATE_CONSULTANT',
        medications: [{
          name: 'Amitriptyline',
          dosage: '10mg',
          frequency: 'ONCE_DAILY'
        }]
      }
    ];

    const reconciliation = await reconciliationService.reconcileMultiProviderMedications({
      residentId,
      providerMedications
    });

    expect(reconciliation).toMatchObject({
      status: 'COMPLETED',
      interactionChecks: expect.arrayContaining([{
        medications: ['Tramadol', 'Gabapentin'],
        severity: 'MODERATE',
        recommendation: 'MONITOR_SEDATION'
      }]),
      consolidatedPlan: {
        primaryPrescriber: 'GP',
        medications: expect.arrayContaining([
          expect.objectContaining({ name: 'Tramadol' }),
          expect.objectContaining({ name: 'Gabapentin' }),
          expect.objectContaining({ name: 'Amitriptyline' })
        ])
      }
    });
  });

  it('should handle medication substitutions during shortages', async () => {
    const shortageReconciliation = await reconciliationService.handleMedicationShortage({
      residentId,
      originalMedication: {
        name: 'Oxycodone',
        dosage: '5mg',
        frequency: 'FOUR_TIMES_DAILY'
      },
      availableAlternatives: [
        {
          name: 'Morphine Sulfate',
          dosage: '10mg',
          frequency: 'FOUR_TIMES_DAILY',
          equivalence: 'DIRECT_CONVERSION'
        }
      ]
    });

    expect(shortageReconciliation).toMatchObject({
      status: 'COMPLETED',
      substitution: {
        original: expect.objectContaining({ name: 'Oxycodone' }),
        replacement: expect.objectContaining({ name: 'Morphine Sulfate' }),
        conversionRationale: expect.any(String),
        clinicalApproval: expect.objectContaining({
          approvedBy: expect.any(String),
          date: expect.any(Date)
        })
      },
      monitoringPlan: {
        frequency: 'DAILY',
        parameters: ['PAIN_SCORE', 'SIDE_EFFECTS', 'EFFECTIVENESS']
      }
    });
  });
}); 