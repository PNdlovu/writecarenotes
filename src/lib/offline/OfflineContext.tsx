import React, { createContext, useContext, useEffect, useState } from 'react';
import { DatabaseManager } from '../utils/db';
import { syncManager } from '../utils/sync';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
  storageUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  lastSyncTime: Date | null;
  syncError: Error | null;
  forceSync: () => Promise<void>;
  clearStorage: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    total: 0,
    percentage: 0,
  });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);

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

  useEffect(() => {
    const handleSyncComplete = (event: CustomEvent) => {
      setIsSyncing(false);
      setLastSyncTime(new Date(event.detail.timestamp));
      setSyncError(null);
      updatePendingChanges();
    };

    const handleSyncError = (event: CustomEvent) => {
      setIsSyncing(false);
      setSyncError(event.detail.error);
    };

    window.addEventListener('syncComplete', handleSyncComplete as EventListener);
    window.addEventListener('syncError', handleSyncError as EventListener);

    return () => {
      window.removeEventListener('syncComplete', handleSyncComplete as EventListener);
      window.removeEventListener('syncError', handleSyncError as EventListener);
    };
  }, []);

  useEffect(() => {
    const updateStorageUsage = async () => {
      const usage = await syncManager.getStorageUsage();
      setStorageUsage({
        used: usage.usage,
        total: usage.quota,
        percentage: usage.percentUsed,
      });
    };

    updateStorageUsage();
    const interval = setInterval(updateStorageUsage, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const updatePendingChanges = async () => {
    const db = DatabaseManager.getInstance();
    const changes = await db.getChanges();
    setPendingChanges(changes.length);
  };

  useEffect(() => {
    updatePendingChanges();
  }, []);

  const forceSync = async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      await syncManager.syncChanges();
    } catch (error) {
      setSyncError(error as Error);
      setIsSyncing(false);
    }
  };

  const clearStorage = async () => {
    try {
      await syncManager.clearStorage();
      await updatePendingChanges();
      const usage = await syncManager.getStorageUsage();
      setStorageUsage({
        used: usage.usage,
        total: usage.quota,
        percentage: usage.percentUsed,
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingChanges,
        storageUsage,
        lastSyncTime,
        syncError,
        forceSync,
        clearStorage,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
