import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface SyncStatus {
  lastSync: Date;
  pendingChanges: number;
  storageUsage: {
    total: number;
    used: number;
  };
  status: 'idle' | 'syncing' | 'error';
  error?: string;
}

interface SyncConfig {
  autoSync: boolean;
  syncInterval: number;
  syncOnConnect: boolean;
  maxRetries: number;
  conflictResolution: 'client' | 'server' | 'manual';
  dataTypes: {
    [key: string]: {
      enabled: boolean;
      priority: number;
    };
  };
}

interface PendingChange {
  id: string;
  type: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: Date;
  data: any;
  status: 'pending' | 'syncing' | 'error';
  retries: number;
  error?: string;
}

interface ConflictResolution {
  id: string;
  type: string;
  clientData: any;
  serverData: any;
  resolution?: 'client' | 'server' | 'manual';
  manualData?: any;
  status: 'pending' | 'resolved';
}

export const OfflineSync: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedChange, setSelectedChange] = useState<string | null>(null);
  const [showConflicts, setShowConflicts] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const { data: syncStatus } = useQuery<SyncStatus>(
    ['sync-status'],
    () => scheduleAPI.getSyncStatus()
  );

  const { data: syncConfig } = useQuery<SyncConfig>(
    ['sync-config'],
    () => scheduleAPI.getSyncConfig()
  );

  const { data: pendingChanges } = useQuery<PendingChange[]>(
    ['pending-changes'],
    () => scheduleAPI.getPendingChanges()
  );

  const { data: conflicts } = useQuery<ConflictResolution[]>(
    ['sync-conflicts'],
    () => scheduleAPI.getSyncConflicts(),
    {
      enabled: showConflicts,
    }
  );

  const updateConfigMutation = useMutation(
    (config: SyncConfig) => scheduleAPI.updateSyncConfig(config),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sync-config');
      },
    }
  );

  const resolveConflictMutation = useMutation(
    (resolution: ConflictResolution) => scheduleAPI.resolveSyncConflict(resolution),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sync-conflicts');
      },
    }
  );

  const retryChangeMutation = useMutation(
    (changeId: string) => scheduleAPI.retrySyncChange(changeId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pending-changes');
        queryClient.invalidateQueries('sync-status');
      },
    }
  );

  const forceSyncMutation = useMutation(
    () => scheduleAPI.forceSync(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sync-status');
        queryClient.invalidateQueries('pending-changes');
        queryClient.invalidateQueries('sync-conflicts');
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

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
  };

  const renderSyncStatus = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-6 rounded-lg bg-white border border-gray-200">
        <h3 className="font-medium mb-2">Last Sync</h3>
        <p className="text-gray-500">
          {syncStatus?.lastSync
            ? new Date(syncStatus.lastSync).toLocaleString()
            : 'Never'}
        </p>
      </div>

      <div className="p-6 rounded-lg bg-white border border-gray-200">
        <h3 className="font-medium mb-2">Pending Changes</h3>
        <p className="text-gray-500">{syncStatus?.pendingChanges || 0}</p>
      </div>

      <div className="p-6 rounded-lg bg-white border border-gray-200">
        <h3 className="font-medium mb-2">Storage Usage</h3>
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{
                width: `${
                  (syncStatus?.storageUsage.used /
                    syncStatus?.storageUsage.total) *
                  100
                }%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            {formatBytes(syncStatus?.storageUsage.used || 0)} /{' '}
            {formatBytes(syncStatus?.storageUsage.total || 0)}
          </p>
        </div>
      </div>
    </div>
  );

  const renderSyncConfig = () => (
    <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Auto Sync</h3>
          <p className="text-sm text-gray-500">
            Automatically sync changes when online
          </p>
        </div>
        <div className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={syncConfig?.autoSync}
            onChange={(e) =>
              updateConfigMutation.mutate({
                ...syncConfig!,
                autoSync: e.target.checked,
              })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2">Sync Interval (minutes)</label>
        <input
          type="number"
          value={syncConfig?.syncInterval}
          onChange={(e) =>
            updateConfigMutation.mutate({
              ...syncConfig!,
              syncInterval: parseInt(e.target.value),
            })
          }
          className="block w-full rounded-md border-gray-300"
          min="1"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Sync on Connect</h3>
          <p className="text-sm text-gray-500">
            Automatically sync when internet connection is restored
          </p>
        </div>
        <div className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={syncConfig?.syncOnConnect}
            onChange={(e) =>
              updateConfigMutation.mutate({
                ...syncConfig!,
                syncOnConnect: e.target.checked,
              })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2">Max Retries</label>
        <input
          type="number"
          value={syncConfig?.maxRetries}
          onChange={(e) =>
            updateConfigMutation.mutate({
              ...syncConfig!,
              maxRetries: parseInt(e.target.value),
            })
          }
          className="block w-full rounded-md border-gray-300"
          min="1"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Conflict Resolution</label>
        <select
          value={syncConfig?.conflictResolution}
          onChange={(e) =>
            updateConfigMutation.mutate({
              ...syncConfig!,
              conflictResolution: e.target.value as 'client' | 'server' | 'manual',
            })
          }
          className="block w-full rounded-md border-gray-300"
        >
          <option value="client">Client Wins</option>
          <option value="server">Server Wins</option>
          <option value="manual">Manual Resolution</option>
        </select>
      </div>

      <div>
        <h3 className="font-medium mb-4">Data Types</h3>
        <div className="space-y-4">
          {Object.entries(syncConfig?.dataTypes || {}).map(
            ([type, config]) => (
              <div key={type} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{type}</h4>
                  <div className="flex items-center gap-4">
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) =>
                          updateConfigMutation.mutate({
                            ...syncConfig!,
                            dataTypes: {
                              ...syncConfig!.dataTypes,
                              [type]: {
                                ...config,
                                enabled: e.target.checked,
                              },
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                    <input
                      type="number"
                      value={config.priority}
                      onChange={(e) =>
                        updateConfigMutation.mutate({
                          ...syncConfig!,
                          dataTypes: {
                            ...syncConfig!.dataTypes,
                            [type]: {
                              ...config,
                              priority: parseInt(e.target.value),
                            },
                          },
                        })
                      }
                      className="w-20 rounded-md border-gray-300"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );

  const renderPendingChanges = () => (
    <div className="space-y-4">
      {pendingChanges?.map((change) => (
        <div
          key={change.id}
          className={`p-4 rounded-lg border ${
            selectedChange === change.id
              ? 'ring-2 ring-blue-500'
              : 'hover:bg-gray-50'
          } cursor-pointer`}
          onClick={() => setSelectedChange(change.id)}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{change.type}</h4>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    change.status === 'error'
                      ? 'bg-red-100 text-red-800'
                      : change.status === 'syncing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {change.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(change.timestamp).toLocaleString()}
              </p>
            </div>
            {change.status === 'error' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  retryChangeMutation.mutate(change.id);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Retry
              </button>
            )}
          </div>

          {selectedChange === change.id && (
            <div className="mt-4">
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(change.data, null, 2)}
              </pre>
              {change.error && (
                <p className="mt-2 text-sm text-red-600">{change.error}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderConflicts = () => (
    <div className="space-y-4">
      {conflicts?.map((conflict) => (
        <div
          key={conflict.id}
          className="p-6 rounded-lg border border-gray-200 space-y-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{conflict.type}</h4>
              <p className="text-sm text-gray-500">
                Status: {conflict.status}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium mb-2">Client Data</h5>
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(conflict.clientData, null, 2)}
              </pre>
            </div>
            <div>
              <h5 className="text-sm font-medium mb-2">Server Data</h5>
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(conflict.serverData, null, 2)}
              </pre>
            </div>
          </div>

          {conflict.status === 'pending' && (
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  resolveConflictMutation.mutate({
                    ...conflict,
                    resolution: 'client',
                  })
                }
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Use Client Version
              </button>
              <button
                onClick={() =>
                  resolveConflictMutation.mutate({
                    ...conflict,
                    resolution: 'server',
                  })
                }
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Use Server Version
              </button>
              <button
                onClick={() =>
                  resolveConflictMutation.mutate({
                    ...conflict,
                    resolution: 'manual',
                    manualData: conflict.clientData,
                  })
                }
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Edit Manually
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Offline Sync</h2>
          <p className="text-gray-500">
            Status:{' '}
            <span
              className={`inline-flex items-center ${
                isOnline ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowConflicts(!showConflicts)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showConflicts ? 'Hide Conflicts' : 'Show Conflicts'}
          </button>
          <button
            onClick={() => forceSyncMutation.mutate()}
            disabled={!isOnline}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Force Sync
          </button>
        </div>
      </div>

      {renderSyncStatus()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Sync Configuration</h3>
          {renderSyncConfig()}
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium">
            {showConflicts ? 'Sync Conflicts' : 'Pending Changes'}
          </h3>
          {showConflicts ? renderConflicts() : renderPendingChanges()}
        </div>
      </div>
    </div>
  );
};
