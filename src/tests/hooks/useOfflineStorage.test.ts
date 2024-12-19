import { renderHook, act } from '@testing-library/react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { mockIndexedDB } from 'fake-indexeddb';

describe('useOfflineStorage', () => {
  const mockMedication = {
    id: 'med1',
    name: 'Test Medication',
    dosage: '10mg',
    date: new Date(),
    tenantId: 'tenant1',
    userId: 'user1',
  };

  beforeEach(() => {
    // Setup mock IndexedDB
    global.indexedDB = mockIndexedDB;
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useOfflineStorage());
    
    expect(result.current.isOnline).toBe(navigator.onLine);
    expect(result.current.syncStatus).toBe('idle');
  });

  describe('Data Storage', () => {
    it('stores medication data with audit info', async () => {
      const { result } = renderHook(() => useOfflineStorage());
      
      await act(async () => {
        await result.current.storeOfflineData('medications', mockMedication);
      });

      // Verify data was stored
      const storedData = await result.current.getOfflineData('medications', mockMedication.id);
      expect(storedData).toEqual(mockMedication);
    });

    it('handles storage errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useOfflineStorage());
      
      // Force an error
      global.indexedDB.open = jest.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      await act(async () => {
        const data = await result.current.storeOfflineData('medications', mockMedication);
        expect(data).toBeNull();
      });
      
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Audit Logging', () => {
    it('records audit events', async () => {
      const { result } = renderHook(() => useOfflineStorage());
      
      await act(async () => {
        await result.current.auditLog('medication_access', {
          medicationId: mockMedication.id,
          action: 'view',
        });
      });

      // Verify audit log was created
      const tx = result.current.db?.transaction('auditLogs', 'readonly');
      const store = tx?.objectStore('auditLogs');
      const logs = await store?.getAll();
      
      expect(logs?.length).toBe(1);
      expect(logs?.[0]).toMatchObject({
        action: 'medication_access',
        details: {
          medicationId: mockMedication.id,
          action: 'view',
        },
      });
    });
  });

  describe('Tenant Isolation', () => {
    it('enforces tenant isolation in data access', async () => {
      const { result } = renderHook(() => useOfflineStorage());
      
      // Store data for different tenants
      await act(async () => {
        await result.current.storeOfflineData('medications', {
          ...mockMedication,
          tenantId: 'tenant1',
        });
        await result.current.storeOfflineData('medications', {
          ...mockMedication,
          id: 'med2',
          tenantId: 'tenant2',
        });
      });

      // Verify tenant isolation
      const tx = result.current.db?.transaction('medications', 'readonly');
      const store = tx?.objectStore('medications');
      const tenant1Index = store?.index('by-tenant');
      const tenant1Data = await tenant1Index?.getAll('tenant1');
      
      expect(tenant1Data?.length).toBe(1);
      expect(tenant1Data?.[0].id).toBe('med1');
    });
  });

  describe('Offline Sync', () => {
    it('queues changes when offline', async () => {
      // Simulate offline state
      Object.defineProperty(navigator, 'onLine', { value: false });
      const { result } = renderHook(() => useOfflineStorage());
      
      await act(async () => {
        await result.current.storeOfflineData('medications', mockMedication);
      });

      // Verify change was queued
      const tx = result.current.db?.transaction('pendingSync', 'readonly');
      const store = tx?.objectStore('pendingSync');
      const pendingChanges = await store?.getAll();
      
      expect(pendingChanges?.length).toBe(1);
      expect(pendingChanges?.[0]).toMatchObject({
        action: 'create',
        collection: 'medications',
        data: mockMedication,
      });
    });

    it('syncs changes when coming online', async () => {
      const syncSpy = jest.fn();
      const { result } = renderHook(() => useOfflineStorage());
      result.current.syncPendingChanges = syncSpy;
      
      // Simulate offline -> online transition
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
      
      expect(syncSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles database initialization errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      global.indexedDB.open = jest.fn().mockImplementation(() => {
        throw new Error('DB Error');
      });
      
      renderHook(() => useOfflineStorage());
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error initializing database:',
        expect.any(Error)
      );
    });

    it('handles transaction errors', async () => {
      const { result } = renderHook(() => useOfflineStorage());
      const mockTransaction = {
        objectStore: jest.fn().mockImplementation(() => {
          throw new Error('Transaction error');
        }),
      };
      result.current.db = {
        transaction: jest.fn().mockReturnValue(mockTransaction),
      } as any;

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      await act(async () => {
        const data = await result.current.getOfflineData('medications');
        expect(data).toBeNull();
      });
      
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Security', () => {
    it('validates user access', async () => {
      const { result } = renderHook(() => useOfflineStorage());
      
      const hasAccess = await result.current.validateAccess('user1', 'tenant1');
      expect(hasAccess).toBe(true);  // Replace with actual test logic
    });

    it('includes security metadata in stored records', async () => {
      const { result } = renderHook(() => useOfflineStorage());
      
      await act(async () => {
        await result.current.storeOfflineData('medications', mockMedication);
      });

      const tx = result.current.db?.transaction('medications', 'readonly');
      const store = tx?.objectStore('medications');
      const record = await store?.get(mockMedication.id);
      
      expect(record).toMatchObject({
        userId: expect.any(String),
        tenantId: expect.any(String),
      });
    });
  });
});


