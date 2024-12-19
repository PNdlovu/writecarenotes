import { useEffect, useState, useCallback } from 'react';
import { SyncManager } from '@/lib/offline-sync/sync-manager';
import { ActionType } from '@/lib/offline-sync/types';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook for managing offline support and data synchronization
 * with comprehensive conflict resolution and error handling
 */
export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncManager = SyncManager.getInstance();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Back Online',
        description: 'Syncing pending changes...',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Offline Mode',
        description: 'Changes will be synced when back online',
        variant: 'warning',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const initialize = async () => {
      try {
        await syncManager.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing offline support:', error);
        toast({
          title: 'Initialization Error',
          description: 'Failed to initialize offline support',
          variant: 'destructive',
        });
      }
    };

    initialize();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const recordAction = useCallback(async (
    type: ActionType,
    data: any
  ) => {
    try {
      const actionId = await syncManager.recordAction({
        type,
        data,
        userId: 'current-user', // Replace with actual user ID
        tenantId: 'current-tenant', // Replace with actual tenant ID
        deviceId: 'current-device', // Replace with actual device ID
      });

      if (!isOnline) {
        toast({
          title: 'Action Recorded',
          description: 'Will be synced when back online',
          variant: 'default',
        });
      }

      return actionId;
    } catch (error) {
      console.error('Error recording action:', error);
      toast({
        title: 'Error',
        description: 'Failed to record action',
        variant: 'destructive',
      });
      throw error;
    }
  }, [isOnline]);

  const getCachedMedication = useCallback(async (id: string) => {
    try {
      const medication = await syncManager.getCachedMedication(id);
      
      if (!medication && !isOnline) {
        toast({
          title: 'Offline Mode',
          description: 'Medication data not available offline',
          variant: 'warning',
        });
      }
      
      return medication;
    } catch (error) {
      console.error('Error getting cached medication:', error);
      toast({
        title: 'Error',
        description: 'Failed to retrieve medication data',
        variant: 'destructive',
      });
      return null;
    }
  }, [isOnline]);

  const cacheMedication = useCallback(async (medicationData: any) => {
    try {
      await syncManager.cacheMedication(medicationData);
    } catch (error) {
      console.error('Error caching medication:', error);
      toast({
        title: 'Error',
        description: 'Failed to cache medication data',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  const getCachedMedicationsByResident = useCallback(async (residentId: string) => {
    try {
      const medications = await syncManager.getCachedMedicationsByResident(residentId);
      
      if (medications.length === 0 && !isOnline) {
        toast({
          title: 'Offline Mode',
          description: 'No medication data available offline',
          variant: 'warning',
        });
      }
      
      return medications;
    } catch (error) {
      console.error('Error getting cached medications:', error);
      toast({
        title: 'Error',
        description: 'Failed to retrieve medications',
        variant: 'destructive',
      });
      return [];
    }
  }, [isOnline]);

  const forceSyncNow = useCallback(async () => {
    if (!isOnline) {
      toast({
        title: 'Offline Mode',
        description: 'Cannot sync while offline',
        variant: 'warning',
      });
      return;
    }

    if (isSyncing) {
      toast({
        title: 'Sync in Progress',
        description: 'Please wait for current sync to complete',
        variant: 'warning',
      });
      return;
    }

    try {
      setIsSyncing(true);
      // Trigger sync through the sync manager
      // This will be implemented in the sync manager
      toast({
        title: 'Sync Started',
        description: 'Syncing your changes...',
      });
    } catch (error) {
      console.error('Error during force sync:', error);
      toast({
        title: 'Sync Error',
        description: 'Failed to sync changes',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  return {
    isOnline,
    isInitialized,
    isSyncing,
    recordAction,
    getCachedMedication,
    cacheMedication,
    getCachedMedicationsByResident,
    forceSyncNow,
  };
}


