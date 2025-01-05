/**
 * @writecarenotes.com
 * @fileoverview Sync Status Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom hook for monitoring online/offline status and sync progress.
 * Provides real-time status updates and handles background sync operations.
 */

import { useState, useEffect, useCallback } from 'react';
import { useOfflineStorage } from './useOfflineStorage';
import { TenantContext } from '@/lib/multi-tenant/types';

interface SyncProgress {
  total: number;
  completed: number;
  status: 'idle' | 'syncing' | 'error' | 'complete';
  error?: string;
}

interface UseSyncStatusProps {
  tenantContext: TenantContext;
}

export function useSyncStatus({ tenantContext }: UseSyncStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncProgress>({
    total: 0,
    completed: 0,
    status: 'idle'
  });

  const { getUnsyncedRecords, markAsSynced } = useOfflineStorage({ tenantContext });

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

  // Sync unsynced records when online
  const syncRecords = useCallback(async () => {
    if (!isOnline) return;

    try {
      const records = await getUnsyncedRecords();
      if (records.length === 0) {
        setSyncStatus({ total: 0, completed: 0, status: 'idle' });
        return;
      }

      setSyncStatus({
        total: records.length,
        completed: 0,
        status: 'syncing'
      });

      for (const record of records) {
        try {
          // Attempt to sync the record
          const response = await fetch('/api/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Tenant-ID': tenantContext.tenantId
            },
            body: JSON.stringify({
              type: 'MEDICATION_ADMINISTRATION',
              data: record.data,
              timestamp: record.timestamp,
              version: record.version
            })
          });

          if (!response.ok) {
            throw new Error(`Sync failed: ${response.statusText}`);
          }

          // Mark as synced if successful
          await markAsSynced(record.id);

          setSyncStatus(prev => ({
            ...prev,
            completed: prev.completed + 1
          }));
        } catch (error) {
          console.error(`Failed to sync record ${record.id}:`, error);
          // Continue with other records even if one fails
        }
      }

      setSyncStatus(prev => ({
        ...prev,
        status: 'complete'
      }));
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [isOnline, getUnsyncedRecords, markAsSynced, tenantContext.tenantId]);

  // Attempt sync when coming online
  useEffect(() => {
    if (isOnline) {
      syncRecords();
    }
  }, [isOnline, syncRecords]);

  // Register background sync if supported
  useEffect(() => {
    const registerBackgroundSync = async () => {
      if ('serviceWorker' in navigator && 'sync' in window.registration) {
        try {
          await window.registration.sync.register('medication-sync');
        } catch (error) {
          console.error('Background sync registration failed:', error);
        }
      }
    };

    registerBackgroundSync();
  }, []);

  return {
    isOnline,
    syncStatus,
    syncRecords
  };
} 