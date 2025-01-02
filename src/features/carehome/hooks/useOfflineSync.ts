/**
 * @writecarenotes.com
 * @fileoverview Care Home offline sync hook
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useOffline } from '@/features/offline/hooks/useOffline';
import type { CareHomeChange } from '../types';

export function useOfflineSync(careHomeId: string) {
  const [pendingChanges, setPendingChanges] = useState<CareHomeChange[]>([]);
  const { toast } = useToast();
  const { 
    isOnline, 
    isSyncing, 
    queueAction, 
    syncNow,
    lastSyncTime 
  } = useOffline({
    syncInterval: 5000, // Sync every 5 seconds when online
    maxRetries: 3,
  });

  useEffect(() => {
    // Attempt sync when we come online and have pending changes
    if (isOnline && pendingChanges.length > 0 && !isSyncing) {
      syncNow();
    }
  }, [isOnline, pendingChanges, isSyncing, syncNow]);

  const addOfflineChange = async (change: CareHomeChange) => {
    setPendingChanges(prev => [...prev, change]);
    
    // Queue the change with high priority since it's user data
    queueAction('care_home_update', {
      careHomeId,
      change,
      timestamp: new Date().toISOString(),
    }, 2);

    toast({
      title: 'Change Saved Offline',
      description: isOnline 
        ? 'Change will be synced shortly'
        : 'Change will be synced when you are back online',
    });
  };

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingChanges,
    addOfflineChange,
    syncNow,
  };
}
