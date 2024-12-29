import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { OfflineSyncService } from '../services/offline-sync-service';
import { HandoverTask } from '../types/handover';

describe('Offline Sync Service', () => {
  let offlineSyncService: OfflineSyncService;
  const mockTenantId = 'tenant1';

  beforeEach(() => {
    offlineSyncService = new OfflineSyncService(mockTenantId);
  });

  describe('Task Storage', () => {
    it('should save task offline', async () => {
      const task: HandoverTask = {
        id: '1',
        handoverSessionId: 'session1',
        title: 'Test Task',
        category: 'PERSONAL_CARE',
        status: 'PENDING',
        priority: 'MEDIUM',
      };

      await expect(offlineSyncService.saveTaskOffline(task)).resolves.not.toThrow();
    });

    it('should retrieve offline changes', async () => {
      const task: HandoverTask = {
        id: '2',
        handoverSessionId: 'session2',
        title: 'Another Task',
        category: 'CLINICAL_CARE',
        status: 'PENDING',
        priority: 'HIGH',
      };

      await offlineSyncService.saveTaskOffline(task);
      const changes = await offlineSyncService.getOfflineChanges();
      expect(changes).toHaveLength(1);
      expect(changes[0].id).toBe('2');
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve conflicts favoring server version for newer updates', async () => {
      const localTask: HandoverTask = {
        id: '3',
        handoverSessionId: 'session3',
        title: 'Local Task',
        category: 'PERSONAL_CARE',
        status: 'PENDING',
        priority: 'LOW',
        updatedAt: new Date('2024-01-01'),
      };

      const serverTask: HandoverTask = {
        id: '3',
        handoverSessionId: 'session3',
        title: 'Server Task',
        category: 'PERSONAL_CARE',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        updatedAt: new Date('2024-01-02'),
      };

      const resolved = await offlineSyncService.resolveConflicts(localTask, serverTask);
      expect(resolved.title).toBe('Server Task');
      expect(resolved.status).toBe('IN_PROGRESS');
    });

    it('should preserve local changes when offline sync is pending', async () => {
      const localTask: HandoverTask = {
        id: '4',
        handoverSessionId: 'session4',
        title: 'Local Task',
        category: 'CLINICAL_CARE',
        status: 'COMPLETED',
        priority: 'HIGH',
        updatedAt: new Date('2024-01-01'),
        offlineSync: {
          status: 'PENDING',
          lastSyncedAt: new Date('2024-01-01'),
        },
      };

      const serverTask: HandoverTask = {
        id: '4',
        handoverSessionId: 'session4',
        title: 'Server Task',
        category: 'CLINICAL_CARE',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        updatedAt: new Date('2024-01-01'),
      };

      const resolved = await offlineSyncService.resolveConflicts(localTask, serverTask);
      expect(resolved.status).toBe('COMPLETED');
    });
  });

  describe('Network Status Handling', () => {
    it('should attempt sync when online', async () => {
      // Mock online status
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });

      const task: HandoverTask = {
        id: '5',
        handoverSessionId: 'session5',
        title: 'Online Task',
        category: 'PERSONAL_CARE',
        status: 'PENDING',
        priority: 'LOW',
      };

      await offlineSyncService.saveTaskOffline(task);
      await offlineSyncService.syncPendingOperations();

      const changes = await offlineSyncService.getOfflineChanges();
      expect(changes).toHaveLength(0);
    });

    it('should queue changes when offline', async () => {
      // Mock offline status
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      const task: HandoverTask = {
        id: '6',
        handoverSessionId: 'session6',
        title: 'Offline Task',
        category: 'PERSONAL_CARE',
        status: 'PENDING',
        priority: 'LOW',
      };

      await offlineSyncService.saveTaskOffline(task);
      const changes = await offlineSyncService.getOfflineChanges();
      expect(changes).toHaveLength(1);
    });
  });
});
