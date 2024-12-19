import { openDB, IDBPDatabase } from 'idb';
import { apiClient } from './apiClient';
import { tenantService } from './tenantService';
import { API_CONFIG } from '@/config/app-config';

interface SyncQueueItem {
  id: string;
  endpoint: string;
  method: string;
  data: any;
  timestamp: number;
  retryCount: number;
  tenantId: string;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
}

interface SyncStats {
  pending: number;
  failed: number;
  completed: number;
  lastSync: Date | null;
}

class SyncService {
  private static instance: SyncService;
  private db: IDBPDatabase | null = null;
  private syncInProgress = false;
  private maxRetries = 3;
  private batchSize = 10;
  private syncInterval = 60000; // 1 minute
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {
    this.initDatabase();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private async initDatabase(): Promise<void> {
    try {
      this.db = await openDB('syncQueue', 1, {
        upgrade(db) {
          // Queue store for pending operations
          if (!db.objectStoreNames.contains('queue')) {
            const queueStore = db.createObjectStore('queue', {
              keyPath: 'id',
            });
            queueStore.createIndex('status', 'status');
            queueStore.createIndex('timestamp', 'timestamp');
            queueStore.createIndex('tenantId', 'tenantId');
          }

          // Store for tracking sync metadata
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', {
              keyPath: 'key',
            });
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize sync database:', error);
      throw error;
    }
  }

  // Queue Management
  async addToQueue(
    endpoint: string,
    method: string,
    data: any,
    tenantId: string
  ): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const queueItem: SyncQueueItem = {
      id: crypto.randomUUID(),
      endpoint,
      method,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      tenantId,
      status: 'pending',
    };

    await this.db.add('queue', queueItem);
    this.triggerSync();
    return queueItem.id;
  }

  async removeFromQueue(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.delete('queue', id);
  }

  async getQueueItem(id: string): Promise<SyncQueueItem | undefined> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.get('queue', id);
  }

  // Sync Process
  async startSync(): Promise<void> {
    if (this.syncInProgress || !this.db) {
      return;
    }

    this.syncInProgress = true;
    const currentTenant = tenantService.getCurrentTenant();

    try {
      // Process items in batches
      let processed = 0;
      while (processed < this.batchSize) {
        const items = await this.db.getAllFromIndex(
          'queue',
          'status',
          'pending'
        );

        if (items.length === 0) break;

        // Process tenant-specific items first
        const item = currentTenant
          ? items.find((i) => i.tenantId === currentTenant.id) || items[0]
          : items[0];

        await this.processSyncItem(item);
        processed++;
      }

      // Update last sync timestamp
      await this.updateLastSync();
    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    if (!this.db) return;

    try {
      // Update status to processing
      await this.db.put('queue', { ...item, status: 'processing' });

      // Attempt to sync with server
      await apiClient.request(item.endpoint, {
        method: item.method,
        body: JSON.stringify(item.data),
        tenant: item.tenantId,
      });

      // Mark as completed and remove from queue
      await this.db.put('queue', { ...item, status: 'completed' });
      await this.removeFromQueue(item.id);
    } catch (error: any) {
      const shouldRetry = item.retryCount < this.maxRetries;
      const updatedItem = {
        ...item,
        status: shouldRetry ? 'pending' : 'failed',
        retryCount: item.retryCount + 1,
        error: error.message,
      };

      await this.db.put('queue', updatedItem);
    }
  }

  // Conflict Resolution
  async resolveConflict(
    queueItemId: string,
    resolution: 'local' | 'remote' | 'merge',
    mergedData?: any
  ): Promise<void> {
    const item = await this.getQueueItem(queueItemId);
    if (!item) return;

    switch (resolution) {
      case 'local':
        // Retry with force flag
        await this.addToQueue(
          item.endpoint,
          item.method,
          { ...item.data, force: true },
          item.tenantId
        );
        break;

      case 'remote':
        // Remove local changes
        await this.removeFromQueue(queueItemId);
        break;

      case 'merge':
        if (!mergedData) {
          throw new Error('Merged data required for merge resolution');
        }
        // Add merged data to queue
        await this.addToQueue(
          item.endpoint,
          item.method,
          mergedData,
          item.tenantId
        );
        break;
    }
  }

  // Background Sync
  startBackgroundSync(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      if (navigator.onLine) {
        this.triggerSync();
      }
    }, this.syncInterval);

    // Listen for online/offline events
    window.addEventListener('online', () => this.triggerSync());
  }

  stopBackgroundSync(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Stats and Monitoring
  async getSyncStats(): Promise<SyncStats> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const [pending, failed, completed] = await Promise.all([
      this.db.countFromIndex('queue', 'status', 'pending'),
      this.db.countFromIndex('queue', 'status', 'failed'),
      this.db.countFromIndex('queue', 'status', 'completed'),
    ]);

    const metadata = await this.db.get('metadata', 'lastSync');

    return {
      pending,
      failed,
      completed,
      lastSync: metadata ? new Date(metadata.value) : null,
    };
  }

  private async updateLastSync(): Promise<void> {
    if (!this.db) return;

    await this.db.put('metadata', {
      key: 'lastSync',
      value: new Date().toISOString(),
    });
  }

  // Utility Methods
  private triggerSync(): void {
    if (navigator.onLine) {
      this.startSync();
    }
  }

  async clearQueue(): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction('queue', 'readwrite');
    await tx.objectStore('queue').clear();
  }

  async retryFailedItems(): Promise<void> {
    if (!this.db) return;

    const failedItems = await this.db.getAllFromIndex('queue', 'status', 'failed');
    for (const item of failedItems) {
      await this.db.put('queue', {
        ...item,
        status: 'pending',
        retryCount: 0,
      });
    }

    this.triggerSync();
  }
}

export const syncService = SyncService.getInstance();


