/**
 * @fileoverview Pain Medication Cross-Border and Regulatory Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { PainMedicationSchedulingService } from '../../services/painMedicationScheduling';
import { RegionalComplianceService } from '@/features/medications/services/regionalCompliance';
import { HealthcareIntegration } from '@/features/medications/services/healthcareIntegration';
import { createTestTenant, createTestResident } from '@/lib/testing';
import { ResidentPainAssessment, CareHomeInterventionType } from '../../types/care-home';

describe('Pain Medication Cross-Border Scenarios', () => {
  let tenantContext;
  let residentId: string;
  let schedulingService: PainMedicationSchedulingService;
  let complianceService: RegionalComplianceService;
  let healthcareService: HealthcareIntegration;

  beforeAll(async () => {
    tenantContext = await createTestTenant();
    const resident = await createTestResident(tenantContext.tenantId);
    residentId = resident.id;
  });

  describe('Cross-Border Prescriptions', () => {
    it('should handle prescriptions from different UK regions', async () => {
      // Set up prescription from Scotland for resident in England
      await prisma.tenant.update({
        where: { id: tenantContext.tenantId },
        data: { region: 'ENGLAND' }
      });

      const assessment: ResidentPainAssessment = {
        residentId,
        painScore: 7,
        assessmentDate: new Date(),
        interventions: [{
          type: CareHomeInterventionType.PRN_MEDICATION,
          medicationId: 'scottish-prescription-1',
          startTime: new Date(),
          prescribingRegion: 'SCOTLAND'
        }]
      };

      await schedulingService.handlePainAssessment(assessment);

      const complianceCheck = await prisma.crossBorderComplianceCheck.findFirst({
        where: { residentId }
      });
      expect(complianceCheck.status).toBe('VALIDATED');
      expect(complianceCheck.prescribingRegion).toBe('SCOTLAND');
      expect(complianceCheck.administeringRegion).toBe('ENGLAND');
    });

    it('should handle Ireland-UK cross-border scenarios', async () => {
      await prisma.tenant.update({
        where: { id: tenantContext.tenantId },
        data: { region: 'NORTHERN_IRELAND' }
      });

      const assessment: ResidentPainAssessment = {
        residentId,
        painScore: 6,
        assessmentDate: new Date(),
        interventions: [{
          type: CareHomeInterventionType.PRN_MEDICATION,
          medicationId: 'irish-prescription-1',
          startTime: new Date(),
          prescribingRegion: 'IRELAND'
        }]
      };

      await schedulingService.handlePainAssessment(assessment);

      // Verify cross-border validation
      const validation = await prisma.crossBorderValidation.findFirst({
        where: { 
          prescriptionId: 'irish-prescription-1',
          prescribingRegion: 'IRELAND',
          administeringRegion: 'NORTHERN_IRELAND'
        }
      });
      expect(validation.status).toBe('APPROVED');
    });
  });

  describe('Regulatory Reporting', () => {
    it('should generate CQC medication safety notifications', async () => {
      await prisma.tenant.update({
        where: { id: tenantContext.tenantId },
        data: { region: 'ENGLAND' }
      });

      // Create multiple assessments with high pain scores
      const assessments = [7, 8, 7].map(score => ({
        residentId,
        painScore: score,
        assessmentDate: new Date(),
        interventions: [{
          type: CareHomeInterventionType.PRN_MEDICATION,
          medicationId: 'controlled-med-1',
          startTime: new Date()
        }]
      }));

      for (const assessment of assessments) {
        await schedulingService.handlePainAssessment(assessment);
      }

      // Check CQC notification for repeated high pain scores
      const notification = await prisma.regulatoryNotification.findFirst({
        where: {
          regulatoryBody: 'CQC',
          type: 'REPEATED_HIGH_PAIN_SCORES',
          residentId
        }
      });
      expect(notification).toBeTruthy();
      expect(notification.priority).toBe('HIGH');
    });

    it('should handle multi-region reporting requirements', async () => {
      // Organization operates in multiple regions
      await prisma.tenant.update({
        where: { id: tenantContext.tenantId },
        data: { 
          operatingRegions: ['ENGLAND', 'WALES', 'SCOTLAND']
        }
      });

      const assessment: ResidentPainAssessment = {
        residentId,
        painScore: 8,
        assessmentDate: new Date(),
        interventions: [{
          type: CareHomeInterventionType.PRN_MEDICATION,
          medicationId: 'controlled-med-1',
          startTime: new Date()
        }]
      };

      await schedulingService.handlePainAssessment(assessment);

      // Verify reports generated for all relevant regulators
      const notifications = await prisma.regulatoryNotification.findMany({
        where: { residentId }
      });

      expect(notifications).toHaveLength(3); // One for each region
      expect(notifications.map(n => n.regulatoryBody)).toEqual(
        expect.arrayContaining(['CQC', 'CIW', 'CARE_INSPECTORATE'])
      );
    });
  });

  describe('Emergency Protocols', () => {
    it('should handle out-of-hours prescriptions across regions', async () => {
      const assessment: ResidentPainAssessment = {
        residentId,
        painScore: 9,
        assessmentDate: new Date('2024-03-21T23:00:00Z'), // Out of hours
        interventions: [{
          type: CareHomeInterventionType.PRN_MEDICATION,
          medicationId: 'emergency-med-1',
          startTime: new Date('2024-03-21T23:00:00Z'),
          emergencyProtocol: true
        }]
      };

      await schedulingService.handlePainAssessment(assessment);

      const emergencyRecord = await prisma.emergencyMedicationRecord.findFirst({
        where: { residentId }
      });
      expect(emergencyRecord).toMatchObject({
        outOfHours: true,
        escalatedToEmergencyServices: true,
        crossBorderProtocolFollowed: true
      });
    });
  });
}); 