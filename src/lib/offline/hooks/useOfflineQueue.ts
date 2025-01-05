import { useState, useCallback } from 'react';
import { openDB } from 'idb';
import { toast } from '@/components/ui/Toast/use-toast';
import { DB_NAME, DB_VERSION, STORE_NAMES } from '../constants';
import type { OfflineDBSchema, OfflineQueueItem } from '../types';

export function useOfflineQueue() {
  const [isProcessing, setIsProcessing] = useState(false);

  const addToQueue = useCallback(async (item: Omit<OfflineQueueItem, 'timestamp'>) => {
    try {
      const db = await openDB<OfflineDBSchema>(DB_NAME, DB_VERSION);
      const tx = db.transaction(STORE_NAMES.OFFLINE_QUEUE, 'readwrite');
      const store = tx.objectStore(STORE_NAMES.OFFLINE_QUEUE);

      const queueItem: OfflineQueueItem = {
        ...item,
        timestamp: Date.now()
      };

      await store.add(queueItem);

      toast({
        title: 'Action Queued',
        description: 'Will be processed when back online',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error adding to offline queue:', error);
      toast({
        title: 'Error',
        description: 'Failed to queue action',
        variant: 'destructive'
      });
      throw error;
    }
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const db = await openDB<OfflineDBSchema>(DB_NAME, DB_VERSION);
      const tx = db.transaction(STORE_NAMES.OFFLINE_QUEUE, 'readwrite');
      const store = tx.objectStore(STORE_NAMES.OFFLINE_QUEUE);
      const items = await store.getAll();

      for (const item of items) {
        try {
          // Process each item (implement your API calls here)
          await fetch(`/api/${item.collection}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(item.data)
          });

          // Remove processed item
          await store.delete(item.id!);
        } catch (error) {
          console.error('Error processing queue item:', error);
          // Leave item in queue for retry
        }
      }

      toast({
        title: 'Queue Processed',
        description: 'All queued actions have been processed',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error processing offline queue:', error);
      toast({
        title: 'Error',
        description: 'Failed to process queue',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  return {
    addToQueue,
    processQueue,
    isProcessing
  };
}


