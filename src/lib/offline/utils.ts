import { openDB } from 'idb';
import { DB_NAME, DB_VERSION, STORE_NAMES } from './constants';
import type { OfflineDBSchema } from './types';

export async function initializeOfflineDB() {
  try {
    const db = await openDB<OfflineDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(STORE_NAMES.MEDICATIONS)) {
          const medicationsStore = db.createObjectStore(STORE_NAMES.MEDICATIONS, {
            keyPath: 'id',
            autoIncrement: true
          });
          medicationsStore.createIndex('by-date', 'createdAt');
          medicationsStore.createIndex('by-tenant', 'tenantId');
          medicationsStore.createIndex('by-user', 'userId');
        }

        if (!db.objectStoreNames.contains(STORE_NAMES.TEMPLATES)) {
          const templatesStore = db.createObjectStore(STORE_NAMES.TEMPLATES, {
            keyPath: 'id',
            autoIncrement: true
          });
          templatesStore.createIndex('by-date', 'createdAt');
          templatesStore.createIndex('by-tenant', 'tenantId');
          templatesStore.createIndex('by-user', 'userId');
        }

        if (!db.objectStoreNames.contains(STORE_NAMES.SCHEDULED_MEDICATIONS)) {
          const scheduledMedsStore = db.createObjectStore(STORE_NAMES.SCHEDULED_MEDICATIONS, {
            keyPath: 'id',
            autoIncrement: true
          });
          scheduledMedsStore.createIndex('by-date', 'scheduledDate');
          scheduledMedsStore.createIndex('by-tenant', 'tenantId');
          scheduledMedsStore.createIndex('by-user', 'userId');
        }

        if (!db.objectStoreNames.contains(STORE_NAMES.PENDING_SYNC)) {
          db.createObjectStore(STORE_NAMES.PENDING_SYNC, {
            keyPath: 'id',
            autoIncrement: true
          });
        }

        if (!db.objectStoreNames.contains(STORE_NAMES.AUDIT_LOGS)) {
          const auditStore = db.createObjectStore(STORE_NAMES.AUDIT_LOGS, {
            keyPath: 'id',
            autoIncrement: true
          });
          auditStore.createIndex('by-date', 'timestamp');
          auditStore.createIndex('by-tenant', 'tenantId');
          auditStore.createIndex('by-user', 'userId');
        }

        if (!db.objectStoreNames.contains(STORE_NAMES.OFFLINE_QUEUE)) {
          const queueStore = db.createObjectStore(STORE_NAMES.OFFLINE_QUEUE, {
            keyPath: 'id',
            autoIncrement: true
          });
          queueStore.createIndex('by-queue', 'collection');
        }
      }
    });

    return db;
  } catch (error) {
    console.error('Failed to initialize offline database:', error);
    throw error;
  }
}

export async function clearOfflineData() {
  try {
    const db = await openDB<OfflineDBSchema>(DB_NAME, DB_VERSION);
    const tx = db.transaction(Object.values(STORE_NAMES), 'readwrite');
    
    const clearPromises = Object.values(STORE_NAMES).map(storeName => 
      tx.objectStore(storeName).clear()
    );
    
    await Promise.all(clearPromises);
    await tx.done;
  } catch (error) {
    console.error('Failed to clear offline data:', error);
    throw error;
  }
}

export async function getOfflineStatus() {
  try {
    const db = await openDB<OfflineDBSchema>(DB_NAME, DB_VERSION);
    const stores = Object.values(STORE_NAMES);
    
    const counts = await Promise.all(
      stores.map(async storeName => {
        const count = await db.count(storeName);
        return { [storeName]: count };
      })
    );
    
    return counts.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  } catch (error) {
    console.error('Failed to get offline status:', error);
    throw error;
  }
}


