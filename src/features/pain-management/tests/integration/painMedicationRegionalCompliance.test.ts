/**
 * @fileoverview Pain Medication Regional Compliance Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { RegionalComplianceService } from '@/features/medications/services/regionalCompliance';
import { MARService } from '@/features/medications/services/marService';
import { createTestTenant, createTestResident } from '@/lib/testing';

describe('Pain Medication Regional Compliance', () => {
  let complianceService: RegionalComplianceService;
  let marService: MARService;
  let residentId: string;
  let tenantContext;

  beforeAll(async () => {
    tenantContext = await createTestTenant();
    const resident = await createTestResident(tenantContext.tenantId);
    residentId = resident.id;

    complianceService = new RegionalComplianceService(tenantContext);
    marService = new MARService(tenantContext);
  });

  describe('CQC Requirements (England)', () => {
    beforeEach(async () => {
      await prisma.tenant.update({
        where: { id: tenantContext.tenantId },
        data: { region: 'ENGLAND' }
      });
    });

    it('should enforce CQC controlled drug requirements', async () => {
      const administration = {
        residentId,
        medicationId: 'controlled-med-1',
        dosage: '10mg',
        route: 'ORAL',
        administeredBy: 'NURSE-123'
      };

      const result = await complianceService.validateControlledDrugAdministration(
        administration
      );

      expect(result).toMatchObject({
        compliant: false,
        requiredActions: expect.arrayContaining([
          'WITNESS_SIGNATURE_REQUIRED',
          'STOCK_CHECK_REQUIRED',
          'CONTROLLED_DRUG_REGISTER_ENTRY_REQUIRED'
        ])
      });

      // Add required compliance elements
      const compliantAdministration = {
        ...administration,
        witnessedBy: 'NURSE-456',
        stockCheck: {
          performedBy: 'NURSE-123',
          verifiedBy: 'NURSE-456',
          balance: 45
        },
        registerEntry: {
          pageNumber: 12,
          entryNumber: 234
        }
      };

      const compliantResult = await complianceService.validateControlledDrugAdministration(
        compliantAdministration
      );

      expect(compliantResult.compliant).toBe(true);
    });

    it('should handle CQC documentation requirements', async () => {
      const painAssessment = {
        residentId,
        painScore: 7,
        assessmentDate: new Date(),
        medication: {
          name: 'Morphine Sulfate',
          dosage: '10mg'
        }
      };

      const documentation = await complianceService.generateCQCCompliantDocumentation(
        painAssessment
      );

      expect(documentation).toMatchObject({
        mandatoryFields: expect.arrayContaining([
          'PAIN_SCORE',
          'MEDICATION_DETAILS',
          'STAFF_SIGNATURE',
          'DATE_TIME',
          'EFFECTIVENESS_REVIEW'
        ]),
        auditTrail: expect.any(Object),
        storageRequirements: 'MINIMUM_3_YEARS'
      });
    });
  });

  describe('Care Inspectorate Requirements (Scotland)', () => {
    beforeEach(async () => {
      await prisma.tenant.update({
        where: { id: tenantContext.tenantId },
        data: { region: 'SCOTLAND' }
      });
    });

    it('should implement Scottish pain management standards', async () => {
      const assessment = {
        residentId,
        painScore: 8,
        medication: 'controlled-med-1',
        assessmentType: 'INITIAL'
      };

      const compliance = await complianceService.validateScottishPainStandards(
        assessment
      );

      expect(compliance).toMatchObject({
        requiresPharmacyReview: true,
        documentationRequirements: expect.arrayContaining([
          'PAIN_ASSESSMENT_TOOL',
          'MEDICATION_REVIEW_FORM',
          'CARE_PLAN_UPDATE'
        ]),
        reviewFrequency: 'WEEKLY'
      });
    });

    it('should handle Scottish medication recording requirements', async () => {
      const administration = {
        residentId,
        medicationId: 'controlled-med-1',
        dosage: '10mg',
        administeredBy: 'NURSE-123'
      };

      const requirements = await complianceService.getScottishRecordingRequirements(
        administration
      );

      expect(requirements).toMatchObject({
        mandatoryElements: expect.arrayContaining([
          'NHS_SCOTLAND_MAR_FORMAT',
          'CARE_INSPECTORATE_NOTIFICATION',
          'LOCAL_SUPERVISION_POLICY'
        ]),
        reviewPeriod: '24_HOURS',
        escalationCriteria: expect.any(Array)
      });
    });
  });

  describe('HIQA Requirements (Ireland)', () => {
    beforeEach(async () => {
      await prisma.tenant.update({
        where: { id: tenantContext.tenantId },
        data: { region: 'IRELAND' }
      });
    });

    it('should implement HIQA medication management standards', async () => {
      const medicationReview = {
        residentId,
        medications: ['controlled-med-1'],
        reviewType: 'QUARTERLY'
      };

      const hiqaCompliance = await complianceService.validateHIQAStandards(
        medicationReview
      );

      expect(hiqaCompliance).toMatchObject({
        compliant: true,
        requiredDocuments: expect.arrayContaining([
          'MEDICATION_MANAGEMENT_POLICY',
          'RESIDENT_ASSESSMENT',
          'PRESCRIPTION_RECORD'
        ]),
        reviewSchedule: {
          frequency: 'QUARTERLY',
          nextReviewDate: expect.any(Date)
        }
      });
    });
  });

  describe('Cross-Border Compliance', () => {
    it('should handle medication transfers between regions', async () => {
      const transfer = {
        residentId,
        fromRegion: 'ENGLAND',
        toRegion: 'SCOTLAND',
        medications: ['controlled-med-1']
      };

      const complianceCheck = await complianceService.validateCrossBorderTransfer(
        transfer
      );

      expect(complianceCheck).toMatchObject({
        requiresReconciliation: true,
        documentationUpdates: expect.arrayContaining([
          'UPDATE_MAR_FORMAT',
          'TRANSFER_DOCUMENTATION',
          'REGULATORY_NOTIFICATIONS'
        ]),
        regulatoryRequirements: {
          england: expect.any(Array),
          scotland: expect.any(Array)
        }
      });
    });
  });

  describe('CIW Requirements (Wales)', () => {
    beforeEach(async () => {
      await prisma.tenant.update({
        where: { id: tenantContext.tenantId },
        data: { region: 'WALES' }
      });
    });

    it('should enforce bilingual documentation requirements', async () => {
      const administration = {
        residentId,
        medicationId: 'controlled-med-1',
        dosage: '10mg',
        administeredBy: 'NURSE-123'
      };

      const documentation = await complianceService.generateCIWCompliantDocumentation(
        administration
      );

      expect(documentation).toMatchObject({
        languages: ['ENGLISH', 'WELSH'],
        mandatoryFields: expect.arrayContaining([
          'MEDICATION_DETAILS_BILINGUAL',
          'INSTRUCTIONS_BILINGUAL',
          'SIDE_EFFECTS_BILINGUAL'
        ]),
        translations: {
          welsh: expect.any(Object),
          english: expect.any(Object)
        }
      });
    });

    it('should handle Welsh care home specific requirements', async () => {
      const review = await complianceService.validateCIWMedicationManagement({
        residentId,
        medicationId: 'controlled-med-1'
      });

      expect(review).toMatchObject({
        responsibleIndividualReview: true,
        bilingualPolicyCompliance: true,
        welshLanguageStandards: expect.arrayContaining([
          'ACTIVE_OFFER',
          'LANGUAGE_CHOICE_RECORDED',
          'DOCUMENTATION_AVAILABLE'
        ])
      });
    });
  });

  describe('RQIA Requirements (Northern Ireland)', () => {
    beforeEach(async () => {
      await prisma.tenant.update({
        where: { id: tenantContext.tenantId },
        data: { region: 'NORTHERN_IRELAND' }
      });
    });

    it('should implement RQIA medication standards', async () => {
      const assessment = {
        residentId,
        medicationId: 'controlled-med-1',
        assessmentType: 'QUARTERLY'
      };

      const compliance = await complianceService.validateRQIAStandards(assessment);

      expect(compliance).toMatchObject({
        standardsMet: true,
        requiredDocuments: expect.arrayContaining([
          'MEDICATION_REVIEW_FORM',
          'CARE_PLAN_UPDATE',
          'RISK_ASSESSMENT'
        ]),
        monitoringRequirements: {
          frequency: 'MONTHLY',
          responsiblePerson: expect.any(String)
        }
      });
    });
  });

  describe('Audit Report Generation', () => {
    it('should generate CQC inspection ready reports', async () => {
      const report = await complianceService.generateCQCInspectionReport({
        residentId,
        period: 'LAST_3_MONTHS',
        medicationTypes: ['CONTROLLED_DRUGS', 'HIGH_RISK']
      });

      expect(report).toMatchObject({
        format: 'CQC_APPROVED',
        sections: expect.arrayContaining([
          'MEDICATION_ADMINISTRATION',
          'CONTROLLED_DRUGS',
          'STAFF_COMPETENCY',
          'INCIDENT_REPORTS'
        ]),
        evidence: {
          controlledDrugs: expect.any(Array),
          staffTraining: expect.any(Array),
          audits: expect.any(Array)
        }
      });
    });

    it('should generate cross-regulatory compliance reports', async () => {
      const report = await complianceService.generateComplianceReport({
        residentId,
        regulators: ['CQC', 'HIQA', 'CIW'],
        period: 'LAST_QUARTER'
      });

      expect(report).toMatchObject({
        complianceStatus: expect.any(String),
        byRegulator: {
          CQC: expect.any(Object),
          HIQA: expect.any(Object),
          CIW: expect.any(Object)
        },
        recommendations: expect.any(Array)
      });
    });
  });

  describe('Emergency Scenarios', () => {
    it('should handle out-of-hours emergency protocols', async () => {
      const emergency = await complianceService.handleEmergencyMedication({
        residentId,
        medicationId: 'emergency-med-1',
        reason: 'SEVERE_PAIN',
        outOfHours: true
      });

      expect(emergency).toMatchObject({
        protocolFollowed: true,
        authorizations: expect.arrayContaining([
          'ON_CALL_GP',
          'SENIOR_NURSE',
          'PHARMACY'
        ]),
        documentation: {
          emergencyProtocol: true,
          outOfHoursForm: true,
          notifications: expect.any(Array)
        }
      });
    });

    it('should manage emergency medication access', async () => {
      const access = await complianceService.validateEmergencyAccess({
        residentId,
        medicationId: 'emergency-med-1',
        staffId: 'NURSE-123',
        reason: 'BREAKTHROUGH_PAIN'
      });

      expect(access).toMatchObject({
        authorized: true,
        witnessRequired: true,
        documentation: expect.arrayContaining([
          'EMERGENCY_ACCESS_FORM',
          'CONTROLLED_DRUGS_REGISTER',
          'INCIDENT_REPORT'
        ]),
        notifications: expect.arrayContaining([
          'MANAGER',
          'GP',
          'PHARMACY'
        ])
      });
    });
  });
}); 