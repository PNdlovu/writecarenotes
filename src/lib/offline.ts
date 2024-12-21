/**
 * WriteCareNotes.com
 * @fileoverview Offline Sync Management
 * @version 1.0.0
 */

import { TenantContext } from './tenant';
import { OfflineError } from './errors';

interface SyncOperation {
  id: string;
  type: string;
  action: string;
  data: any;
  context: TenantContext;
  timestamp: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  error?: string;
}

interface SyncQueue {
  operations: SyncOperation[];
  lastSync: Date;
  isProcessing: boolean;
}

class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private queue: SyncQueue;
  private maxRetries: number = 3;
  private syncInterval: number = 5000; // 5 seconds
  private syncTimer?: NodeJS.Timer;

  private constructor() {
    this.queue = {
      operations: [],
      lastSync: new Date(),
      isProcessing: false,
    };
  }

  public static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  async queueSync(operation: {
    type: string;
    action: string;
    data: any;
    context: TenantContext;
  }): Promise<void> {
    const syncOp: SyncOperation = {
      id: Math.random().toString(36).substring(2, 15),
      ...operation,
      timestamp: new Date(),
      status: 'PENDING',
      retryCount: 0,
    };

    this.queue.operations.push(syncOp);
    await this.persistQueue();

    // Start sync if not already running
    if (!this.syncTimer) {
      this.startSync();
    }
  }

  async startSync(): Promise<void> {
    if (this.syncTimer) {
      return;
    }

    this.syncTimer = setInterval(async () => {
      if (!this.queue.isProcessing && this.queue.operations.length > 0) {
        await this.processQueue();
      }
    }, this.syncInterval);
  }

  async stopSync(): Promise<void> {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.queue.isProcessing) {
      return;
    }

    this.queue.isProcessing = true;

    try {
      const pendingOps = this.queue.operations.filter(op => op.status === 'PENDING');

      for (const op of pendingOps) {
        try {
          op.status = 'IN_PROGRESS';
          await this.persistQueue();

          await this.processSyncOperation(op);

          op.status = 'COMPLETED';
          await this.persistQueue();
        } catch (error) {
          op.retryCount++;
          op.error = error.message;

          if (op.retryCount >= this.maxRetries) {
            op.status = 'FAILED';
          } else {
            op.status = 'PENDING';
          }

          await this.persistQueue();
        }
      }

      // Clean up completed operations
      this.queue.operations = this.queue.operations.filter(op => 
        op.status !== 'COMPLETED' && 
        !(op.status === 'FAILED' && op.retryCount >= this.maxRetries)
      );

      this.queue.lastSync = new Date();
      await this.persistQueue();
    } finally {
      this.queue.isProcessing = false;
    }
  }

  private async processSyncOperation(operation: SyncOperation): Promise<void> {
    // Check network connectivity
    if (!navigator.onLine) {
      throw new OfflineError('No network connection available');
    }

    // Process based on operation type and action
    switch (operation.type) {
      case 'ORGANIZATION':
        await this.processOrganizationSync(operation);
        break;
      // Add other types as needed
      default:
        throw new OfflineError(`Unknown sync operation type: ${operation.type}`);
    }
  }

  private async processOrganizationSync(operation: SyncOperation): Promise<void> {
    switch (operation.action) {
      case 'CREATE':
        // Implement organization creation sync
        break;
      case 'UPDATE':
        // Implement organization update sync
        break;
      case 'DELETE':
        // Implement organization deletion sync
        break;
      case 'ADD_CARE_HOME':
        // Implement care home addition sync
        break;
      case 'REMOVE_CARE_HOME':
        // Implement care home removal sync
        break;
      case 'UPDATE_SETTINGS':
        // Implement settings update sync
        break;
      default:
        throw new OfflineError(`Unknown organization sync action: ${operation.action}`);
    }
  }

  private async persistQueue(): Promise<void> {
    try {
      localStorage.setItem('syncQueue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to persist sync queue:', error);
    }
  }

  private async loadQueue(): Promise<void> {
    try {
      const savedQueue = localStorage.getItem('syncQueue');
      if (savedQueue) {
        this.queue = JSON.parse(savedQueue);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  getQueueStatus(): {
    pendingCount: number;
    failedCount: number;
    lastSync: Date;
    isProcessing: boolean;
  } {
    return {
      pendingCount: this.queue.operations.filter(op => op.status === 'PENDING').length,
      failedCount: this.queue.operations.filter(op => op.status === 'FAILED').length,
      lastSync: this.queue.lastSync,
      isProcessing: this.queue.isProcessing,
    };
  }

  async retryFailedOperations(): Promise<void> {
    const failedOps = this.queue.operations.filter(op => op.status === 'FAILED');
    for (const op of failedOps) {
      op.status = 'PENDING';
      op.retryCount = 0;
      op.error = undefined;
    }
    await this.persistQueue();
  }

  async clearFailedOperations(): Promise<void> {
    this.queue.operations = this.queue.operations.filter(op => op.status !== 'FAILED');
    await this.persistQueue();
  }
}

export const offlineSync = OfflineSyncManager.getInstance(); 


