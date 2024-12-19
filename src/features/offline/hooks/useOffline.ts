// src/features/offline/hooks/useOffline.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getOfflineStorage } from '../utils/storage';

interface StorageUsage {
  used: number;
  total: number;
  percentage: number;
}

interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
  storageUsage: StorageUsage;
  lastSyncTime: number | null;
  syncError: Error | null;
  forceSync: () => Promise<void>;
}

export function useOffline(): OfflineState {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);
  const [storageUsage, setStorageUsage] = useState<StorageUsage>({
    used: 0,
    total: 0,
    percentage: 0,
  });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor storage usage
  useEffect(() => {
    const checkStorageUsage = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const used = estimate.usage || 0;
          const total = estimate.quota || 0;
          setStorageUsage({
            used,
            total,
            percentage: (used / total) * 100,
          });
        } catch (error) {
          console.error('Failed to check storage usage:', error);
        }
      }
    };

    checkStorageUsage();
    const interval = setInterval(checkStorageUsage, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Monitor pending changes
  useEffect(() => {
    const checkPendingChanges = async () => {
      try {
        const storage = await getOfflineStorage();
        const changes = await storage.getPendingChanges();
        setPendingChanges(changes.length);
      } catch (error) {
        console.error('Failed to check pending changes:', error);
      }
    };

    checkPendingChanges();
    const interval = setInterval(checkPendingChanges, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      setIsSyncing(true);
      setSyncError(null);
      try {
        const storage = await getOfflineStorage();
        await storage.sync();
        setLastSyncTime(Date.now());
      } catch (error) {
        setSyncError(error as Error);
        throw error;
      } finally {
        setIsSyncing(false);
      }
    },
  });

  const forceSync = useCallback(async () => {
    if (isOnline && !isSyncing) {
      await syncMutation.mutateAsync();
    }
  }, [isOnline, isSyncing, syncMutation]);

  return {
    isOnline,
    isSyncing,
    pendingChanges,
    storageUsage,
    lastSyncTime,
    syncError,
    forceSync,
  };
}
