/**
 * @writecarenotes.com
 * @fileoverview React hook for offline synchronization
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * React hook providing offline synchronization capabilities for components.
 * Manages offline data storage, synchronization, and network status monitoring.
 * Implements enterprise-grade offline capabilities for healthcare applications.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { OfflineService } from '../offlineService';
import { 
  OfflineStatus, 
  SyncProgressEvent, 
  DataOptions,
  OfflineError,
  ErrorCode
} from '../types';
import { EVENTS } from '../constants';
import { checkBrowserSupport } from '../utils';

interface UseOfflineSyncOptions<T> {
  storeName: string;
  onSyncComplete?: (event: SyncProgressEvent) => void;
  onSyncError?: (error: OfflineError) => void;
  onNetworkChange?: (isOnline: boolean) => void;
  onStorageWarning?: (usage: number, quota: number) => void;
}

interface UseOfflineSyncResult<T> {
  saveData: (id: string, data: T, options?: DataOptions) => Promise<void>;
  getData: (id: string) => Promise<T | null>;
  getAll: () => Promise<T[]>;
  status: OfflineStatus | null;
  isInitialized: boolean;
  error: OfflineError | null;
  syncProgress: SyncProgressEvent | null;
  forceSyncNow: () => Promise<void>;
}

export function useOfflineSync<T>({
  storeName,
  onSyncComplete,
  onSyncError,
  onNetworkChange,
  onStorageWarning
}: UseOfflineSyncOptions<T>): UseOfflineSyncResult<T> {
  const [status, setStatus] = useState<OfflineStatus | null>(null);
  const [error, setError] = useState<OfflineError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgressEvent | null>(null);
  
  const serviceRef = useRef<OfflineService<T> | null>(null);

  // Initialize the offline service
  useEffect(() => {
    const initService = async () => {
      try {
        if (!checkBrowserSupport()) {
          throw new OfflineError(
            ErrorCode.NOT_INITIALIZED,
            'Browser does not support required features'
          );
        }

        if (!serviceRef.current) {
          serviceRef.current = new OfflineService<T>(storeName);
          await serviceRef.current.init();
          
          // Set up event listeners
          serviceRef.current.on(EVENTS.SYNC_COMPLETED, (event: SyncProgressEvent) => {
            setSyncProgress(event);
            onSyncComplete?.(event);
          });

          serviceRef.current.on(EVENTS.SYNC_ERROR, (error: OfflineError) => {
            setError(error);
            onSyncError?.(error);
          });

          serviceRef.current.on(EVENTS.NETWORK_STATUS_CHANGED, ({ online }) => {
            onNetworkChange?.(online);
          });

          serviceRef.current.on(EVENTS.STORAGE_WARNING, ({ usage, quota }) => {
            onStorageWarning?.(usage, quota);
          });

          setIsInitialized(true);
        }

        // Get initial status
        const initialStatus = await serviceRef.current.getStatus();
        setStatus(initialStatus);
      } catch (err) {
        const offlineError = err instanceof OfflineError 
          ? err 
          : new OfflineError(ErrorCode.NOT_INITIALIZED, 'Failed to initialize offline service');
        setError(offlineError);
      }
    };

    initService();

    // Cleanup
    return () => {
      if (serviceRef.current) {
        serviceRef.current.destroy();
        serviceRef.current = null;
      }
    };
  }, [storeName, onSyncComplete, onSyncError, onNetworkChange, onStorageWarning]);

  // Update status periodically
  useEffect(() => {
    if (!serviceRef.current || !isInitialized) return;

    const updateStatus = async () => {
      try {
        const currentStatus = await serviceRef.current!.getStatus();
        setStatus(currentStatus);
      } catch (err) {
        console.error('Failed to update status:', err);
      }
    };

    const intervalId = setInterval(updateStatus, 30000); // Update every 30 seconds

    return () => clearInterval(intervalId);
  }, [isInitialized]);

  // Save data wrapper
  const saveData = useCallback(async (
    id: string,
    data: T,
    options?: DataOptions
  ): Promise<void> => {
    if (!serviceRef.current || !isInitialized) {
      throw new OfflineError(ErrorCode.NOT_INITIALIZED, 'Service not initialized');
    }

    try {
      await serviceRef.current.saveData(id, data, options);
      const updatedStatus = await serviceRef.current.getStatus();
      setStatus(updatedStatus);
    } catch (err) {
      const offlineError = err instanceof OfflineError
        ? err
        : new OfflineError(ErrorCode.INVALID_DATA, 'Failed to save data');
      setError(offlineError);
      throw offlineError;
    }
  }, [isInitialized]);

  // Get data wrapper
  const getData = useCallback(async (id: string): Promise<T | null> => {
    if (!serviceRef.current || !isInitialized) {
      throw new OfflineError(ErrorCode.NOT_INITIALIZED, 'Service not initialized');
    }

    try {
      return await serviceRef.current.getData(id);
    } catch (err) {
      const offlineError = err instanceof OfflineError
        ? err
        : new OfflineError(ErrorCode.STORE_NOT_FOUND, 'Failed to get data');
      setError(offlineError);
      throw offlineError;
    }
  }, [isInitialized]);

  // Get all data wrapper
  const getAll = useCallback(async (): Promise<T[]> => {
    if (!serviceRef.current || !isInitialized) {
      throw new OfflineError(ErrorCode.NOT_INITIALIZED, 'Service not initialized');
    }

    try {
      return await serviceRef.current.getAll();
    } catch (err) {
      const offlineError = err instanceof OfflineError
        ? err
        : new OfflineError(ErrorCode.STORE_NOT_FOUND, 'Failed to get all data');
      setError(offlineError);
      throw offlineError;
    }
  }, [isInitialized]);

  // Force sync wrapper
  const forceSyncNow = useCallback(async (): Promise<void> => {
    if (!serviceRef.current || !isInitialized) {
      throw new OfflineError(ErrorCode.NOT_INITIALIZED, 'Service not initialized');
    }

    try {
      await serviceRef.current.processSyncQueue((progress) => {
        setSyncProgress(progress);
      });
    } catch (err) {
      const offlineError = err instanceof OfflineError
        ? err
        : new OfflineError(ErrorCode.NETWORK_ERROR, 'Failed to force sync');
      setError(offlineError);
      throw offlineError;
    }
  }, [isInitialized]);

  return {
    saveData,
    getData,
    getAll,
    status,
    isInitialized,
    error,
    syncProgress,
    forceSyncNow
  };
}


