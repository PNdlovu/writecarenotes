import React from 'react';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon';

interface OfflineStatusBarProps {
  careHomeId: string;
}

export function OfflineStatusBar({ careHomeId }: OfflineStatusBarProps) {
  const {
    isSyncing,
    lastSyncTime,
    pendingChanges,
    isOnline,
    syncChanges
  } = useOfflineSync(careHomeId);

  if (isOnline && !pendingChanges.length) {
    return null;
  }

  return (
    <Alert
      variant={isOnline ? 'warning' : 'error'}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-2">
          <Icon
            name={isOnline ? 'cloud-sync' : 'cloud-off'}
            className={isOnline ? 'text-yellow-500' : 'text-red-500'}
          />
          <div>
            {!isOnline && (
              <p className="font-medium">You're currently offline</p>
            )}
            {isOnline && pendingChanges.length > 0 && (
              <p className="font-medium">
                {pendingChanges.length} changes pending synchronization
              </p>
            )}
            <p className="text-sm text-gray-500">
              {lastSyncTime
                ? `Last synced: ${new Date(lastSyncTime).toLocaleString()}`
                : 'Not synced yet'}
            </p>
          </div>
        </div>
        
        {isOnline && pendingChanges.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={syncChanges}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <Icon name="spinner" className="animate-spin mr-2" />
                Syncing...
              </>
            ) : (
              'Sync Now'
            )}
          </Button>
        )}
      </div>
    </Alert>
  );
}


