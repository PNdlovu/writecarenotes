/**
 * @fileoverview Offline Provider Component
 * @version 1.0.0
 * @created 2024-03-21
 */

'use client';

import React, { useEffect, useState } from 'react';
import { OfflineService } from '../services';
import { NetworkStatus, StorageQuota } from '../types';
import { metrics } from '@/lib/metrics';

interface OfflineContextType {
  isOnline: boolean;
  networkStatus: NetworkStatus;
  storageQuota: StorageQuota | null;
  isPendingSync: boolean;
  lastSyncTime: number | null;
}

export const OfflineContext = React.createContext<OfflineContextType>({
  isOnline: true,
  networkStatus: 'online',
  storageQuota: null,
  isPendingSync: false,
  lastSyncTime: null,
});

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('online');
  const [storageQuota, setStorageQuota] = useState<StorageQuota | null>(null);
  const [isPendingSync, setIsPendingSync] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  useEffect(() => {
    const initializeOffline = async () => {
      try {
        const offlineService = OfflineService.getInstance();
        await offlineService.initialize();

        // Set up network status listeners
        const handleOnline = () => {
          setIsOnline(true);
          setNetworkStatus('online');
          metrics.increment('offline.network.online');
        };

        const handleOffline = () => {
          setIsOnline(false);
          setNetworkStatus('offline');
          metrics.increment('offline.network.offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial network status
        setIsOnline(navigator.onLine);
        setNetworkStatus(navigator.onLine ? 'online' : 'offline');

        // Check storage quota
        if (navigator.storage && navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();
          setStorageQuota({
            usage: estimate.usage || 0,
            quota: estimate.quota || 0,
            percentage: estimate.quota ? (estimate.usage || 0) / estimate.quota * 100 : 0
          });
        }

        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      } catch (error) {
        console.error('Failed to initialize offline provider:', error);
        metrics.increment('offline.initialization.error');
      }
    };

    initializeOffline();
  }, []);

  const value = {
    isOnline,
    networkStatus,
    storageQuota,
    isPendingSync,
    lastSyncTime
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}; 