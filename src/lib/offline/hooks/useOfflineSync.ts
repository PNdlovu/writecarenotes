import { useState, useCallback, useEffect } from 'react';
import { openDB } from 'idb';
import { toast } from '@/components/ui/use-toast';
import { DB_NAME, DB_VERSION, STORE_NAMES } from '../constants';
import type { OfflineDBSchema } from '../types';
import { useOfflineQueue } from './useOfflineQueue';

export function useOfflineSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { processQueue, isProcessing } = useOfflineQueue();

  const syncData = useCallback(async () => {
    if (isSyncing || isProcessing) return;

    try {
      setIsSyncing(true);
      const db = await openDB<OfflineDBSchema>(DB_NAME, DB_VERSION);

      // Process any pending offline actions first
      await processQueue();

      // Sync each store
      for (const storeName of Object.values(STORE_NAMES)) {
        if (storeName === STORE_NAMES.OFFLINE_QUEUE) continue;

        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        
        // Get last sync timestamp for this store
        const lastSync = await store.get('lastSync');
        
        // Fetch updates from server
        const response = await fetch(`/api/sync/${storeName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lastSync: lastSync?.timestamp || 0
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to sync ${storeName}`);
        }

        const updates = await response.json();

        // Apply updates to IndexedDB
        for (const item of updates) {
          await store.put(item);
        }

        // Update last sync timestamp
        await store.put({
          id: 'lastSync',
          timestamp: Date.now()
        });
      }

      setLastSyncTime(new Date());
      toast({
        title: 'Sync Complete',
        description: 'Your data is now up to date',
        variant: 'default'
      });
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: 'Sync Failed',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isProcessing, processQueue]);

  // Auto-sync when online
  useEffect(() => {
    const handleOnline = () => {
      syncData();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncData]);

  return {
    syncData,
    isSyncing,
    lastSyncTime
  };
}


