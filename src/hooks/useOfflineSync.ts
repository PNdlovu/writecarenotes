'use client';

/**
 * @writecarenotes.com
 * @fileoverview Offline Sync Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom hook for managing offline data synchronization
 */

import { useState, useEffect } from 'react';
import { Post } from '@/features/blog/types';

interface UseOfflineSyncProps {
  key: string;
  initialData?: any;
  syncInterval?: number;
}

interface UseOfflineSyncReturn<T> {
  data: T | null;
  isLoading: boolean;
  isOnline: boolean;
  error: Error | null;
  sync: () => Promise<void>;
  saveLocally: (data: T) => Promise<void>;
}

const isBrowser = typeof window !== 'undefined';

export function useOfflineSync<T>({
  key,
  initialData,
  syncInterval = 5000,
}: UseOfflineSyncProps): UseOfflineSyncReturn<T> {
  const [data, setData] = useState<T | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(isBrowser ? navigator.onLine : true);
  const [error, setError] = useState<Error | null>(null);

  // Handle online/offline status
  useEffect(() => {
    if (!isBrowser) return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data from local storage on mount
  useEffect(() => {
    if (!isBrowser) return;

    const loadLocalData = async () => {
      try {
        const localData = localStorage.getItem(key);
        if (localData) {
          setData(JSON.parse(localData));
        }
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    loadLocalData();
  }, [key]);

  // Sync data when online
  useEffect(() => {
    if (!isBrowser) return;

    let syncTimer: NodeJS.Timeout;

    const syncData = async () => {
      if (isOnline) {
        try {
          // Implement your sync logic here
          // For example:
          // const response = await fetch('/api/sync', { method: 'POST', body: JSON.stringify(data) });
          // const syncedData = await response.json();
          // setData(syncedData);
          // localStorage.setItem(key, JSON.stringify(syncedData));
        } catch (err) {
          setError(err as Error);
        }
      }
    };

    if (isOnline) {
      syncTimer = setInterval(syncData, syncInterval);
    }

    return () => {
      if (syncTimer) {
        clearInterval(syncTimer);
      }
    };
  }, [isOnline, data, key, syncInterval]);

  const sync = async () => {
    if (!isBrowser) return;
    if (!isOnline) {
      throw new Error('Cannot sync while offline');
    }

    try {
      setIsLoading(true);
      // Implement your sync logic here
      // For example:
      // const response = await fetch('/api/sync', { method: 'POST', body: JSON.stringify(data) });
      // const syncedData = await response.json();
      // setData(syncedData);
      // localStorage.setItem(key, JSON.stringify(syncedData));
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLocally = async (newData: T) => {
    if (!isBrowser) return;

    try {
      localStorage.setItem(key, JSON.stringify(newData));
      setData(newData);
    } catch (err) {
      setError(err as Error);
    }
  };

  return {
    data,
    isLoading,
    isOnline,
    error,
    sync,
    saveLocally,
  };
} 