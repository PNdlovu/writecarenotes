import { useState, useEffect } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useToast } from '@/hooks/useToast';
import { CareHomeCache } from '@/lib/cache/implementations/CareHomeCache';
import { OfflineSync } from '@/lib/offline/OfflineSync';

export function useOfflineSync(careHomeId: string) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const { isOnline } = useNetworkStatus();
  const { toast } = useToast();
  
  const cache = new CareHomeCache();
  const offlineSync = new OfflineSync();

  useEffect(() => {
    const init = async () => {
      await cache.initialize();
      const changes = await cache.getPendingChanges(careHomeId);
      setPendingChanges(changes);
    };
    init();
  }, [careHomeId]);

  useEffect(() => {
    if (isOnline && pendingChanges.length > 0 && !isSyncing) {
      syncChanges();
    }
  }, [isOnline, pendingChanges]);

  const syncChanges = async () => {
    try {
      setIsSyncing(true);
      await offlineSync.forceSyncNow();
      const changes = await cache.getPendingChanges(careHomeId);
      setPendingChanges(changes);
      setLastSyncTime(new Date());
      toast({
        title: 'Sync Complete',
        description: 'All changes have been synchronized',
        type: 'success'
      });
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to synchronize changes. Will retry automatically.',
        type: 'error'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const addOfflineChange = async (change: any) => {
    const currentChanges = await cache.getPendingChanges(careHomeId);
    await cache.storePendingChanges(careHomeId, [...currentChanges, change]);
    setPendingChanges(prev => [...prev, change]);
  };

  return {
    isSyncing,
    lastSyncTime,
    pendingChanges,
    isOnline,
    syncChanges,
    addOfflineChange
  };
}


