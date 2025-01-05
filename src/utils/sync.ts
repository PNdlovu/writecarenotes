import { DatabaseManager } from './db';

interface SyncConfig {
  autoSync: boolean;
  syncInterval: number;
  maxRetries: number;
  batchSize: number;
}

class SyncManager {
  private db: DatabaseManager;
  private syncInProgress: boolean = false;
  private periodicSyncRegistered: boolean = false;
  private config: SyncConfig = {
    autoSync: true,
    syncInterval: 5, // minutes
    maxRetries: 3,
    batchSize: 50,
  };

  private static instance: SyncManager;

  private constructor() {
    this.db = DatabaseManager.getInstance();
  }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  async initialize(config?: Partial<SyncConfig>): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    await this.db.connect();
    await this.registerPeriodicSync();
    this.setupNetworkListeners();
  }

  private async registerPeriodicSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'periodic-background-sync' in registration) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('periodicSync' in registration) {
          await registration.periodicSync.register('schedule-sync', {
            minInterval: this.config.syncInterval * 60 * 1000, // Convert minutes to milliseconds
          });
          this.periodicSyncRegistered = true;
        }
      } catch (error) {
        console.error('Failed to register periodic sync:', error);
      }
    }
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      if (this.config.autoSync) {
        this.syncChanges();
      }
    });

    window.addEventListener('message', (event) => {
      if (event.data.type === 'BACKGROUND_SYNC_COMPLETE') {
        this.handleSyncComplete(event.data.timestamp);
      }
    });
  }

  async syncChanges(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) return;

    try {
      this.syncInProgress = true;
      const changes = await this.db.getChanges(this.config.batchSize);
      
      for (const change of changes) {
        if (change.retries >= this.config.maxRetries) {
          continue;
        }

        try {
          await this.processChange(change);
          await this.db.markChangeProcessed(change.id);
        } catch (error) {
          await this.db.markChangeError(change.id, error.message);
          console.error(`Failed to process change ${change.id}:`, error);
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processChange(change: any): Promise<void> {
    const endpoint = `/api/schedule/${change.entityType}`;
    let method: string;
    let body: any;

    switch (change.type) {
      case 'create':
        method = 'POST';
        body = change.data;
        break;
      case 'update':
        method = 'PUT';
        body = change.data;
        break;
      case 'delete':
        method = 'DELETE';
        body = { id: change.data.id };
        break;
      default:
        throw new Error(`Unknown change type: ${change.type}`);
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  private async handleSyncComplete(timestamp: string): Promise<void> {
    const pendingSchedules = await this.db.getPendingSchedules();
    for (const schedule of pendingSchedules) {
      schedule.syncStatus = 'synced';
      schedule.lastModified = new Date(timestamp);
      await this.db.saveSchedule(schedule.data);
    }

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('syncComplete', {
      detail: { timestamp }
    }));
  }

  async registerBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in registration) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('offline-changes');
      } catch (error) {
        console.error('Failed to register background sync:', error);
      }
    }
  }

  async getStorageUsage(): Promise<{
    usage: number;
    quota: number;
    percentUsed: number;
  }> {
    const estimate = await this.db.getStorageEstimate();
    return {
      ...estimate,
      percentUsed: (estimate.usage / estimate.quota) * 100,
    };
  }

  async clearStorage(): Promise<void> {
    await this.db.clearStorage();
  }

  async updateConfig(newConfig: Partial<SyncConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    if (this.periodicSyncRegistered) {
      await this.registerPeriodicSync();
    }
  }
}

export const syncManager = SyncManager.getInstance();
