import React from 'react';
import { useOffline } from '../../contexts/OfflineContext';

export const OfflineIndicator: React.FC = () => {
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
        className={`
          p-4 rounded-lg shadow-lg
          ${
            isOnline
              ? 'bg-white border border-gray-200'
              : 'bg-yellow-50 border border-yellow-200'
          }
        `}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            ></div>
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
            <button
              onClick={forceSync}
              disabled={!isOnline || isSyncing}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg
                ${
                  isOnline && !isSyncing
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        )}

        {storageUsage.percentage > 80 && (
          <div className="mt-2">
            <div className="text-sm text-red-600">
              Storage usage: {storageUsage.percentage.toFixed(1)}%
            </div>
            <div className="h-1 bg-gray-200 rounded-full mt-1">
              <div
                className="h-full bg-red-600 rounded-full"
                style={{ width: `${storageUsage.percentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
