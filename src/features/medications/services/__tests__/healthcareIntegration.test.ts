/**
 * @writecarenotes.com
 * @fileoverview Tests for Healthcare Integration Service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Test suite for healthcare integrations, including NHS Spine,
 * electronic prescriptions, and pharmacy system integrations.
 */

import { HealthcareIntegrationService } from '../healthcareIntegration';
import { Region } from '@/features/compliance/types/compliance.types';

// Mock external services and APIs
jest.mock('@/lib/nhs-spine');
jest.mock('@/lib/eps');
jest.mock('@/lib/pharmacy-api');

describe('HealthcareIntegrationService', () => {
  let service: HealthcareIntegrationService;
  const mockOrganizationId = 'org123';
  const mockResidentId = 'res456';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HealthcareIntegrationService(Region.ENGLAND);
  });

  describe('NHS Spine Integration', () => {
    const mockNHSNumber = '1234567890';
    const mockPatientData = {
      nhsNumber: mockNHSNumber,
      name: 'John Doe',
      dateOfBirth: '1950-01-01',
      gp: {
        code: 'GP123',
        name: 'Dr. Smith'
      }
    };

    it('should fetch patient data from NHS Spine', async () => {
      const data = await service.fetchNHSPatientData(mockNHSNumber);
      expect(data).toEqual(mockPatientData);
    });

    it('should handle NHS Spine connection errors', async () => {
      jest.spyOn(service as any, 'connectToNHSSpine')
        .mockRejectedValueOnce(new Error('Connection failed'));
      
      await expect(service.fetchNHSPatientData(mockNHSNumber))
        .rejects
        .toThrow('Failed to connect to NHS Spine');
    });

    it('should validate NHS number format', async () => {
      await expect(service.fetchNHSPatientData('invalid'))
        .rejects
        .toThrow('Invalid NHS number format');
    });
  });

  describe('Electronic Prescription Service', () => {
    const mockPrescription = {
      id: 'presc123',
      medication: 'Paracetamol',
      dosage: '500mg',
      frequency: 'QDS',
      quantity: 100,
      prescriber: {
        code: 'DR123',
        name: 'Dr. Johnson'
      }
    };

    it('should fetch electronic prescription', async () => {
      const prescription = await service.fetchElectronicPrescription(mockResidentId);
      expect(prescription).toEqual(mockPrescription);
    });

    it('should send prescription acknowledgment', async () => {
      const result = await service.acknowledgePrescription(mockPrescription.id);
      expect(result).toBe(true);
    });

    it('should handle EPS service unavailability', async () => {
      jest.spyOn(service as any, 'connectToEPS')
        .mockRejectedValueOnce(new Error('Service unavailable'));
      
      await expect(service.fetchElectronicPrescription(mockResidentId))
        .rejects
        .toThrow('EPS service unavailable');
    });
  });

  describe('Pharmacy Integration', () => {
    const mockOrder = {
      id: 'order123',
      medications: [
        { name: 'Paracetamol', quantity: 100 },
        { name: 'Ibuprofen', quantity: 50 }
      ],
      urgency: 'NORMAL',
      deliveryDate: new Date()
    };

    it('should send order to pharmacy', async () => {
      const orderId = await service.sendPharmacyOrder(mockOrder);
      expect(orderId).toBe(mockOrder.id);
    });

    it('should track order status', async () => {
      const status = await service.trackPharmacyOrder(mockOrder.id);
      expect(status).toEqual({
        status: 'PROCESSING',
        estimatedDelivery: expect.any(Date)
      });
    });

    it('should handle pharmacy system errors', async () => {
      jest.spyOn(service as any, 'connectToPharmacy')
        .mockRejectedValueOnce(new Error('Connection failed'));
      
      await expect(service.sendPharmacyOrder(mockOrder))
        .rejects
        .toThrow('Failed to connect to pharmacy system');
    });
  });

  describe('Regional Variations', () => {
    it.each([
      [Region.ENGLAND, 'NHS_SPINE'],
      [Region.WALES, 'NHS_WALES'],
      [Region.SCOTLAND, 'NHS_SCOTLAND'],
      [Region.NORTHERN_IRELAND, 'HSC'],
      [Region.IRELAND, 'HSE']
    ])('should use correct healthcare system for %s', (region, expected) => {
      service = new HealthcareIntegrationService(region);
      expect((service as any).getHealthcareSystem()).toBe(expected);
    });

    it('should handle unsupported regions', () => {
      service = new HealthcareIntegrationService('INVALID_REGION' as Region);
      expect(() => (service as any).getHealthcareSystem())
        .toThrow('Unsupported healthcare system');
    });
  });

  describe('Error Recovery', () => {
    it('should retry failed connections', async () => {
      const connectSpy = jest.spyOn(service as any, 'connectToNHSSpine')
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce(true);

      await service.fetchNHSPatientData(mockResidentId);
      expect(connectSpy).toHaveBeenCalledTimes(2);
    });

    it('should log integration errors', async () => {
      const logSpy = jest.spyOn(service as any, 'logError');
      jest.spyOn(service as any, 'connectToEPS')
        .mockRejectedValueOnce(new Error('Test error'));

      try {
        await service.fetchElectronicPrescription(mockResidentId);
      } catch (error) {
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('EPS integration error'),
          expect.any(Error)
        );
      }
    });
  });

  describe('Offline Support', () => {
    it('should queue requests when offline', async () => {
      jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
      const queueSpy = jest.spyOn(service as any, 'queueOfflineRequest');

      await service.sendPharmacyOrder(mockOrder);
      expect(queueSpy).toHaveBeenCalledWith(
        'PHARMACY_ORDER',
        expect.objectContaining({ order: mockOrder })
      );
    });

    it('should sync queued requests when online', async () => {
      const syncSpy = jest.spyOn(service as any, 'syncQueuedRequests');
      window.dispatchEvent(new Event('online'));
      expect(syncSpy).toHaveBeenCalled();
    });
  });
}); 