import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface CalendarProvider {
  id: string;
  name: string;
  icon: string;
  isConnected: boolean;
  lastSync?: Date;
  settings?: {
    syncDirection: 'one-way' | 'two-way';
    syncFrequency: number;
    eventTypes: string[];
  };
}

interface SyncStatus {
  inProgress: boolean;
  lastSync: Date;
  nextSync: Date;
  errors: Array<{
    timestamp: Date;
    message: string;
  }>;
}

export const CalendarSync: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const { data: providers } = useQuery<CalendarProvider[]>(
    ['calendar-providers'],
    () => scheduleAPI.getCalendarProviders()
  );

  const { data: syncStatus } = useQuery<SyncStatus>(
    ['calendar-sync-status', selectedProvider],
    () => scheduleAPI.getCalendarSyncStatus(selectedProvider!),
    { enabled: !!selectedProvider }
  );

  const connectMutation = useMutation(
    (providerId: string) => scheduleAPI.connectCalendarProvider(providerId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('calendar-providers');
        queryClient.invalidateQueries('calendar-sync-status');
      },
    }
  );

  const disconnectMutation = useMutation(
    (providerId: string) => scheduleAPI.disconnectCalendarProvider(providerId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('calendar-providers');
        queryClient.invalidateQueries('calendar-sync-status');
      },
    }
  );

  const updateSettingsMutation = useMutation(
    ({ providerId, settings }: { providerId: string; settings: any }) =>
      scheduleAPI.updateCalendarSettings(providerId, settings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('calendar-providers');
      },
    }
  );

  const forceSyncMutation = useMutation(
    (providerId: string) => scheduleAPI.forceCalendarSync(providerId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('calendar-sync-status');
      },
    }
  );

  const renderProviderCard = (provider: CalendarProvider) => (
    <div
      key={provider.id}
      className={`
        p-6 rounded-lg border ${
          provider.isConnected ? 'border-green-200 bg-green-50' : 'border-gray-200'
        }
        ${selectedProvider === provider.id ? 'ring-2 ring-blue-500' : ''}
        cursor-pointer hover:bg-gray-50 transition-all duration-200
      `}
      onClick={() => setSelectedProvider(provider.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={provider.icon}
            alt={provider.name}
            className="w-8 h-8"
          />
          <h3 className="text-lg font-medium">{provider.name}</h3>
        </div>
        <div>
          {provider.isConnected ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                disconnectMutation.mutate(provider.id);
              }}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                connectMutation.mutate(provider.id);
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {provider.isConnected && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Last Sync</span>
            <span>
              {provider.lastSync
                ? new Date(provider.lastSync).toLocaleString()
                : 'Never'}
            </span>
          </div>

          {provider.settings && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sync Direction</span>
                <select
                  value={provider.settings.syncDirection}
                  onChange={(e) =>
                    updateSettingsMutation.mutate({
                      providerId: provider.id,
                      settings: {
                        ...provider.settings,
                        syncDirection: e.target.value,
                      },
                    })
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="border rounded px-2 py-1"
                >
                  <option value="one-way">One-way</option>
                  <option value="two-way">Two-way</option>
                </select>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sync Frequency (minutes)</span>
                <input
                  type="number"
                  value={provider.settings.syncFrequency}
                  onChange={(e) =>
                    updateSettingsMutation.mutate({
                      providerId: provider.id,
                      settings: {
                        ...provider.settings,
                        syncFrequency: parseInt(e.target.value),
                      },
                    })
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="border rounded w-20 px-2 py-1"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers?.map(renderProviderCard)}
      </div>

      {selectedProvider && syncStatus && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Sync Status</h3>
            <button
              onClick={() => forceSyncMutation.mutate(selectedProvider)}
              disabled={syncStatus.inProgress}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {syncStatus.inProgress ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last Sync</span>
              <span>{new Date(syncStatus.lastSync).toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Next Scheduled Sync</span>
              <span>{new Date(syncStatus.nextSync).toLocaleString()}</span>
            </div>

            {syncStatus.errors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-2">
                  Recent Errors
                </h4>
                <div className="space-y-2">
                  {syncStatus.errors.map((error, index) => (
                    <div
                      key={index}
                      className="text-sm text-red-600 bg-red-50 p-3 rounded"
                    >
                      {error.message}
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(error.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
