import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
}

interface SyncStatus {
  lastSync: Date;
  pendingActions: number;
  storageUsage: {
    used: number;
    total: number;
  };
}

export const OfflineSupport: React.FC = () => {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: offlineActions } = useQuery<OfflineAction[]>(
    ['offline-actions'],
    () => scheduleAPI.getOfflineActions(),
  );

  const { data: syncStatus } = useQuery<SyncStatus>(
    ['sync-status'],
    () => scheduleAPI.getSyncStatus(),
  );

  const syncMutation = useMutation(
    () => scheduleAPI.syncOfflineActions(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('offline-actions');
        queryClient.invalidateQueries('sync-status');
      },
    }
  );

  const clearActionMutation = useMutation(
    (actionId: string) => scheduleAPI.clearOfflineAction(actionId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('offline-actions');
        queryClient.invalidateQueries('sync-status');
      },
    }
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && offlineActions?.length && !isSyncing) {
      setIsSyncing(true);
      syncMutation.mutate();
    }
  }, [isOnline, offlineActions?.length]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Offline Status</h3>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {syncStatus && (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Storage Usage</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(syncStatus.storageUsage.used / syncStatus.storageUsage.total) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatBytes(syncStatus.storageUsage.used)} /{' '}
                {formatBytes(syncStatus.storageUsage.total)}
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span>Last Sync</span>
              <span>
                {syncStatus.lastSync
                  ? new Date(syncStatus.lastSync).toLocaleString()
                  : 'Never'}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Pending Actions</span>
              <span>{syncStatus.pendingActions}</span>
            </div>
          </div>
        )}
      </div>

      {offlineActions && offlineActions.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Pending Actions</h3>
              <button
                onClick={() => syncMutation.mutate()}
                disabled={!isOnline || isSyncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>

            <div className="space-y-4">
              {offlineActions.map((action) => (
                <div
                  key={action.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium capitalize">{action.type}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(action.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        action.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : action.status === 'syncing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {action.status}
                    </span>
                    {action.status === 'failed' && (
                      <button
                        onClick={() => clearActionMutation.mutate(action.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <span className="material-icons-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500 text-center">
        {isOnline ? (
          'All changes will be synchronized automatically'
        ) : (
          'Changes will be saved locally and synced when you're back online'
        )}
      </div>
    </div>
  );
};
