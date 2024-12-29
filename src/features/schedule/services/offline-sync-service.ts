import { HandoverTask } from '../types/handover';
import { IndexedDBStorage } from '@/lib/storage/indexed-db';
import { NetworkStatus } from '@/lib/network';

interface SyncMetadata {
  lastSyncTime: Date;
  deviceId: string;
  version: number;
}

interface SyncOperation {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  timestamp: Date;
  data: any;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
}

export class OfflineSyncService {
  private db: IndexedDBStorage;
  private networkStatus: NetworkStatus;
  private syncQueue: Map<string, SyncOperation>;
  private metadata: SyncMetadata;

  constructor(tenantId: string) {
    this.db = new IndexedDBStorage(`tenant_${tenantId}_handover`);
    this.networkStatus = new NetworkStatus();
    this.syncQueue = new Map();
    this.metadata = {
      lastSyncTime: new Date(),
      deviceId: this.generateDeviceId(),
      version: 1,
    };

    // Initialize listeners
    this.initializeNetworkListeners();
    this.initializePeriodicSync();
  }

  async saveTaskOffline(task: HandoverTask): Promise<void> {
    try {
      // Save to local DB
      await this.db.set(`task_${task.id}`, {
        ...task,
        offlineSync: {
          status: 'PENDING',
          lastSyncedAt: new Date(),
          deviceId: this.metadata.deviceId,
        },
      });

      // Add to sync queue
      this.addToSyncQueue({
        id: task.id,
        operation: task.id ? 'UPDATE' : 'CREATE',
        timestamp: new Date(),
        data: task,
        status: 'PENDING',
        retryCount: 0,
      });

      // Attempt immediate sync if online
      if (this.networkStatus.isOnline) {
        await this.syncPendingOperations();
      }
    } catch (error) {
      console.error('Error saving task offline:', error);
      throw error;
    }
  }

  async syncPendingOperations(): Promise<void> {
    if (!this.networkStatus.isOnline) return;

    for (const [id, operation] of this.syncQueue.entries()) {
      if (operation.status === 'PENDING') {
        try {
          await this.processSyncOperation(operation);
          this.syncQueue.delete(id);
        } catch (error) {
          operation.retryCount++;
          if (operation.retryCount > 3) {
            operation.status = 'FAILED';
          }
          console.error(`Sync failed for operation ${id}:`, error);
        }
      }
    }
  }

  async resolveConflicts(
    localTask: HandoverTask,
    serverTask: HandoverTask
  ): Promise<HandoverTask> {
    // If server version is newer, use server version
    if (new Date(serverTask.updatedAt) > new Date(localTask.updatedAt)) {
      return serverTask;
    }

    // If local version has offline changes, merge changes
    if (localTask.offlineSync?.status === 'PENDING') {
      return this.mergeTaskChanges(localTask, serverTask);
    }

    return localTask;
  }

  async getOfflineChanges(): Promise<HandoverTask[]> {
    const tasks = await this.db.getAll();
    return tasks.filter(
      (task) => task.offlineSync?.status === 'PENDING'
    ) as HandoverTask[];
  }

  private async processSyncOperation(
    operation: SyncOperation
  ): Promise<void> {
    switch (operation.operation) {
      case 'CREATE':
        await this.syncCreateOperation(operation);
        break;
      case 'UPDATE':
        await this.syncUpdateOperation(operation);
        break;
      case 'DELETE':
        await this.syncDeleteOperation(operation);
        break;
    }
  }

  private async syncCreateOperation(
    operation: SyncOperation
  ): Promise<void> {
    // Implementation for creating task on server
  }

  private async syncUpdateOperation(
    operation: SyncOperation
  ): Promise<void> {
    // Implementation for updating task on server
  }

  private async syncDeleteOperation(
    operation: SyncOperation
  ): Promise<void> {
    // Implementation for deleting task on server
  }

  private mergeTaskChanges(
    localTask: HandoverTask,
    serverTask: HandoverTask
  ): HandoverTask {
    // Implement smart merge logic
    return {
      ...serverTask,
      ...localTask,
      updatedAt: new Date(),
    };
  }

  private addToSyncQueue(operation: SyncOperation): void {
    this.syncQueue.set(operation.id, operation);
  }

  private initializeNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.syncPendingOperations();
    });
  }

  private initializePeriodicSync(): void {
    setInterval(() => {
      if (this.networkStatus.isOnline) {
        this.syncPendingOperations();
      }
    }, 5 * 60 * 1000); // Sync every 5 minutes
  }

  private generateDeviceId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
