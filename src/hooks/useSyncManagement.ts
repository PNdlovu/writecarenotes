import { useState, useEffect, useCallback } from 'react';
import { syncService } from '@/services/syncService';
import { useToast } from '@/hooks/useToast';

interface SyncManagementReturn {
  stats: {
    pending: number;
    failed: number;
    completed: number;
    lastSync: Date | null;
  };
  isOnline: boolean;
  isSyncing: boolean;
  syncProgress: number;
  startSync: () => Promise<void>;
  pauseSync: () => void;
  resumeSync: () => void;
  retryFailedItems: () => Promise<void>;
  clearQueue: () => Promise<void>;
  resolveConflict: (
    itemId: string,
    resolution: 'local' | 'remote' | 'merge',
    mergedData?: any
  ) => Promise<void>;
}

export function useSyncManagement(): SyncManagementReturn {
  const [stats, setStats] = useState({
    pending: 0,
    failed: 0,
    completed: 0,
    lastSync: null as Date | null,
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const { showToast } = useToast();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast({
        title: 'Online',
        description: 'Connection restored. Starting sync...',
        type: 'success',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast({
        title: 'Offline',
        description: 'Connection lost. Changes will be synced when online.',
        type: 'warning',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Monitor sync stats
  useEffect(() => {
    const updateStats = async () => {
      const currentStats = await syncService.getSyncStats();
      setStats(currentStats);

      // Calculate progress
      const total = currentStats.pending + currentStats.completed + currentStats.failed;
      if (total > 0) {
        setSyncProgress((currentStats.completed / total) * 100);
      }
    };

    // Update stats every 5 seconds while syncing
    const interval = setInterval(() => {
      if (isSyncing) {
        updateStats();
      }
    }, 5000);

    // Initial stats update
    updateStats();

    return () => clearInterval(interval);
  }, [isSyncing]);

  const startSync = useCallback(async () => {
    if (!isOnline) {
      showToast({
        title: 'Offline',
        description: 'Cannot sync while offline',
        type: 'error',
      });
      return;
    }

    try {
      setIsSyncing(true);
      await syncService.startSync();
      
      const updatedStats = await syncService.getSyncStats();
      setStats(updatedStats);

      showToast({
        title: 'Sync Complete',
        description: `Successfully synced ${updatedStats.completed} items`,
        type: 'success',
      });
    } catch (error: any) {
      showToast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync changes',
        type: 'error',
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  }, [isOnline, showToast]);

  const pauseSync = useCallback(() => {
    syncService.stopBackgroundSync();
    setIsSyncing(false);
    showToast({
      title: 'Sync Paused',
      description: 'Background synchronization has been paused',
      type: 'info',
    });
  }, [showToast]);

  const resumeSync = useCallback(() => {
    syncService.startBackgroundSync();
    showToast({
      title: 'Sync Resumed',
      description: 'Background synchronization has been resumed',
      type: 'info',
    });
  }, [showToast]);

  const retryFailedItems = useCallback(async () => {
    try {
      await syncService.retryFailedItems();
      showToast({
        title: 'Retry Initiated',
        description: 'Failed items have been queued for retry',
        type: 'info',
      });
      startSync();
    } catch (error: any) {
      showToast({
        title: 'Retry Failed',
        description: error.message || 'Failed to retry items',
        type: 'error',
      });
    }
  }, [showToast, startSync]);

  const clearQueue = useCallback(async () => {
    try {
      await syncService.clearQueue();
      setStats({
        pending: 0,
        failed: 0,
        completed: 0,
        lastSync: new Date(),
      });
      showToast({
        title: 'Queue Cleared',
        description: 'Sync queue has been cleared',
        type: 'success',
      });
    } catch (error: any) {
      showToast({
        title: 'Clear Failed',
        description: error.message || 'Failed to clear queue',
        type: 'error',
      });
    }
  }, [showToast]);

  const resolveConflict = useCallback(
    async (
      itemId: string,
      resolution: 'local' | 'remote' | 'merge',
      mergedData?: any
    ) => {
      try {
        await syncService.resolveConflict(itemId, resolution, mergedData);
        showToast({
          title: 'Conflict Resolved',
          description: 'Changes will be synced',
          type: 'success',
        });
        startSync();
      } catch (error: any) {
        showToast({
          title: 'Resolution Failed',
          description: error.message || 'Failed to resolve conflict',
          type: 'error',
        });
      }
    },
    [showToast, startSync]
  );

  return {
    stats,
    isOnline,
    isSyncing,
    syncProgress,
    startSync,
    pauseSync,
    resumeSync,
    retryFailedItems,
    clearQueue,
    resolveConflict,
  };
}


