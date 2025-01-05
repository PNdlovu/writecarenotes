/**
 * @writecarenotes.com
 * @fileoverview Tests for Mobile Integration Service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Test suite for mobile integration features, including offline support,
 * medication rounds, and barcode scanning functionality.
 */

import { MobileIntegrationService } from '../mobile/MobileIntegrationService';
import { DeviceType } from '@/features/mobile/types';
import { Region } from '@/features/compliance/types/compliance.types';

// Mock device-specific APIs
jest.mock('@/lib/barcode-scanner');
jest.mock('@/lib/device-storage');
jest.mock('@/lib/sync-manager');

describe('MobileIntegrationService', () => {
  let service: MobileIntegrationService;
  const mockDeviceId = 'device123';
  const mockUserId = 'user456';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MobileIntegrationService({
      deviceId: mockDeviceId,
      userId: mockUserId,
      deviceType: DeviceType.TABLET,
      region: Region.ENGLAND
    });
  });

  describe('Device Registration', () => {
    const mockDeviceInfo = {
      id: mockDeviceId,
      type: DeviceType.TABLET,
      osVersion: 'Android 12',
      appVersion: '1.0.0',
      lastSync: new Date()
    };

    it('should register new device successfully', async () => {
      const result = await service.registerDevice(mockDeviceInfo);
      expect(result).toEqual({
        registered: true,
        deviceId: mockDeviceId,
        permissions: expect.any(Array)
      });
    });

    it('should validate device requirements', async () => {
      const invalidDevice = { ...mockDeviceInfo, osVersion: 'Android 7' };
      await expect(service.registerDevice(invalidDevice))
        .rejects
        .toThrow('Device does not meet minimum requirements');
    });

    it('should handle duplicate registration', async () => {
      jest.spyOn(service as any, 'isDeviceRegistered')
        .mockResolvedValueOnce(true);
      
      const result = await service.registerDevice(mockDeviceInfo);
      expect(result.registered).toBe(false);
      expect(result.error).toBe('Device already registered');
    });
  });

  describe('Medication Rounds', () => {
    const mockRound = {
      id: 'round123',
      startTime: new Date(),
      medications: [
        { id: 'med1', resident: 'res1', drug: 'Paracetamol' },
        { id: 'med2', resident: 'res2', drug: 'Ibuprofen' }
      ]
    };

    it('should start medication round', async () => {
      const round = await service.startMedicationRound(mockRound);
      expect(round).toEqual({
        ...mockRound,
        status: 'IN_PROGRESS',
        startedBy: mockUserId
      });
    });

    it('should validate user permissions', async () => {
      jest.spyOn(service as any, 'checkUserPermissions')
        .mockResolvedValueOnce(false);
      
      await expect(service.startMedicationRound(mockRound))
        .rejects
        .toThrow('User not authorized to start medication round');
    });

    it('should handle concurrent rounds', async () => {
      jest.spyOn(service as any, 'hasActiveRound')
        .mockResolvedValueOnce(true);
      
      await expect(service.startMedicationRound(mockRound))
        .rejects
        .toThrow('Another round is already in progress');
    });
  });

  describe('Barcode Scanning', () => {
    const mockBarcode = {
      format: 'CODE128',
      data: '12345678901234'
    };

    it('should scan and validate medication barcode', async () => {
      const result = await service.scanMedicationBarcode(mockBarcode);
      expect(result).toEqual({
        valid: true,
        medication: expect.any(Object)
      });
    });

    it('should handle invalid barcodes', async () => {
      const invalidBarcode = { ...mockBarcode, data: 'invalid' };
      const result = await service.scanMedicationBarcode(invalidBarcode);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid barcode format');
    });

    it('should verify medication against MAR', async () => {
      jest.spyOn(service as any, 'verifyAgainstMAR')
        .mockResolvedValueOnce(false);
      
      const result = await service.scanMedicationBarcode(mockBarcode);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Medication not on MAR');
    });
  });

  describe('Offline Support', () => {
    const mockData = {
      residents: [],
      medications: [],
      rounds: []
    };

    it('should download data for offline use', async () => {
      const result = await service.prepareOfflineData();
      expect(result).toEqual({
        timestamp: expect.any(Date),
        data: expect.objectContaining(mockData)
      });
    });

    it('should sync offline changes', async () => {
      const changes = {
        rounds: [{ id: 'round1', status: 'COMPLETED' }],
        administrations: [{ id: 'admin1', status: 'GIVEN' }]
      };

      const result = await service.syncOfflineChanges(changes);
      expect(result.synced).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should handle sync conflicts', async () => {
      jest.spyOn(service as any, 'detectConflicts')
        .mockResolvedValueOnce([{ type: 'ROUND_UPDATE', id: 'round1' }]);
      
      const changes = {
        rounds: [{ id: 'round1', status: 'COMPLETED' }]
      };

      const result = await service.syncOfflineChanges(changes);
      expect(result.conflicts).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle device storage errors', async () => {
      jest.spyOn(service as any, 'saveToDevice')
        .mockRejectedValueOnce(new Error('Storage full'));
      
      await expect(service.prepareOfflineData())
        .rejects
        .toThrow('Failed to prepare offline data: Storage full');
    });

    it('should handle network errors gracefully', async () => {
      jest.spyOn(service as any, 'syncWithServer')
        .mockRejectedValueOnce(new Error('Network error'));
      
      const result = await service.syncOfflineChanges({});
      expect(result.error).toBe('Failed to sync: Network error');
      expect(result.retryScheduled).toBe(true);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track sync performance', async () => {
      const perfSpy = jest.spyOn(service as any, 'trackPerformance');
      await service.syncOfflineChanges({});
      expect(perfSpy).toHaveBeenCalledWith(
        'SYNC_OPERATION',
        expect.any(Number)
      );
    });

    it('should monitor storage usage', async () => {
      const storageSpy = jest.spyOn(service as any, 'checkStorageUsage');
      await service.prepareOfflineData();
      expect(storageSpy).toHaveBeenCalled();
    });
  });
}); 