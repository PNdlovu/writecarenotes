/**
 * @fileoverview Accounting Offline Operations Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * React hook for managing offline accounting operations with sync capabilities
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { accountingSync } from '../../utils/offline/sync/accountingSync';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/auth';
import { useNetworkStatus } from '@/hooks/network';

interface OfflineState {
  pendingEntries: number;
  syncInProgress: boolean;
  lastSyncAttempt: Date | null;
}

interface UseAccountingOfflineOptions {
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
}

export function useAccountingOffline(options: UseAccountingOfflineOptions = {}) {
  const {
    autoSync = true,
    syncInterval = 5 * 60 * 1000, // 5 minutes
    onSyncComplete,
    onSyncError
  } = options;

  const { t } = useTranslation('accounting');
  const { showToast } = useToast();
  const { isOnline } = useNetworkStatus();
  const { organization } = useAuth();

  const [offlineState, setOfflineState] = useState<OfflineState>({
    pendingEntries: 0,
    syncInProgress: false,
    lastSyncAttempt: null
  });

  /**
   * Create a journal entry with offline support
   */
  const createJournalEntry = useCallback(async (entry: any) => {
    try {
      // Add organization context
      const entryWithContext = {
        ...entry,
        organizationId: organization.id,
        metadata: {
          ...entry.metadata,
          offlineCreated: !isOnline,
          createdAt: new Date().toISOString()
        }
      };

      if (isOnline) {
        // Try online first
        try {
          const response = await fetch('/api/accounting/ledger/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryWithContext)
          });

          if (response.ok) {
            return await response.json();
          }
        } catch (error) {
          console.warn('Failed to create entry online, falling back to offline:', error);
        }
      }

      // Queue for offline sync
      const id = await accountingSync.queueJournalEntry(entryWithContext);
      
      showToast({
        title: t('offlineEntry.queued'),
        description: t('offlineEntry.willSyncWhenOnline'),
        variant: 'info'
      });

      // Update pending count
      updatePendingCount();

      return { id, status: 'pending' };
    } catch (error) {
      console.error('Failed to create journal entry:', error);
      showToast({
        title: t('offlineEntry.error'),
        description: t('offlineEntry.createFailed'),
        variant: 'error'
      });
      throw error;
    }
  }, [isOnline, organization.id, showToast, t]);

  /**
   * Update the count of pending entries
   */
  const updatePendingCount = useCallback(async () => {
    try {
      const entries = await accountingSync.getOfflineEntries();
      const pending = entries.filter(e => e.status === 'pending').length;
      
      setOfflineState(state => ({
        ...state,
        pendingEntries: pending
      }));
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  }, []);

  /**
   * Manually trigger sync
   */
  const syncNow = useCallback(async () => {
    if (!isOnline || offlineState.syncInProgress) return;

    setOfflineState(state => ({
      ...state,
      syncInProgress: true,
      lastSyncAttempt: new Date()
    }));

    try {
      await accountingSync.syncPendingEntries();
      await updatePendingCount();
      
      showToast({
        title: t('sync.complete'),
        description: t('sync.entriesSynced'),
        variant: 'success'
      });

      onSyncComplete?.();
    } catch (error) {
      console.error('Sync failed:', error);
      
      showToast({
        title: t('sync.error'),
        description: t('sync.failed'),
        variant: 'error'
      });

      onSyncError?.(error as Error);
    } finally {
      setOfflineState(state => ({
        ...state,
        syncInProgress: false
      }));
    }
  }, [isOnline, offlineState.syncInProgress, showToast, t, onSyncComplete, onSyncError]);

  // Set up auto-sync
  useEffect(() => {
    if (!autoSync) return;

    const interval = setInterval(() => {
      if (isOnline && !offlineState.syncInProgress) {
        syncNow();
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, isOnline, offlineState.syncInProgress, syncInterval, syncNow]);

  // Initial setup
  useEffect(() => {
    const cleanup = accountingSync.initListeners();
    updatePendingCount();
    return cleanup;
  }, [updatePendingCount]);

  // Online status change handler
  useEffect(() => {
    if (isOnline && offlineState.pendingEntries > 0) {
      syncNow();
    }
  }, [isOnline, offlineState.pendingEntries, syncNow]);

  return {
    createJournalEntry,
    syncNow,
    offlineState,
    isOnline
  };
} 