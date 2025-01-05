/**
 * @writecarenotes.com
 * @fileoverview Offline sync status component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying offline sync status and managing sync operations.
 * Provides UI for monitoring sync progress, managing offline data, and
 * resolving conflicts.
 */

import React from 'react';
import { useOfflineSync } from '@/lib/offline/hooks/useOfflineSync';
import { formatBytes } from '@/lib/offline/utils';
import { SyncStrategy } from '@/lib/offline/types';

export const OfflineSync: React.FC = () => {
  const {
    status,
    error,
    syncProgress,
    forceSyncNow,
    isInitialized
  } = useOfflineSync({
    storeName: 'schedule',
    onSyncComplete: (event) => {
      console.log('Sync completed:', event);
    },
    onSyncError: (error) => {
      console.error('Sync failed:', error);
    },
    onNetworkChange: (isOnline) => {
      console.log('Network status:', isOnline);
    },
    onStorageWarning: (usage, quota) => {
      console.warn('Storage warning:', { usage, quota });
    }
  });

  if (!isInitialized) {
    return (
      <div className="p-4 text-center">
        <p>Initializing offline service...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-lg bg-white border border-gray-200">
          <h3 className="font-medium mb-2">Connection Status</h3>
          <p className={`text-${status?.isOnline ? 'green' : 'red'}-500`}>
            {status?.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>

        <div className="p-6 rounded-lg bg-white border border-gray-200">
          <h3 className="font-medium mb-2">Last Sync</h3>
          <p className="text-gray-500">
            {status?.lastSync
              ? new Date(status.lastSync).toLocaleString()
              : 'Never'}
          </p>
        </div>

        <div className="p-6 rounded-lg bg-white border border-gray-200">
          <h3 className="font-medium mb-2">Pending Changes</h3>
          <p className="text-gray-500">{status?.pendingSyncCount || 0}</p>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="p-6 rounded-lg bg-white border border-gray-200">
        <h3 className="font-medium mb-4">Storage Usage</h3>
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{
                width: `${status?.storageUsage.percentage * 100}%`
              }}
            />
          </div>
          <p className="text-sm text-gray-500">
            {formatBytes(status?.storageUsage.used || 0)} /{' '}
            {formatBytes(status?.storageUsage.quota || 0)}
          </p>
        </div>
      </div>

      {/* Sync Progress */}
      {syncProgress && (
        <div className="p-6 rounded-lg bg-white border border-gray-200">
          <h3 className="font-medium mb-4">Sync Progress</h3>
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full"
                style={{
                  width: `${(syncProgress.processed / syncProgress.total) * 100}%`
                }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Processed: {syncProgress.processed}</span>
              <span>Successful: {syncProgress.successful}</span>
              <span>Failed: {syncProgress.failed}</span>
              <span>Total: {syncProgress.total}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <h3 className="font-medium mb-2">Error</h3>
          <p>{error.message}</p>
          {error.details && (
            <pre className="mt-2 text-sm">{JSON.stringify(error.details, null, 2)}</pre>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => forceSyncNow()}
          disabled={!status?.isOnline}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Force Sync Now
        </button>
      </div>
    </div>
  );
};
