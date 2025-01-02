import { describe, expect, test, jest } from '@jest/globals';
import { SyncManager } from '@/lib/offline-sync';

describe('SyncManager', () => {
  let syncManager: SyncManager;

  beforeEach(() => {
    syncManager = new SyncManager();
  });

  test('should queue sync operations', () => {
    syncManager.queueSync({ type: 'CREATE', entity: 'resident', data: { id: 1 } });
    expect(syncManager.getPendingOperations()).toHaveLength(1);
  });

  test('should process sync queue in order', async () => {
    const mockSync = jest.fn();
    syncManager.setSyncHandler(mockSync);

    syncManager.queueSync({ type: 'CREATE', entity: 'resident', data: { id: 1 } });
    syncManager.queueSync({ type: 'UPDATE', entity: 'resident', data: { id: 2 } });

    await syncManager.processSyncQueue();

    expect(mockSync).toHaveBeenCalledTimes(2);
    expect(mockSync.mock.calls[0][0]).toEqual({ type: 'CREATE', entity: 'resident', data: { id: 1 } });
    expect(mockSync.mock.calls[1][0]).toEqual({ type: 'UPDATE', entity: 'resident', data: { id: 2 } });
  });

  test('should handle sync failures', async () => {
    const mockSync = jest.fn().mockRejectedValue(new Error('Sync failed'));
    syncManager.setSyncHandler(mockSync);

    syncManager.queueSync({ type: 'CREATE', entity: 'resident', data: { id: 1 } });

    await expect(syncManager.processSyncQueue()).rejects.toThrow('Sync failed');
    expect(syncManager.getPendingOperations()).toHaveLength(1);
  });

  test('should clear sync queue after successful sync', async () => {
    const mockSync = jest.fn();
    syncManager.setSyncHandler(mockSync);

    syncManager.queueSync({ type: 'CREATE', entity: 'resident', data: { id: 1 } });
    await syncManager.processSyncQueue();

    expect(syncManager.getPendingOperations()).toHaveLength(0);
  });

  test('should handle conflict resolution', async () => {
    const mockSync = jest.fn().mockRejectedValueOnce({ 
      type: 'CONFLICT',
      serverData: { id: 1, name: 'Server Version' },
      clientData: { id: 1, name: 'Client Version' }
    });
    syncManager.setSyncHandler(mockSync);

    const mockResolver = jest.fn().mockReturnValue({ id: 1, name: 'Resolved Version' });
    syncManager.setConflictResolver(mockResolver);

    syncManager.queueSync({ type: 'UPDATE', entity: 'resident', data: { id: 1, name: 'Client Version' } });
    await syncManager.processSyncQueue();

    expect(mockResolver).toHaveBeenCalledWith(
      { id: 1, name: 'Server Version' },
      { id: 1, name: 'Client Version' }
    );
    expect(mockSync).toHaveBeenCalledTimes(2);
    expect(mockSync.mock.calls[1][0]).toEqual({ 
      type: 'UPDATE', 
      entity: 'resident', 
      data: { id: 1, name: 'Resolved Version' }
    });
  });

  test('should persist sync queue', () => {
    syncManager.queueSync({ type: 'CREATE', entity: 'resident', data: { id: 1 } });
    syncManager.persistQueue();

    const newSyncManager = new SyncManager();
    expect(newSyncManager.getPendingOperations()).toHaveLength(1);
  });

  test('should handle batch operations', async () => {
    const mockSync = jest.fn();
    syncManager.setSyncHandler(mockSync);

    syncManager.queueBatchSync([
      { type: 'CREATE', entity: 'resident', data: { id: 1 } },
      { type: 'CREATE', entity: 'resident', data: { id: 2 } }
    ]);

    await syncManager.processSyncQueue();

    expect(mockSync).toHaveBeenCalledTimes(2);
    expect(syncManager.getPendingOperations()).toHaveLength(0);
  });

  test('should prioritize critical operations', async () => {
    const mockSync = jest.fn();
    syncManager.setSyncHandler(mockSync);

    syncManager.queueSync({ type: 'UPDATE', entity: 'resident', data: { id: 1 }, priority: 'low' });
    syncManager.queueSync({ type: 'UPDATE', entity: 'medication', data: { id: 1 }, priority: 'critical' });

    await syncManager.processSyncQueue();

    expect(mockSync.mock.calls[0][0].priority).toBe('critical');
    expect(mockSync.mock.calls[1][0].priority).toBe('low');
  });
}); 