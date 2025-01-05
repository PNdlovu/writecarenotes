/**
 * @fileoverview Offline Sync Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Custom hook for managing offline data synchronization in the accounting module
 */

import { useState, useEffect } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/lib/i18n';

interface SyncQueueItem {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export const useOfflineSync = () => {
  const { t } = useTranslation('accounting');
  const { isOnline } = useNetworkStatus();
  const { showToast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingEntries, setPendingEntries] = useState<number>(0);

  const {
    getAll: getAllQueueItems,
    add: addQueueItem,
    remove: removeQueueItem,
    update: updateQueueItem
  } = useIndexedDB<SyncQueueItem>('accountingSyncQueue');

  // Initialize sync queue monitoring
  useEffect(() => {
    const checkQueue = async () => {
      const items = await getAllQueueItems();
      setPendingEntries(items.length);
    };

    checkQueue();
  }, []);

  // Monitor online status and trigger sync when back online
  useEffect(() => {
    if (isOnline) {
      syncQueuedEntries();
    }
  }, [isOnline]);

  /**
   * Queue an entry for offline sync
   */
  const queueOfflineEntry = async (type: string, data: any) => {
    try {
      const queueItem: Omit<SyncQueueItem, 'id'> = {
        type,
        data,
        timestamp: Date.now(),
        retryCount: 0
      };

      await addQueueItem(queueItem);
      setPendingEntries(prev => prev + 1);

      showToast({
        title: t('offlineEntry.queued'),
        message: t('offlineEntry.willSyncWhenOnline'),
        type: 'info'
      });

      return true;
    } catch (error) {
      console.error('Failed to queue offline entry:', error);
      showToast({
        title: t('offlineEntry.error'),
        message: t('offlineEntry.createFailed'),
        type: 'error'
      });
      return false;
    }
  };

  /**
   * Sync all queued entries when back online
   */
  const syncQueuedEntries = async () => {
    if (isSyncing || !isOnline) return;

    try {
      setIsSyncing(true);
      const items = await getAllQueueItems();

      if (items.length === 0) {
        return;
      }

      showToast({
        title: t('sync.inProgress'),
        message: t('sync.pendingEntries', { count: items.length }),
        type: 'info'
      });

      for (const item of items) {
        try {
          await syncEntry(item);
          await removeQueueItem(item.id);
          setPendingEntries(prev => prev - 1);
        } catch (error) {
          console.error(`Failed to sync entry ${item.id}:`, error);
          
          // Update retry count and timestamp
          if (item.retryCount < 3) {
            await updateQueueItem({
              ...item,
              retryCount: item.retryCount + 1,
              timestamp: Date.now()
            });
          } else {
            // Move to error queue after 3 retries
            await moveToErrorQueue(item);
            await removeQueueItem(item.id);
            setPendingEntries(prev => prev - 1);
          }
        }
      }

      showToast({
        title: t('sync.complete'),
        message: t('sync.entriesSynced'),
        type: 'success'
      });
    } catch (error) {
      console.error('Sync failed:', error);
      showToast({
        title: t('sync.error'),
        message: t('sync.failed'),
        type: 'error'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Sync a single entry
   */
  const syncEntry = async (item: SyncQueueItem) => {
    switch (item.type) {
      case 'journalEntry':
        await syncJournalEntry(item.data);
        break;
      // Add other sync types here
      default:
        throw new Error(`Unknown sync type: ${item.type}`);
    }
  };

  /**
   * Sync a journal entry
   */
  const syncJournalEntry = async (data: any) => {
    const response = await fetch('/api/accounting/journal-entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to sync journal entry: ${response.statusText}`);
    }

    return response.json();
  };

  /**
   * Move failed items to error queue for manual resolution
   */
  const moveToErrorQueue = async (item: SyncQueueItem) => {
    const errorQueue = useIndexedDB<SyncQueueItem>('accountingErrorQueue');
    await errorQueue.add({
      ...item,
      timestamp: Date.now()
    });
  };

  return {
    isOnline,
    isSyncing,
    pendingEntries,
    queueOfflineEntry,
    syncQueuedEntries
  };
}; 