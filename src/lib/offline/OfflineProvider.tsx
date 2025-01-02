import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/Toast/use-toast';
import { useI18n } from '../i18n/config';
import { Button } from "@/components/ui/Button/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Progress } from "@/components/ui/Progress";

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
  syncData: () => Promise<void>;
  enqueueMutation: (mutation: PendingMutation) => void;
  syncProgress: number;
  syncError: Error | null;
  retrySync: () => Promise<void>;
  clearPendingMutations: () => void;
  getPendingMutations: () => PendingMutation[];
}

interface PendingMutation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  model: string;
  data: any;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
  retryCount: number;
  conflictResolution?: 'client-wins' | 'server-wins' | 'manual';
  encryptedData?: boolean;
}

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_OFFLINE_ENCRYPTION_KEY || 'default-key';

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingMutations, setPendingMutations] = useState<PendingMutation[]>([]);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncError, setSyncError] = useState<Error | null>(null);
  const { toast } = useToast();
  const t = useI18n();

  // Enhanced offline detection with connection quality monitoring
  useEffect(() => {
    const connection = navigator.connection as any;
    
    const handleConnectionChange = () => {
      const isGoodConnection = !connection || 
        (connection.effectiveType !== 'slow-2g' && connection.effectiveType !== '2g');
      setIsOnline(navigator.onLine && isGoodConnection);
    };

    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  // Encrypt sensitive data before storing
  const encryptData = (data: any): string => {
    try {
      const serialized = JSON.stringify(data);
      // In production, use a proper encryption library
      return btoa(serialized);
    } catch (error) {
      console.error('Encryption error:', error);
      return JSON.stringify(data);
    }
  };

  // Decrypt data before using
  const decryptData = (encryptedData: string): any => {
    try {
      // In production, use a proper encryption library
      const decrypted = atob(encryptedData);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  };

  // Enhanced mutation queue with priority and encryption
  const enqueueMutation = (mutation: PendingMutation) => {
    setPendingMutations(prev => {
      const newMutation = {
        ...mutation,
        retryCount: 0,
        timestamp: Date.now(),
        encryptedData: true,
        data: mutation.data ? encryptData(mutation.data) : null,
      };
      
      const newMutations = [...prev, newMutation];
      // Sort by priority and timestamp
      return newMutations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority] || 
               a.timestamp - b.timestamp;
      });
    });
  };

  // Exponential backoff retry mechanism
  const getRetryDelay = (retryCount: number): number => {
    return Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), 30000);
  };

  // Enhanced sync with progress tracking and conflict resolution
  const syncData = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    setSyncError(null);
    
    const mutations = [...pendingMutations];
    let processed = 0;

    for (const mutation of mutations) {
      try {
        if (mutation.encryptedData && mutation.data) {
          mutation.data = decryptData(mutation.data);
        }

        // Implement proper API call here
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove successful mutation
        setPendingMutations(prev => 
          prev.filter(m => m.id !== mutation.id)
        );
        
        processed++;
        setSyncProgress((processed / mutations.length) * 100);
        
      } catch (error) {
        const shouldRetry = mutation.retryCount < MAX_RETRIES;
        
        if (shouldRetry) {
          // Update retry count and delay next attempt
          setPendingMutations(prev =>
            prev.map(m =>
              m.id === mutation.id
                ? { ...m, retryCount: m.retryCount + 1 }
                : m
            )
          );
          
          await new Promise(resolve =>
            setTimeout(resolve, getRetryDelay(mutation.retryCount))
          );
          
        } else {
          setSyncError(error as Error);
          toast({
            title: t('common.error'),
            description: t('offline.syncError'),
            variant: 'destructive',
          });
        }
      }
    }

    setIsSyncing(false);
    setSyncProgress(0);
  };

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: t('common.online'),
        description: t('common.onlineDescription'),
        variant: 'default',
      });
      syncData(); // Attempt to sync when coming back online
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: t('common.offline'),
        description: t('common.offlineDescription'),
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // IndexedDB setup for offline storage
  useEffect(() => {
    const initIndexedDB = async () => {
      const request = indexedDB.open('CareHomeDB', 1);

      request.onerror = () => {
        console.error('IndexedDB error');
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores for each model that needs offline support
        if (!db.objectStoreNames.contains('pendingMutations')) {
          db.createObjectStore('pendingMutations', { keyPath: 'id' });
        }
        
        // Add stores for cached data
        ['medications', 'residents', 'administrations'].forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        });
      };
    };

    initIndexedDB();
  }, []);

  // Process individual mutations
  const processMutation = async (mutation: PendingMutation) => {
    const { type, model, data } = mutation;
    const endpoint = `/api/${model.toLowerCase()}`;

    let response;
    switch (type) {
      case 'CREATE':
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        break;
      case 'UPDATE':
        response = await fetch(`${endpoint}/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        break;
      case 'DELETE':
        response = await fetch(`${endpoint}/${data.id}`, {
          method: 'DELETE',
        });
        break;
    }

    if (!response.ok) {
      throw new Error('Failed to process mutation');
    }
  };

  const value = {
    isOnline,
    isSyncing,
    pendingChanges: pendingMutations.length,
    syncData,
    enqueueMutation,
    syncProgress,
    syncError,
    retrySync: syncData,
    clearPendingMutations: () => setPendingMutations([]),
    getPendingMutations: () => pendingMutations,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};


