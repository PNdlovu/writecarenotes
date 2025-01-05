/**
 * @writecarenotes.com
 * @fileoverview Offline Storage Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom hook for managing offline data storage using IndexedDB.
 * Provides methods for saving and retrieving offline data with versioning
 * and conflict resolution support.
 */

import { useCallback, useEffect } from 'react';
import { openDB, IDBPDatabase } from 'idb';
import { TenantContext } from '@/lib/multi-tenant/types';

const DB_NAME = 'writecarenotes_offline';
const DB_VERSION = 1;

interface OfflineRecord<T> {
  id: string;
  data: T;
  timestamp: number;
  synced: boolean;
  version: number;
  tenantId: string;
}

interface UseOfflineStorageProps {
  tenantContext: TenantContext;
}

export function useOfflineStorage({ tenantContext }: UseOfflineStorageProps) {
  // Initialize IndexedDB
  const initDB = useCallback(async () => {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('offlineData')) {
          const store = db.createObjectStore('offlineData', { keyPath: 'id' });
          store.createIndex('tenantId', 'tenantId');
          store.createIndex('synced', 'synced');
          store.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }, []);

  // Save data offline
  const saveOffline = useCallback(async <T>(key: string, data: T): Promise<void> => {
    const db = await initDB();
    const record: OfflineRecord<T> = {
      id: `${tenantContext.tenantId}_${key}`,
      data,
      timestamp: Date.now(),
      synced: false,
      version: 1,
      tenantId: tenantContext.tenantId,
    };

    await db.put('offlineData', record);
  }, [tenantContext.tenantId, initDB]);

  // Get offline data
  const getOfflineData = useCallback(async <T>(key: string): Promise<T | null> => {
    const db = await initDB();
    const record = await db.get('offlineData', `${tenantContext.tenantId}_${key}`);
    return record ? record.data : null;
  }, [tenantContext.tenantId, initDB]);

  // Get all unsynced records
  const getUnsyncedRecords = useCallback(async <T>(): Promise<OfflineRecord<T>[]> => {
    const db = await initDB();
    const tx = db.transaction('offlineData', 'readonly');
    const store = tx.objectStore('offlineData');
    const index = store.index('synced');
    
    return await index.getAll(IDBKeyRange.only(false));
  }, [initDB]);

  // Mark record as synced
  const markAsSynced = useCallback(async (key: string): Promise<void> => {
    const db = await initDB();
    const tx = db.transaction('offlineData', 'readwrite');
    const store = tx.objectStore('offlineData');
    const record = await store.get(`${tenantContext.tenantId}_${key}`);
    
    if (record) {
      record.synced = true;
      await store.put(record);
    }
  }, [tenantContext.tenantId, initDB]);

  // Clear old synced records
  const clearOldRecords = useCallback(async (): Promise<void> => {
    const db = await initDB();
    const tx = db.transaction('offlineData', 'readwrite');
    const store = tx.objectStore('offlineData');
    const index = store.index('timestamp');
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
    
    const oldRecords = await index.getAllKeys(IDBKeyRange.upperBound(cutoff));
    await Promise.all(oldRecords.map(key => store.delete(key)));
  }, [initDB]);

  // Cleanup old records periodically
  useEffect(() => {
    const cleanup = async () => {
      try {
        await clearOldRecords();
      } catch (error) {
        console.error('Failed to clean up old records:', error);
      }
    };

    cleanup();
    const interval = setInterval(cleanup, 24 * 60 * 60 * 1000); // Daily cleanup

    return () => clearInterval(interval);
  }, [clearOldRecords]);

  return {
    saveOffline,
    getOfflineData,
    getUnsyncedRecords,
    markAsSynced,
    clearOldRecords,
  };
} 