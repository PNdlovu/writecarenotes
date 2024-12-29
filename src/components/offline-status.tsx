/**
 * @fileoverview Component to display offline status and sync progress
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React from 'react';
import { useNetwork } from '@/hooks/use-network';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import { WifiOff, CloudOff, CloudSync, Check } from 'lucide-react';

interface OfflineStatusProps {
  module: string;
}

export function OfflineStatus({ module }: OfflineStatusProps) {
  const { isOnline } = useNetwork();
  const { isSyncing, getPendingActions } = useOfflineSync(module);
  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    const updatePendingCount = async () => {
      const actions = await getPendingActions();
      setPendingCount(actions.length);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => clearInterval(interval);
  }, [getPendingActions]);

  if (isOnline && !pendingCount) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-white p-3 shadow-lg dark:bg-gray-800">
      {!isOnline ? (
        <>
          <WifiOff className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium">Offline Mode</span>
        </>
      ) : isSyncing ? (
        <>
          <CloudSync className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-sm font-medium">Syncing...</span>
          <span className="ml-1 text-xs text-gray-500">{pendingCount} items</span>
        </>
      ) : pendingCount > 0 ? (
        <>
          <CloudOff className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium">Pending Sync</span>
          <span className="ml-1 text-xs text-gray-500">{pendingCount} items</span>
        </>
      ) : (
        <>
          <Check className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium">All Synced</span>
        </>
      )}
    </div>
  );
} 