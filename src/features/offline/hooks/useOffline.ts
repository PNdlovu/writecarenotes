/**
 * @writecarenotes.com
 * @fileoverview Enterprise-grade offline state management hook
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom hook for managing offline state and synchronization.
 * Features include:
 * - Network status monitoring
 * - Offline queue management
 * - Priority-based sync processing
 * - Periodic sync attempts
 * - Offline data persistence
 */

import { useContext, useCallback, useRef } from 'react';
import { OfflineContext } from '../providers/OfflineProvider';
import { OfflineService } from '../services';
import { metrics } from '@/lib/metrics';
import { useToast } from '@/components/ui/UseToast';
import { OfflineQueue } from '../sync/queue';
import { useTranslation } from '@/i18n';

export interface UseOfflineOptions {
  syncInterval?: number;
  maxRetries?: number;
  maxQueueSize?: number;
}

export function useOffline(options: UseOfflineOptions = {}) {
  const context = useContext(OfflineContext);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queueRef = useRef<OfflineQueue>();
  
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }

  const syncNow = useCallback(async () => {
    if (!context.isOnline) {
      toast({
        title: t('offline.syncUnavailable'),
        description: t('offline.syncWhenOnline'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const offlineService = OfflineService.getInstance();
      
      // Process queue first
      if (queueRef.current) {
        const queueStats = queueRef.current.getStats();
        if (queueStats.pending > 0) {
          await queueRef.current.processQueue(async (action) => {
            // Handle different action types
            switch (action.type) {
              case 'api_request':
                await fetch(action.payload as RequestInfo);
                break;
              case 'data_update':
                // Handle data updates
                break;
              default:
                throw new Error(`Unknown action type: ${action.type}`);
            }
          });
        }
      }

      // Perform regular sync
      await offlineService.sync();
      metrics.increment('offline.sync.success');
      
      toast({
        title: t('offline.syncComplete'),
        description: t('offline.syncSuccess'),
      });
    } catch (error) {
      metrics.increment('offline.sync.error');
      
      toast({
        title: t('offline.syncFailed'),
        description: t('offline.syncRetry'),
        variant: 'destructive',
      });
    }
  }, [context.isOnline, toast, t]);

  const queueAction = useCallback((
    type: string,
    payload: unknown,
    priority = 0
  ) => {
    if (!queueRef.current) {
      queueRef.current = new OfflineQueue({
        maxRetries: options.maxRetries,
        maxQueueSize: options.maxQueueSize,
        storageKey: 'offline_queue',
      });
    }

    queueRef.current.enqueue({
      type,
      payload,
      priority,
    });

    metrics.increment('offline.action.queued');
  }, [options.maxRetries, options.maxQueueSize]);

  const checkStorageQuota = useCallback(async () => {
    try {
      const quota = await navigator.storage?.estimate();
      return {
        usage: quota?.usage || 0,
        quota: quota?.quota || 0,
        percentage: quota ? (quota.usage || 0) / (quota.quota || 1) * 100 : 0,
      };
    } catch (error) {
      console.error('Failed to check storage quota:', error);
      return null;
    }
  }, []);

  return {
    ...context,
    syncNow,
    queueAction,
    checkStorageQuota,
    statusText: context.isSyncing
      ? t('offline.syncing')
      : context.lastSyncTime
      ? t('offline.lastSync', { time: new Date(context.lastSyncTime).toLocaleTimeString() })
      : context.isOnline
      ? ''
      : t('offline.status'),
  };
}
