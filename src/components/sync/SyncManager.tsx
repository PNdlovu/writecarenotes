import React from 'react';
import { useSyncManagement } from '@/hooks/useSyncManagement';

export function SyncManager() {
  const {
    stats,
    isOnline,
    isSyncing,
    syncProgress,
    startSync,
    pauseSync,
    resumeSync,
    retryFailedItems,
    clearQueue,
  } = useSyncManagement();

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Sync Status</h2>
        <div className="flex items-center space-x-2">
          <div
            className={`h-3 w-3 rounded-full ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-600">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {isSyncing && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${syncProgress}%` }}
          />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500">Pending</div>
          <div className="text-xl font-semibold text-gray-900">
            {stats.pending}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500">Failed</div>
          <div className="text-xl font-semibold text-red-600">
            {stats.failed}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500">Completed</div>
          <div className="text-xl font-semibold text-green-600">
            {stats.completed}
          </div>
        </div>
      </div>

      {/* Last Sync Time */}
      <div className="text-sm text-gray-500 mb-4">
        Last synced:{' '}
        {stats.lastSync
          ? new Date(stats.lastSync).toLocaleString()
          : 'Never'}
      </div>

      {/* Actions */}
      <div className="flex flex-col space-y-2">
        {isOnline && !isSyncing && (
          <button
            onClick={() => startSync()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Start Sync
          </button>
        )}

        {isSyncing && (
          <button
            onClick={() => pauseSync()}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
          >
            Pause Sync
          </button>
        )}

        {!isSyncing && stats.failed > 0 && (
          <button
            onClick={() => retryFailedItems()}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
          >
            Retry Failed ({stats.failed})
          </button>
        )}

        {!isSyncing && stats.pending > 0 && (
          <button
            onClick={() => clearQueue()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Clear Queue
          </button>
        )}

        {!isSyncing && (
          <button
            onClick={() => resumeSync()}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Resume Background Sync
          </button>
        )}
      </div>
    </div>
  );
}


