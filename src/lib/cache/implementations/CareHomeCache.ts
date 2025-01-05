import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface CareHomeCacheDB extends DBSchema {
  essentialData: {
    key: string;
    value: any;
    indexes: { 'by-timestamp': Date };
  };
  pendingChanges: {
    key: string;
    value: {
      timestamp: Date;
      changes: any[];
    };
  };
}

export class CareHomeCache {
  private db: IDBPDatabase<CareHomeCacheDB>;
  private readonly DB_NAME = 'care-home-cache';
  private readonly DB_VERSION = 1;

  async initialize(): Promise<void> {
    this.db = await openDB<CareHomeCacheDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('essentialData')) {
          const essentialStore = db.createObjectStore('essentialData');
          essentialStore.createIndex('by-timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('pendingChanges')) {
          db.createObjectStore('pendingChanges');
        }
      },
    });
  }

  async cacheEssentialData(key: string, data: any): Promise<void> {
    await this.db.put('essentialData', {
      ...data,
      timestamp: new Date(),
    }, key);
  }

  async getCachedData(key: string): Promise<any | null> {
    return await this.db.get('essentialData', key);
  }

  async storePendingChanges(key: string, changes: any[]): Promise<void> {
    await this.db.put('pendingChanges', {
      timestamp: new Date(),
      changes,
    }, key);
  }

  async getPendingChanges(key: string): Promise<any[] | null> {
    const record = await this.db.get('pendingChanges', key);
    return record ? record.changes : null;
  }

  async clearPendingChanges(key: string): Promise<void> {
    await this.db.delete('pendingChanges', key);
  }

  async getAllPendingChanges(): Promise<Map<string, any[]>> {
    const pendingChanges = new Map<string, any[]>();
    const keys = await this.db.getAllKeys('pendingChanges');
    
    for (const key of keys) {
      const changes = await this.getPendingChanges(key);
      if (changes) {
        pendingChanges.set(key.toString(), changes);
      }
    }

    return pendingChanges;
  }

  async clearExpiredCache(maxAge: number): Promise<void> {
    const tx = this.db.transaction('essentialData', 'readwrite');
    const store = tx.objectStore('essentialData');
    const index = store.index('by-timestamp');
    const cutoff = new Date(Date.now() - maxAge);

    let cursor = await index.openCursor();
    while (cursor) {
      if (cursor.value.timestamp < cutoff) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
  }

  async close(): Promise<void> {
    this.db.close();
  }
}


