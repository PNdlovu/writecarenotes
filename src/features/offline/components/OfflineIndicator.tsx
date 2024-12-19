// src/features/offline/components/OfflineIndicator.tsx
'use client';

import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOffline } from '../hooks/useOffline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function OfflineIndicator() {
  const {
    isOnline,
    isSyncing,
    pendingChanges,
    storageUsage,
    lastSyncTime,
    syncError,
    forceSync,
  } = useOffline();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={cn(
          'rounded-lg shadow-lg p-4',
          isOnline ? 'bg-white border border-gray-200' : 'bg-yellow-50 border border-yellow-200'
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                isOnline ? 'bg-green-500' : 'bg-yellow-500'
              )}
            />
            <span className="text-sm font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {pendingChanges > 0 && (
            <div className="text-sm text-gray-500">
              {pendingChanges} pending {pendingChanges === 1 ? 'change' : 'changes'}
            </div>
          )}

          {lastSyncTime && (
            <div className="text-sm text-gray-500">
              Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
            </div>
          )}
        </div>

        {(pendingChanges > 0 || syncError) && (
          <div className="mt-2">
            {syncError && (
              <div className="text-sm text-red-600 mb-2">{syncError.message}</div>
            )}
            <Button
              onClick={forceSync}
              disabled={!isOnline || isSyncing}
              variant={isOnline && !isSyncing ? 'default' : 'outline'}
              size="sm"
              className="w-full"
            >
              <RefreshCw
                className={cn(
                  'mr-2 h-4 w-4',
                  isSyncing && 'animate-spin'
                )}
              />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        )}

        {storageUsage.percentage > 80 && (
          <div className="mt-2">
            <div className="text-sm text-red-600">
              Storage usage: {storageUsage.percentage.toFixed(1)}%
            </div>
            <Progress
              value={storageUsage.percentage}
              className="h-1 mt-1"
              indicatorClassName="bg-red-600"
            />
          </div>
        )}
      </div>
    </div>
  );
}
