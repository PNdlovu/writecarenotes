import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SyncQueue {
  id: string;
  timestamp: number;
  action: string;
  endpoint: string;
  method: string;
  payload: any;
  retryCount: number;
}

interface WriteCareDB extends DBSchema {
  syncQueue: {
    key: string;
    value: SyncQueue;
    indexes: { 'by-timestamp': number };
  };
  offlineData: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'writecare-offline';
const DB_VERSION = 1;

export class OfflineSync {
  private db: IDBPDatabase<WriteCareDB> | null = null;

  async init() {
    this.db = await openDB<WriteCareDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Sync queue store
        const syncQueueStore = db.createObjectStore('syncQueue', {
          keyPath: 'id',
        });
        syncQueueStore.createIndex('by-timestamp', 'timestamp');

        // Offline data store
        db.createObjectStore('offlineData', { keyPath: 'id' });
      },
    });
  }

  async queueAction(action: {
    endpoint: string;
    method: string;
    payload?: any;
  }) {
    if (!this.db) await this.init();

    const syncItem: SyncQueue = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      action: 'API_REQUEST',
      endpoint: action.endpoint,
      method: action.method,
      payload: action.payload,
      retryCount: 0,
    };

    await this.db!.add('syncQueue', syncItem);
  }

  async processSyncQueue() {
    if (!this.db) await this.init();

    const queue = await this.db!.getAllFromIndex(
      'syncQueue',
      'by-timestamp'
    );

    for (const item of queue) {
      try {
        const response = await fetch(item.endpoint, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: item.payload ? JSON.stringify(item.payload) : undefined,
        });

        if (response.ok) {
          await this.db!.delete('syncQueue', item.id);
        } else {
          item.retryCount++;
          if (item.retryCount < 5) {
            await this.db!.put('syncQueue', item);
          } else {
            await this.db!.delete('syncQueue', item.id);
            console.error(`Failed to sync item after 5 retries: ${item.id}`);
          }
        }
      } catch (error) {
        console.error(`Error processing sync item ${item.id}:`, error);
      }
    }
  }

  async saveOfflineData(key: string, data: any) {
    if (!this.db) await this.init();
    await this.db!.put('offlineData', { id: key, ...data });
  }

  async getOfflineData(key: string) {
    if (!this.db) await this.init();
    return await this.db!.get('offlineData', key);
  }

  async clearOfflineData() {
    if (!this.db) await this.init();
    await this.db!.clear('offlineData');
  }
} 


