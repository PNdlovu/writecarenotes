/**
 * @writecarenotes.com
 * @fileoverview Tests for Medication Administration Service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Test suite for medication administration features, including MAR chart
 * management, administration records, and safety checks.
 */

import { MedicationAdministrationService } from '../administration/MedicationAdministrationService';
import { Region } from '@/features/compliance/types/compliance.types';
import { AdministrationStatus, AdministrationRoute } from '@/features/medications/types';

// Mock external services
jest.mock('@/lib/mar-chart');
jest.mock('@/lib/safety-checks');
jest.mock('@/lib/resident-api');
jest.mock('@/lib/pin-verification');

describe('MedicationAdministrationService', () => {
  let service: MedicationAdministrationService;
  const mockResidentId = 'res123';
  const mockUserId = 'user456';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MedicationAdministrationService({
      region: Region.ENGLAND,
      userId: mockUserId
    });
  });

  describe('MAR Chart Management', () => {
    const mockMedication = {
      id: 'med123',
      name: 'Paracetamol',
      strength: '500mg',
      form: 'tablet',
      route: AdministrationRoute.ORAL,
      frequency: 'QDS',
      times: ['08:00', '12:00', '16:00', '22:00'],
      startDate: new Date(),
      endDate: null,
      isControlledDrug: false
    };

    it('should generate MAR chart correctly', async () => {
      const marChart = await service.generateMARChart(mockResidentId);
      expect(marChart).toEqual({
        residentId: mockResidentId,
        medications: expect.any(Array),
        period: {
          start: expect.any(Date),
          end: expect.any(Date)
        },
        administrationTimes: expect.any(Array)
      });
    });

    it('should validate administration times', async () => {
      const invalidMed = {
        ...mockMedication,
        times: ['invalid']
      };

      await expect(service.addMedicationToMAR(mockResidentId, invalidMed))
        .rejects
        .toThrow('Invalid administration times');
    });

    it('should handle PRN medications', async () => {
      const prnMed = {
        ...mockMedication,
        frequency: 'PRN',
        maxDailyDoses: 4,
        minimumGapHours: 4
      };

      const result = await service.addMedicationToMAR(mockResidentId, prnMed);
      expect(result).toEqual({
        success: true,
        isPRN: true,
        maxDailyDoses: 4
      });
    });
  });

  describe('Administration Records', () => {
    const mockAdministration = {
      medicationId: 'med123',
      residentId: mockResidentId,
      scheduledTime: '08:00',
      actualTime: new Date(),
      status: AdministrationStatus.GIVEN,
      quantity: 1,
      notes: ''
    };

    it('should record administration correctly', async () => {
      const result = await service.recordAdministration(mockAdministration);
      expect(result).toEqual({
        success: true,
        administrationId: expect.any(String),
        timestamp: expect.any(Date)
      });
    });

    it('should enforce double signature for controlled drugs', async () => {
      const cdAdmin = {
        ...mockAdministration,
        isControlledDrug: true
      };

      await expect(service.recordAdministration(cdAdmin))
        .rejects
        .toThrow('Witness required for controlled drug administration');
    });

    it('should validate administration timing', async () => {
      const lateAdmin = {
        ...mockAdministration,
        scheduledTime: '08:00',
        actualTime: new Date('2024-03-21T10:00:00') // 2 hours late
      };

      const result = await service.recordAdministration(lateAdmin);
      expect(result.requiresReason).toBe(true);
      expect(result.timingStatus).toBe('LATE');
    });
  });

  describe('Safety Checks', () => {
    it('should perform pre-administration checks', async () => {
      const checks = await service.performSafetyChecks(mockResidentId, 'med123');
      expect(checks).toEqual({
        passed: true,
        checks: expect.arrayContaining([
          expect.objectContaining({
            type: expect.any(String),
            passed: expect.any(Boolean)
          })
        ])
      });
    });

    it('should check for allergies', async () => {
      const allergyCheck = await service.checkAllergies(mockResidentId, 'med123');
      expect(allergyCheck).toEqual({
        safe: expect.any(Boolean),
        allergies: expect.any(Array),
        warnings: expect.any(Array)
      });
    });

    it('should verify resident identity', async () => {
      const idCheck = await service.verifyResidentIdentity(mockResidentId, {
        name: 'John Doe',
        dateOfBirth: '1950-01-01',
        photo: 'photo-url'
      });
      expect(idCheck.verified).toBe(true);
    });
  });

  describe('Missed Doses', () => {
    it('should handle missed dose recording', async () => {
      const missedDose = {
        medicationId: 'med123',
        residentId: mockResidentId,
        scheduledTime: '08:00',
        status: AdministrationStatus.MISSED,
        reason: 'Resident refused',
        actionTaken: 'GP informed'
      };

      const result = await service.recordMissedDose(missedDose);
      expect(result).toEqual({
        recorded: true,
        requiresEscalation: false,
        followUpActions: expect.any(Array)
      });
    });

    it('should escalate repeated missed doses', async () => {
      jest.spyOn(service as any, 'checkMissedDosePattern')
        .mockResolvedValueOnce({
          consecutive: 3,
          requiresEscalation: true
        });

      const result = await service.recordMissedDose({
        medicationId: 'med123',
        residentId: mockResidentId,
        scheduledTime: '08:00',
        status: AdministrationStatus.MISSED,
        reason: 'Resident refused'
      });

      expect(result.requiresEscalation).toBe(true);
    });
  });

  describe('PRN Administration', () => {
    const mockPRN = {
      medicationId: 'prn123',
      residentId: mockResidentId,
      reason: 'Pain reported',
      effectiveness: 'Effective after 30 minutes'
    };

    it('should record PRN effectiveness', async () => {
      const result = await service.recordPRNEffectiveness(mockPRN);
      expect(result).toEqual({
        recorded: true,
        requiresFollowUp: false,
        nextAssessmentDue: expect.any(Date)
      });
    });

    it('should track PRN patterns', async () => {
      const patterns = await service.analyzePRNPatterns(mockResidentId, 'prn123');
      expect(patterns).toEqual({
        frequency: expect.any(Number),
        commonReasons: expect.any(Array),
        effectivenessRate: expect.any(Number),
        recommendations: expect.any(Array)
      });
    });
  });

  describe('Documentation', () => {
    it('should generate administration records', async () => {
      const records = await service.generateAdministrationRecords(
        mockResidentId,
        new Date('2024-03-01'),
        new Date('2024-03-31')
      );

      expect(records).toEqual({
        resident: expect.any(Object),
        period: {
          start: expect.any(Date),
          end: expect.any(Date)
        },
        administrations: expect.any(Array),
        summary: expect.any(Object)
      });
    });

    it('should handle electronic signatures', async () => {
      const signature = {
        userId: mockUserId,
        timestamp: new Date(),
        type: 'ADMINISTRATION'
      };

      const result = await service.recordSignature(signature);
      expect(result).toEqual({
        recorded: true,
        signatureId: expect.any(String),
        verified: true
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      jest.spyOn(service as any, 'saveAdministrationRecord')
        .mockRejectedValueOnce(new Error('Network error'));

      const result = await service.recordAdministration(mockAdministration);
      expect(result).toEqual({
        success: false,
        error: 'Failed to save administration record',
        retry: true
      });
    });

    it('should validate required fields', async () => {
      const invalidAdmin = {
        medicationId: 'med123',
        // Missing required fields
      };

      await expect(service.recordAdministration(invalidAdmin as any))
        .rejects
        .toThrow('Missing required fields');
    });
  });

  describe('Compliance', () => {
    it('should enforce regional requirements', async () => {
      service = new MedicationAdministrationService({
        region: Region.WALES,
        userId: mockUserId
      });

      const requirements = await service.getRegionalRequirements();
      expect(requirements).toEqual({
        region: Region.WALES,
        doubleSignatureRequired: expect.any(Boolean),
        photoIdRequired: expect.any(Boolean),
        maximumLateMinutes: expect.any(Number)
      });
    });

    it('should track compliance metrics', async () => {
      const metrics = await service.getComplianceMetrics(mockResidentId);
      expect(metrics).toEqual({
        administrationCompliance: expect.any(Number),
        lateAdministrations: expect.any(Number),
        missedDoses: expect.any(Number),
        documentationQuality: expect.any(Number)
      });
    });
  });

  describe('PIN Administration', () => {
    const mockPin = '1234';
    const mockWitnessPin = '5678';

    it('should require PIN for administration', async () => {
      const adminWithPin = {
        ...mockAdministration,
        pin: mockPin
      };

      const result = await service.recordAdministration(adminWithPin);
      expect(result).toEqual({
        success: true,
        administrationId: expect.any(String),
        timestamp: expect.any(Date),
        verifiedBy: mockUserId
      });
    });

    it('should reject invalid PIN', async () => {
      const adminWithInvalidPin = {
        ...mockAdministration,
        pin: 'invalid'
      };

      await expect(service.recordAdministration(adminWithInvalidPin))
        .rejects
        .toThrow('Invalid PIN provided');
    });

    it('should lock account after multiple failed attempts', async () => {
      const invalidPin = '9999';
      const adminWithPin = {
        ...mockAdministration,
        pin: invalidPin
      };

      // Simulate multiple failed attempts
      for (let i = 0; i < 3; i++) {
        await expect(service.recordAdministration(adminWithPin))
          .rejects
          .toThrow('Invalid PIN provided');
      }

      // Next attempt should indicate account lock
      await expect(service.recordAdministration(adminWithPin))
        .rejects
        .toThrow('Account locked due to multiple failed attempts');
    });

    it('should require both administrator and witness PINs for controlled drugs', async () => {
      const cdAdminWithPins = {
        ...mockAdministration,
        isControlledDrug: true,
        pin: mockPin,
        witnessPin: mockWitnessPin,
        witnessId: 'witness123'
      };

      const result = await service.recordAdministration(cdAdminWithPins);
      expect(result).toEqual({
        success: true,
        administrationId: expect.any(String),
        timestamp: expect.any(Date),
        verifiedBy: mockUserId,
        witnessedBy: 'witness123'
      });
    });

    it('should reject if witness PIN is missing for controlled drugs', async () => {
      const cdAdminMissingWitnessPin = {
        ...mockAdministration,
        isControlledDrug: true,
        pin: mockPin,
        witnessId: 'witness123'
        // Missing witnessPin
      };

      await expect(service.recordAdministration(cdAdminMissingWitnessPin))
        .rejects
        .toThrow('Witness PIN required for controlled drugs');
    });

    it('should validate witness is different from administrator', async () => {
      const cdAdminSameWitness = {
        ...mockAdministration,
        isControlledDrug: true,
        pin: mockPin,
        witnessPin: mockWitnessPin,
        witnessId: mockUserId // Same as administrator
      };

      await expect(service.recordAdministration(cdAdminSameWitness))
        .rejects
        .toThrow('Witness must be different from administrator');
    });

    it('should track PIN verification attempts', async () => {
      const verificationSpy = jest.spyOn(service as any, 'trackPinVerification');
      
      await service.recordAdministration({
        ...mockAdministration,
        pin: mockPin
      });

      expect(verificationSpy).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          success: true,
          timestamp: expect.any(Date)
        })
      );
    });

    it('should enforce PIN complexity requirements', async () => {
      const weakPin = '1111';
      
      await expect(service.updateUserPin(mockUserId, weakPin))
        .rejects
        .toThrow('PIN does not meet complexity requirements');
    });

    it('should require PIN change after expiry', async () => {
      jest.spyOn(service as any, 'isPinExpired')
        .mockResolvedValueOnce(true);

      await expect(service.recordAdministration({
        ...mockAdministration,
        pin: mockPin
      }))
        .rejects
        .toThrow('PIN expired - please update your PIN');
    });

    it('should handle temporary PINs for new users', async () => {
      const tempPin = await service.generateTemporaryPin('newUser123');
      expect(tempPin).toMatch(/^\d{4}$/);
      
      // Should require PIN change on first use
      await expect(service.recordAdministration({
        ...mockAdministration,
        userId: 'newUser123',
        pin: tempPin
      }))
        .rejects
        .toThrow('Temporary PIN must be changed before first use');
    });
  });

  describe('Witness Verification', () => {
    it('should validate witness credentials', async () => {
      const witnessCheck = await service.verifyWitness('witness123', mockWitnessPin);
      expect(witnessCheck).toEqual({
        verified: true,
        witnessName: expect.any(String),
        timestamp: expect.any(Date)
      });
    });

    it('should check witness permissions', async () => {
      jest.spyOn(service as any, 'checkWitnessPermissions')
        .mockResolvedValueOnce(false);

      await expect(service.verifyWitness('witness123', mockWitnessPin))
        .rejects
        .toThrow('User not authorized to act as witness');
    });

    it('should track witness verifications', async () => {
      const trackingSpy = jest.spyOn(service as any, 'trackWitnessVerification');
      
      await service.verifyWitness('witness123', mockWitnessPin);
      
      expect(trackingSpy).toHaveBeenCalledWith(
        'witness123',
        expect.objectContaining({
          type: 'WITNESS_VERIFICATION',
          timestamp: expect.any(Date)
        })
      );
    });

    it('should enforce witness availability status', async () => {
      jest.spyOn(service as any, 'checkWitnessAvailability')
        .mockResolvedValueOnce(false);

      await expect(service.verifyWitness('witness123', mockWitnessPin))
        .rejects
        .toThrow('Witness not available for verification');
    });

    it('should handle concurrent witness sessions', async () => {
      jest.spyOn(service as any, 'hasActiveWitnessSession')
        .mockResolvedValueOnce(true);

      await expect(service.verifyWitness('witness123', mockWitnessPin))
        .rejects
        .toThrow('Witness already in active session');
    });
  });
}); 