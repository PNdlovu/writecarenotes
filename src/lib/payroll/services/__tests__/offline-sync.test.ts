import { PayrollOfflineSync } from '../offline-sync';
import { mockDeep } from 'jest-mock-extended';
import { TenantContext } from '@/lib/multi-tenant/types';
import { IndexedDBStorage } from '@/lib/storage/indexed-db';

// Mock IndexedDB
const indexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
};
(global as any).indexedDB = indexedDB;

describe('PayrollOfflineSync', () => {
  let offlineSync: PayrollOfflineSync;
  let mockStorage: jest.Mocked<IndexedDBStorage>;
  
  const mockTenantContext: TenantContext = {
    tenant: {
      id: 'test-tenant-id',
      name: 'Test Tenant',
      settings: {
        defaultLanguage: 'en',
        defaultCurrency: 'GBP'
      }
    }
  };

  beforeEach(() => {
    mockStorage = mockDeep<IndexedDBStorage>();
    offlineSync = new PayrollOfflineSync(mockTenantContext, mockStorage);
  });

  describe('Offline Data Storage', () => {
    const mockPayrollData = {
      id: '1',
      startDate: new Date(),
      endDate: new Date(),
      status: 'DRAFT'
    };

    it('should store payroll data offline', async () => {
      await offlineSync.storePayrollData(mockPayrollData);
      
      expect(mockStorage.set).toHaveBeenCalledWith(
        expect.stringContaining('payroll'),
        expect.objectContaining({
          data: mockPayrollData,
          timestamp: expect.any(Number)
        })
      );
    });

    it('should retrieve stored payroll data', async () => {
      mockStorage.get.mockResolvedValueOnce({
        data: mockPayrollData,
        timestamp: Date.now()
      });

      const result = await offlineSync.getPayrollData('1');
      expect(result).toEqual(mockPayrollData);
    });

    it('should handle missing data', async () => {
      mockStorage.get.mockResolvedValueOnce(null);

      const result = await offlineSync.getPayrollData('1');
      expect(result).toBeNull();
    });
  });

  describe('Sync Queue', () => {
    const mockChange = {
      type: 'UPDATE',
      entityId: '1',
      data: { status: 'PROCESSED' }
    };

    it('should queue changes when offline', async () => {
      await offlineSync.queueChange(mockChange);
      
      expect(mockStorage.set).toHaveBeenCalledWith(
        expect.stringContaining('sync_queue'),
        expect.arrayContaining([
          expect.objectContaining(mockChange)
        ])
      );
    });

    it('should process queued changes when online', async () => {
      mockStorage.get.mockResolvedValueOnce([mockChange]);
      
      const processChangeSpy = jest.spyOn(offlineSync as any, 'processChange');
      await offlineSync.processSyncQueue();
      
      expect(processChangeSpy).toHaveBeenCalledWith(mockChange);
    });

    it('should handle sync conflicts', async () => {
      const conflictingSpy = jest.spyOn(offlineSync as any, 'handleSyncConflict');
      
      mockStorage.get.mockResolvedValueOnce([{
        ...mockChange,
        timestamp: Date.now() - 1000 * 60 * 60 // 1 hour old
      }]);

      await offlineSync.processSyncQueue();
      
      expect(conflictingSpy).toHaveBeenCalled();
    });
  });

  describe('Cache Management', () => {
    it('should clear expired cache entries', async () => {
      const mockExpiredData = {
        data: {},
        timestamp: Date.now() - 1000 * 60 * 60 * 25 // 25 hours old
      };

      mockStorage.getAll.mockResolvedValueOnce({
        'expired_key': mockExpiredData
      });

      await offlineSync.clearExpiredCache();
      
      expect(mockStorage.delete).toHaveBeenCalledWith('expired_key');
    });

    it('should retain valid cache entries', async () => {
      const mockValidData = {
        data: {},
        timestamp: Date.now() - 1000 * 60 // 1 minute old
      };

      mockStorage.getAll.mockResolvedValueOnce({
        'valid_key': mockValidData
      });

      await offlineSync.clearExpiredCache();
      
      expect(mockStorage.delete).not.toHaveBeenCalled();
    });
  });

  describe('Network Status', () => {
    it('should detect online status', () => {
      (global as any).navigator.onLine = true;
      expect(offlineSync.isOnline()).toBe(true);
    });

    it('should detect offline status', () => {
      (global as any).navigator.onLine = false;
      expect(offlineSync.isOnline()).toBe(false);
    });

    it('should register network status listeners', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      offlineSync.initNetworkListeners();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });
});
