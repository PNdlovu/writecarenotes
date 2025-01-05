/**
 * @writecarenotes.com
 * @fileoverview React hook for offline functionality
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * React hook providing offline capabilities to components.
 * Manages online/offline state, sync operations, and offline data access.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { OfflineService } from '../offlineService';
import { SyncStrategy, OfflineError, ErrorCode } from '../types';
import { logger } from '@/lib/logger';
import { useToast } from '@/components/ui/Toast/use-toast';
import { useAuth } from '@/lib/auth';
import { useRegionalSettings } from '@/lib/regional-settings';

interface UseOfflineOptions<T> {
  storeName: string;
  syncStrategy?: SyncStrategy;
  encryption?: boolean;
  compression?: boolean;
  onSyncComplete?: () => void;
  onSyncError?: (error: OfflineError) => void;
  onConflict?: (localData: T, serverData: T) => Promise<T>;
}

export function useOffline<T extends { id: string }>(options: UseOfflineOptions<T>) {
  const {
    storeName,
    syncStrategy = SyncStrategy.LAST_WRITE_WINS,
    encryption = true,
    compression = true,
    onSyncComplete,
    onSyncError,
    onConflict
  } = options;

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingActions, setPendingActions] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<OfflineError | null>(null);

  const offlineServiceRef = useRef<OfflineService<T> | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { region } = useRegionalSettings();

  // Initialize offline service
  useEffect(() => {
    const initOfflineService = async () => {
      try {
        offlineServiceRef.current = new OfflineService<T>(storeName, {
          encryption,
          compression,
          syncStrategy
        });
        await offlineServiceRef.current.init();
      } catch (error) {
        const offlineError = error instanceof OfflineError 
          ? error 
          : new OfflineError(ErrorCode.INITIALIZATION_FAILED);
        setError(offlineError);
        logger.error('Failed to initialize offline service', { error, storeName });
        toast({
          title: 'Offline Service Error',
          description: 'Failed to initialize offline service',
          variant: 'destructive'
        });
      }
    };

    initOfflineService();

    return () => {
      if (offlineServiceRef.current) {
        offlineServiceRef.current.destroy();
      }
    };
  }, [storeName, encryption, compression, syncStrategy]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (offlineServiceRef.current) {
        syncData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsSyncing(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync data with server
  const syncData = useCallback(async () => {
    if (!offlineServiceRef.current || !isOnline || isSyncing) return;

    try {
      setIsSyncing(true);
      await offlineServiceRef.current.processSyncQueue();
      const count = await offlineServiceRef.current.getPendingSyncCount();
      setPendingActions(count);
      setLastSyncTime(new Date());
      onSyncComplete?.();

      toast({
        title: 'Sync Complete',
        description: 'Your data is now up to date',
        variant: 'default'
      });

    } catch (error) {
      const offlineError = error instanceof OfflineError 
        ? error 
        : new OfflineError(ErrorCode.SYNC_FAILED);
      setError(offlineError);
      onSyncError?.(offlineError);
      logger.error('Failed to sync data', { error, storeName });

      toast({
        title: 'Sync Failed',
        description: 'Failed to sync data with server',
        variant: 'destructive'
      });

    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, storeName, onSyncComplete, onSyncError]);

  // Save data
  const saveData = useCallback(async (id: string, data: T): Promise<void> => {
    if (!offlineServiceRef.current) {
      throw new OfflineError(ErrorCode.NOT_INITIALIZED);
    }

    try {
      await offlineServiceRef.current.saveData(id, data);
      const count = await offlineServiceRef.current.getPendingSyncCount();
      setPendingActions(count);

      if (isOnline) {
        syncData();
      }

    } catch (error) {
      const offlineError = error instanceof OfflineError 
        ? error 
        : new OfflineError(ErrorCode.SAVE_FAILED);
      setError(offlineError);
      throw offlineError;
    }
  }, [isOnline, syncData]);

  // Get data
  const getData = useCallback(async (id: string): Promise<T | null> => {
    if (!offlineServiceRef.current) {
      throw new OfflineError(ErrorCode.NOT_INITIALIZED);
    }

    try {
      return await offlineServiceRef.current.getData(id);
    } catch (error) {
      const offlineError = error instanceof OfflineError 
        ? error 
        : new OfflineError(ErrorCode.FETCH_FAILED);
      setError(offlineError);
      throw offlineError;
    }
  }, []);

  // Get all data
  const getAllData = useCallback(async (): Promise<T[]> => {
    if (!offlineServiceRef.current) {
      throw new OfflineError(ErrorCode.NOT_INITIALIZED);
    }

    try {
      return await offlineServiceRef.current.getAll();
    } catch (error) {
      const offlineError = error instanceof OfflineError 
        ? error 
        : new OfflineError(ErrorCode.FETCH_FAILED);
      setError(offlineError);
      throw offlineError;
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    pendingActions,
    lastSyncTime,
    error,
    syncData,
    saveData,
    getData,
    getAllData
  };
} 