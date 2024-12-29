/**
 * @fileoverview Hook for managing offline data synchronization
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { useNetwork } from './use-network';
import { apiClient } from '@/lib/api-client';
import { OfflineError } from '@/lib/errors';

interface SyncAction<T = any> {
  id: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete';
  data: T;
  retryCount: number;
  module: string;
  status: 'pending' | 'processing' | 'failed';
  error?: string;
}

interface OfflineDB extends DBSchema {
  syncActions: {
    key: string;
    value: SyncAction;
    indexes: {
      'by-module': string;
      'by-status': string;
      'by-timestamp': string;
    };
  };
}

const DB_NAME = 'writecarenotes_offline';
const STORE_NAME = 'syncActions';
const MAX_RETRIES = 3;

async function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  return openDB<OfflineDB>(DB_NAME, 1, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: 'id',
      });
      store.createIndex('by-module', 'module');
      store.createIndex('by-status', 'status');
      store.createIndex('by-timestamp', 'timestamp');
    },
  });
}

export function useOfflineSync(module: string) {
  const [isSyncing, setIsSyncing] = useState(false);
  const { isOnline } = useNetwork();

  const queueOfflineAction = useCallback(async <T>(type: SyncAction['type'], data: T): Promise<T> => {
    if (isOnline) {
      throw new Error('Cannot queue offline action while online');
    }

    const db = await getDB();
    const action: SyncAction<T> = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type,
      data,
      retryCount: 0,
      module,
      status: 'pending',
    };

    await db.add(STORE_NAME, action);
    return data;
  }, [isOnline, module]);

  const syncOfflineActions = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    try {
      setIsSyncing(true);
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const index = tx.store.index('by-module');
      const actions = await index.getAll(module);

      for (const action of actions) {
        if (action.status === 'processing' || action.retryCount >= MAX_RETRIES) {
          continue;
        }

        try {
          action.status = 'processing';
          await tx.store.put(action);

          switch (action.type) {
            case 'create':
              await apiClient.post(`/${module}`, action.data);
              break;
            case 'update':
              await apiClient.patch(`/${module}/${action.data.id}`, action.data);
              break;
            case 'delete':
              await apiClient.delete(`/${module}/${action.data.id}`);
              break;
          }

          await tx.store.delete(action.id);
        } catch (error) {
          action.status = 'failed';
          action.retryCount++;
          action.error = error instanceof Error ? error.message : 'Unknown error';
          await tx.store.put(action);
        }
      }

      await tx.done;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, module]);

  const getPendingActions = useCallback(async (): Promise<SyncAction[]> => {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.store.index('by-module');
    return index.getAll(module);
  }, [module]);

  const clearFailedActions = useCallback(async (): Promise<void> => {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const index = tx.store.index('by-module');
    const actions = await index.getAll(module);

    for (const action of actions) {
      if (action.status === 'failed' && action.retryCount >= MAX_RETRIES) {
        await tx.store.delete(action.id);
      }
    }

    await tx.done;
  }, [module]);

  return {
    isSyncing,
    queueOfflineAction,
    syncOfflineActions,
    getPendingActions,
    clearFailedActions,
  };
} 