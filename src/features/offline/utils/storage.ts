// src/features/offline/utils/storage.ts
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'writecarenotes_offline';
const DB_VERSION = 1;

interface PendingChange {
  id: string;
  timestamp: number;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
}

interface OfflineStorage {
  getPendingChanges: () => Promise<PendingChange[]>;
  addPendingChange: (change: Omit<PendingChange, 'id' | 'timestamp'>) => Promise<void>;
  removePendingChange: (id: string) => Promise<void>;
  sync: () => Promise<void>;
}

let dbInstance: IDBPDatabase | null = null;

async function getDB() {
  if (!dbInstance) {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create stores
        if (!db.objectStoreNames.contains('pendingChanges')) {
          const pendingChangesStore = db.createObjectStore('pendingChanges', {
            keyPath: 'id',
            autoIncrement: true,
          });
          pendingChangesStore.createIndex('timestamp', 'timestamp');
          pendingChangesStore.createIndex('entity', 'entity');
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', {
            keyPath: 'key',
          });
          cacheStore.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }
  return dbInstance;
}

export async function getOfflineStorage(): Promise<OfflineStorage> {
  const db = await getDB();

  return {
    async getPendingChanges() {
      return db.getAllFromIndex('pendingChanges', 'timestamp');
    },

    async addPendingChange(change) {
      const timestamp = Date.now();
      await db.add('pendingChanges', {
        ...change,
        id: `${change.entity}_${timestamp}`,
        timestamp,
      });
    },

    async removePendingChange(id) {
      await db.delete('pendingChanges', id);
    },

    async sync() {
      const changes = await db.getAllFromIndex('pendingChanges', 'timestamp');
      
      // Process changes in order
      for (const change of changes) {
        try {
          // Implement your sync logic here
          // This should handle different types of changes (create/update/delete)
          // and different entities (notes/schedules/etc)
          
          // Example:
          // await syncChange(change);
          
          // If successful, remove the change
          await db.delete('pendingChanges', change.id);
        } catch (error) {
          console.error(`Failed to sync change ${change.id}:`, error);
          throw error;
        }
      }
    },
  };
}

// Optional: Add cleanup function to close DB connection
export async function closeOfflineStorage() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
