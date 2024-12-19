import { useState, useCallback } from 'react';
import { DatabaseManager } from '../utils/db';
import { syncManager } from '../utils/sync';

interface UseSyncOptions {
  onSyncStart?: () => void;
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
  autoSync?: boolean;
}

interface SyncResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  sync: () => Promise<void>;
  save: (data: T) => Promise<void>;
  delete: () => Promise<void>;
}

export function useSync<T>(
  entityType: string,
  id?: string,
  options: UseSyncOptions = {}
): SyncResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const db = DatabaseManager.getInstance();

  const sync = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      options.onSyncStart?.();

      // Try to get from local DB first
      const localData = await db.getSchedule(id);
      if (localData) {
        setData(localData as T);
      }

      // If we're online and autoSync is enabled, sync with server
      if (navigator.onLine && options.autoSync !== false) {
        await syncManager.syncChanges();
      }

      options.onSyncComplete?.();
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onSyncError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [id, options]);

  const save = useCallback(async (newData: T) => {
    try {
      setIsLoading(true);
      options.onSyncStart?.();

      // Save to local DB
      await db.saveSchedule({
        id,
        entityType,
        data: newData,
      });

      setData(newData);

      // If we're online and autoSync is enabled, sync with server
      if (navigator.onLine && options.autoSync !== false) {
        await syncManager.syncChanges();
      }

      options.onSyncComplete?.();
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onSyncError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [id, entityType, options]);

  const deleteEntity = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      options.onSyncStart?.();

      // Delete from local DB
      await db.deleteSchedule(id);

      setData(null);

      // If we're online and autoSync is enabled, sync with server
      if (navigator.onLine && options.autoSync !== false) {
        await syncManager.syncChanges();
      }

      options.onSyncComplete?.();
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onSyncError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [id, options]);

  return {
    data,
    isLoading,
    error,
    sync,
    save,
    delete: deleteEntity,
  };
}
