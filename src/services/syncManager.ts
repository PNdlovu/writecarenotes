import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';

interface SyncQueue {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  collection: string;
  data: any;
  timestamp: number;
  retries: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'FAILED';
  error?: string;
}

interface ConflictResolution {
  action: 'LOCAL' | 'REMOTE' | 'MERGE';
  mergedData?: any;
}

class SyncManager {
  private db: IDBPDatabase | null = null;
  private syncInProgress = false;
  private maxRetries = 3;
  private syncInterval = 5000; // 5 seconds
  private conflictHandlers: Map<string, (local: any, remote: any) => Promise<ConflictResolution>> = new Map();

  async initialize() {
    this.db = await openDB('sync-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }
      },
    });

    // Start background sync
    this.startBackgroundSync();
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.sync());
    window.addEventListener('offline', () => this.pauseSync());
  }

  async queueOperation(operation: Omit<SyncQueue, 'id' | 'timestamp' | 'retries' | 'status'>) {
    if (!this.db) throw new Error('Sync manager not initialized');

    const syncItem: SyncQueue = {
      id: uuidv4(),
      ...operation,
      timestamp: Date.now(),
      retries: 0,
      status: 'PENDING',
    };

    await this.db.add('syncQueue', syncItem);
    this.sync(); // Attempt immediate sync
  }

  registerConflictHandler(
    collection: string,
    handler: (local: any, remote: any) => Promise<ConflictResolution>
  ) {
    this.conflictHandlers.set(collection, handler);
  }

  private async sync() {
    if (!navigator.onLine || this.syncInProgress || !this.db) return;

    try {
      this.syncInProgress = true;
      const pendingItems = await this.db.getAll('syncQueue');
      
      for (const item of pendingItems) {
        if (item.status === 'PENDING') {
          await this.processSyncItem(item);
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processSyncItem(item: SyncQueue) {
    try {
      // Mark as in progress
      await this.db?.put('syncQueue', { ...item, status: 'IN_PROGRESS' });

      // Get remote version if exists
      const remoteVersion = await this.fetchRemoteVersion(item.collection, item.data.id);

      if (remoteVersion) {
        // Handle conflict
        const resolution = await this.resolveConflict(item.collection, item.data, remoteVersion);
        if (resolution.action === 'MERGE') {
          item.data = resolution.mergedData;
        } else if (resolution.action === 'REMOTE') {
          // Skip this sync item
          await this.db?.delete('syncQueue', item.id);
          return;
        }
      }

      // Perform operation
      await this.performOperation(item);

      // Remove from queue on success
      await this.db?.delete('syncQueue', item.id);
    } catch (error) {
      // Handle failure
      const newRetries = item.retries + 1;
      if (newRetries >= this.maxRetries) {
        await this.db?.put('syncQueue', {
          ...item,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      } else {
        await this.db?.put('syncQueue', {
          ...item,
          status: 'PENDING',
          retries: newRetries,
        });
      }
    }
  }

  private async fetchRemoteVersion(collection: string, id: string): Promise<any> {
    const response = await fetch(`/api/${collection}/${id}`);
    if (response.ok) {
      return response.json();
    }
    return null;
  }

  private async resolveConflict(
    collection: string,
    local: any,
    remote: any
  ): Promise<ConflictResolution> {
    const handler = this.conflictHandlers.get(collection);
    if (handler) {
      return handler(local, remote);
    }
    
    // Default to server version
    return { action: 'REMOTE' };
  }

  private async performOperation(item: SyncQueue): Promise<void> {
    const endpoint = `/api/${item.collection}`;
    let method: string;
    
    switch (item.operation) {
      case 'CREATE':
        method = 'POST';
        break;
      case 'UPDATE':
        method = 'PUT';
        break;
      case 'DELETE':
        method = 'DELETE';
        break;
      default:
        throw new Error(`Unknown operation: ${item.operation}`);
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
  }

  private startBackgroundSync() {
    setInterval(() => {
      if (navigator.onLine) {
        this.sync();
      }
    }, this.syncInterval);
  }

  private pauseSync() {
    this.syncInProgress = false;
  }
}

export const syncManager = new SyncManager();


