import { SyncManager } from '../services/syncManager'
import { mockIndexedDB } from 'fake-indexeddb'

describe('SyncManager', () => {
  let syncManager: SyncManager
  const mockOperation = {
    id: 'op1',
    type: 'UPDATE',
    resource: 'medications',
    data: { id: '1', name: 'Test Med' },
    timestamp: Date.now(),
  }

  beforeEach(() => {
    // Setup mock IndexedDB
    global.indexedDB = mockIndexedDB
    syncManager = new SyncManager()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Queue Management', () => {
    it('adds operations to queue when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      
      await syncManager.queueOperation(mockOperation);
      const queue = await syncManager.getQueue();
      
      expect(queue).toContainEqual(expect.objectContaining({
        id: mockOperation.id,
        type: mockOperation.type,
      }));
    });

    it('processes queue when coming online', async () => {
      const processQueueSpy = jest.spyOn(syncManager, 'processQueue');
      
      // Simulate offline -> online transition
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
      
      expect(processQueueSpy).toHaveBeenCalled();
    });
  });

  describe('Conflict Resolution', () => {
    it('resolves conflicts using last-write-wins strategy', async () => {
      const localOp = { ...mockOperation, timestamp: 1643723400 };
      const serverOp = { ...mockOperation, timestamp: 1643723401 };
      
      const resolved = await syncManager.resolveConflict(localOp, serverOp);
      expect(resolved).toEqual(serverOp);
    });

    it('merges non-conflicting changes', async () => {
      const localOp = {
        ...mockOperation,
        data: { id: '1', name: 'Local Name', dose: '10mg' },
      };
      const serverOp = {
        ...mockOperation,
        data: { id: '1', name: 'Server Name', frequency: 'daily' },
      };
      
      const resolved = await syncManager.resolveConflict(localOp, serverOp);
      expect(resolved.data).toEqual({
        id: '1',
        name: 'Server Name', // Server wins on conflict
        dose: '10mg',
        frequency: 'daily',
      });
    });
  });

  describe('Background Sync', () => {
    it('registers and triggers background sync', async () => {
      const mockSync = jest.fn();
      // @ts-ignore
      global.navigator.serviceWorker = {
        ready: Promise.resolve({
          sync: {
            register: mockSync,
          },
        }),
      };

      await syncManager.registerBackgroundSync();
      expect(mockSync).toHaveBeenCalledWith('medication-sync');
    });

    it('handles background sync failure gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      // @ts-ignore
      global.navigator.serviceWorker = {
        ready: Promise.reject(new Error('Sync failed')),
      };

      await syncManager.registerBackgroundSync();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Background sync registration failed:',
        expect.any(Error)
      );
    });
  });

  describe('Error Handling', () => {
    it('retries failed operations with exponential backoff', async () => {
      const failedOp = { ...mockOperation, retryCount: 0 };
      const mockFetch = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true });
      
      global.fetch = mockFetch;

      await syncManager.processOperation(failedOp);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('marks operation as failed after max retries', async () => {
      const failedOp = { ...mockOperation, retryCount: 5 };
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      global.fetch = mockFetch;

      await syncManager.processOperation(failedOp);
      const queue = await syncManager.getQueue();
      
      expect(queue.find(op => op.id === failedOp.id)?.status).toBe('failed');
    });
  });

  describe('Performance', () => {
    it('batches multiple operations', async () => {
      const operations = Array.from({ length: 5 }, (_, i) => ({
        ...mockOperation,
        id: `op${i}`,
      }));

      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      await syncManager.processBatch(operations);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('['),
        })
      );
    });
  });
});


