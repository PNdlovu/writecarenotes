/**
 * @fileoverview React hook for using the offline module
 * @version 1.0.0
 * @created 2024-03-21
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { OfflineModule } from '../index';
import { 
  NetworkStatus,
  SyncStatus,
  StorageQuota,
  OfflineEvent,
  OfflineEventHandler
} from '../types';
import { OfflineError } from '../types/errors';

export interface UseOfflineOptions {
  onNetworkChange?: (status: NetworkStatus) => void;
  onSyncComplete?: (status: SyncStatus) => void;
  onStorageUpdate?: (quota: StorageQuota) => void;
  onError?: (error: OfflineError) => void;
}

export interface UseOfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncStatus: SyncStatus | null;
  storageQuota: StorageQuota | null;
  serviceWorkerStatus: {
    registered: boolean;
    active: boolean;
    waiting: boolean;
    installing: boolean;
  };
}

export interface UseOfflineActions {
  store: <T>(key: string, data: T, options?: {
    expiresIn?: number;
    priority?: 'high' | 'normal' | 'low';
  }) => Promise<void>;
  retrieve: <T>(key: string) => Promise<T | null>;
  queueSync: <T>(operation: {
    type: 'create' | 'update' | 'delete';
    resourceId: string;
    resourceType: string;
    data: T;
    baseVersion?: number;
  }) => Promise<void>;
  sync: () => Promise<SyncStatus>;
  clearData: () => Promise<void>;
  updateServiceWorker: () => Promise<void>;
}

export function useOffline(options: UseOfflineOptions = {}): {
  state: UseOfflineState;
  actions: UseOfflineActions;
} {
  // Get offline module instance
  const offline = useMemo(() => OfflineModule.getInstance(), []);

  // State
  const [state, setState] = useState<UseOfflineState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncStatus: null,
    storageQuota: null,
    serviceWorkerStatus: offline.getServiceWorkerStatus()
  });

  // Update network status
  const updateNetworkStatus = useCallback(async () => {
    const networkStatus = offline.getNetworkStatus();
    setState(prev => ({
      ...prev,
      isOnline: networkStatus.isOnline
    }));
    options.onNetworkChange?.(networkStatus);
  }, [offline, options.onNetworkChange]);

  // Update storage quota
  const updateStorageQuota = useCallback(async () => {
    const quota = await offline.getStorageQuota();
    setState(prev => ({
      ...prev,
      storageQuota: quota
    }));
    options.onStorageUpdate?.(quota);
  }, [offline, options.onStorageUpdate]);

  // Update service worker status
  const updateServiceWorkerStatus = useCallback(() => {
    const status = offline.getServiceWorkerStatus();
    setState(prev => ({
      ...prev,
      serviceWorkerStatus: status
    }));
  }, [offline]);

  // Event handler
  const handleEvent = useCallback((event: OfflineEvent) => {
    switch (event.type) {
      case 'network':
        updateNetworkStatus();
        break;

      case 'storage':
        updateStorageQuota();
        break;

      case 'sync':
        if (event.details.type === 'update_available') {
          updateServiceWorkerStatus();
        } else {
          setState(prev => ({
            ...prev,
            isSyncing: false,
            lastSyncStatus: event.details as SyncStatus
          }));
          options.onSyncComplete?.(event.details as SyncStatus);
        }
        break;
    }
  }, [
    updateNetworkStatus,
    updateStorageQuota,
    updateServiceWorkerStatus,
    options.onSyncComplete
  ]);

  // Actions
  const actions: UseOfflineActions = useMemo(() => ({
    store: async <T>(
      key: string,
      data: T,
      options?: {
        expiresIn?: number;
        priority?: 'high' | 'normal' | 'low';
      }
    ) => {
      try {
        await offline.store(key, data, options);
        updateStorageQuota();
      } catch (error) {
        options.onError?.(error as OfflineError);
        throw error;
      }
    },

    retrieve: async <T>(key: string) => {
      try {
        return await offline.retrieve<T>(key);
      } catch (error) {
        options.onError?.(error as OfflineError);
        throw error;
      }
    },

    queueSync: async <T>(operation: {
      type: 'create' | 'update' | 'delete';
      resourceId: string;
      resourceType: string;
      data: T;
      baseVersion?: number;
    }) => {
      try {
        await offline.queueSync(operation);
        setState(prev => ({ ...prev, isSyncing: true }));
      } catch (error) {
        options.onError?.(error as OfflineError);
        throw error;
      }
    },

    sync: async () => {
      try {
        setState(prev => ({ ...prev, isSyncing: true }));
        const status = await offline.sync();
        setState(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncStatus: status
        }));
        options.onSyncComplete?.(status);
        return status;
      } catch (error) {
        setState(prev => ({ ...prev, isSyncing: false }));
        options.onError?.(error as OfflineError);
        throw error;
      }
    },

    clearData: async () => {
      try {
        await offline.clearData();
        updateStorageQuota();
      } catch (error) {
        options.onError?.(error as OfflineError);
        throw error;
      }
    },

    updateServiceWorker: async () => {
      try {
        await offline.updateServiceWorker();
        updateServiceWorkerStatus();
      } catch (error) {
        options.onError?.(error as OfflineError);
        throw error;
      }
    }
  }), [
    offline,
    updateStorageQuota,
    updateServiceWorkerStatus,
    options.onError,
    options.onSyncComplete
  ]);

  // Setup event listeners
  useEffect(() => {
    const unsubscribe = offline.subscribe('*', handleEvent);
    return () => unsubscribe();
  }, [offline, handleEvent]);

  // Initial state
  useEffect(() => {
    updateNetworkStatus();
    updateStorageQuota();
    updateServiceWorkerStatus();
  }, [updateNetworkStatus, updateStorageQuota, updateServiceWorkerStatus]);

  return {
    state,
    actions
  };
}
