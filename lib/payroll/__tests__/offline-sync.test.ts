import { PayrollOfflineSync } from '../services/offline-sync';
import { TenantContext } from '@/lib/multi-tenant/types';
import { IndexedDBStorage } from '@/lib/storage/indexed-db';
import { PayrollChangeType, Region, SyncStatus, TaxYear } from '../types';
import { mock, MockProxy } from 'jest-mock-extended';

describe('PayrollOfflineSync', () => {
  let offlineSync: PayrollOfflineSync;
  let mockTenantContext: MockProxy<TenantContext>;
  let mockStorage: MockProxy<IndexedDBStorage>;

  beforeEach(() => {
    mockTenantContext = mock<TenantContext>();
    mockStorage = mock<IndexedDBStorage>();

    mockTenantContext.tenant = {
      id: 'test-tenant',
      name: 'Test Tenant'
    };

    offlineSync = new PayrollOfflineSync(mockTenantContext, mockStorage);
  });

  describe('storePayrollData', () => {
    it('should store payroll data with metadata', async () => {
      const payrollData = {
        id: 'test-123',
        employeeId: 'emp-123',
        summary: {
          grossPay: 30000,
          netPay: 24000,
          deductions: []
        },
        region: Region.ENGLAND,
        taxYear: TaxYear.Y2024_2025,
        lastModified: Date.now()
      };

      await offlineSync.storePayrollData(payrollData);

      expect(mockStorage.set).toHaveBeenCalledWith(
        `${mockTenantContext.tenant.id}:payroll:${payrollData.id}`,
        expect.objectContaining({
          data: payrollData,
          status: SyncStatus.PENDING
        })
      );
    });
  });

  describe('getPayrollData', () => {
    it('should retrieve stored payroll data', async () => {
      const payrollId = 'test-123';
      const mockData = {
        data: {
          id: payrollId,
          summary: { grossPay: 30000 }
        }
      };

      mockStorage.get.mockResolvedValue(mockData);

      const result = await offlineSync.getPayrollData(payrollId);

      expect(result).toEqual(mockData.data);
    });

    it('should return null for non-existent data', async () => {
      mockStorage.get.mockResolvedValue(null);

      const result = await offlineSync.getPayrollData('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('queueChange', () => {
    it('should queue a change with metadata', async () => {
      const change = {
        entityId: 'test-123',
        type: PayrollChangeType.PAYMENT,
        method: 'POST',
        data: { amount: 1000 }
      };

      mockStorage.get.mockResolvedValue([]);

      await offlineSync.queueChange(change);

      expect(mockStorage.set).toHaveBeenCalledWith(
        `${mockTenantContext.tenant.id}:sync_queue`,
        expect.arrayContaining([
          expect.objectContaining({
            ...change,
            tenantId: mockTenantContext.tenant.id,
            status: SyncStatus.PENDING
          })
        ])
      );
    });

    it('should append to existing queue', async () => {
      const existingChange = {
        entityId: 'existing-123',
        type: PayrollChangeType.PAYMENT,
        method: 'POST',
        data: { amount: 500 }
      };

      const newChange = {
        entityId: 'new-123',
        type: PayrollChangeType.PAYMENT,
        method: 'POST',
        data: { amount: 1000 }
      };

      mockStorage.get.mockResolvedValue([existingChange]);

      await offlineSync.queueChange(newChange);

      expect(mockStorage.set).toHaveBeenCalledWith(
        `${mockTenantContext.tenant.id}:sync_queue`,
        expect.arrayContaining([
          existingChange,
          expect.objectContaining({
            ...newChange,
            tenantId: mockTenantContext.tenant.id
          })
        ])
      );
    });
  });

  describe('processSyncQueue', () => {
    it('should process changes in batches', async () => {
      const changes = Array.from({ length: 5 }, (_, i) => ({
        entityId: `test-${i}`,
        type: PayrollChangeType.PAYMENT,
        method: 'POST',
        data: { amount: 1000 },
        retryCount: 0,
        status: SyncStatus.PENDING
      }));

      mockStorage.get.mockResolvedValue(changes);
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      await offlineSync.processSyncQueue();

      expect(mockStorage.delete).toHaveBeenCalledWith(
        `${mockTenantContext.tenant.id}:sync_queue`
      );
    });

    it('should handle failed changes', async () => {
      const change = {
        entityId: 'test-123',
        type: PayrollChangeType.PAYMENT,
        method: 'POST',
        data: { amount: 1000 },
        retryCount: 0,
        status: SyncStatus.PENDING
      };

      mockStorage.get.mockResolvedValue([change]);
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await offlineSync.processSyncQueue();

      expect(mockStorage.set).toHaveBeenCalledWith(
        `${mockTenantContext.tenant.id}:sync_queue`,
        expect.arrayContaining([
          expect.objectContaining({
            ...change,
            retryCount: 1,
            status: SyncStatus.FAILED
          })
        ])
      );
    });
  });

  describe('clearCache', () => {
    it('should clear expired cache entries', async () => {
      const mockData = {
        'key1': { timestamp: Date.now() - 25 * 60 * 60 * 1000 }, // 25 hours old
        'key2': { timestamp: Date.now() } // Fresh
      };

      mockStorage.getAll.mockResolvedValue(mockData);

      await offlineSync.clearCache();

      expect(mockStorage.delete).toHaveBeenCalledWith('key1');
      expect(mockStorage.delete).not.toHaveBeenCalledWith('key2');
    });
  });
});
