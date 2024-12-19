import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface HRSystem {
  id: string;
  name: string;
  type: 'hr' | 'payroll' | 'both';
  icon: string;
  isConnected: boolean;
  lastSync?: Date;
  features: {
    timeTracking: boolean;
    attendance: boolean;
    leaves: boolean;
    payroll: boolean;
    benefits: boolean;
  };
}

interface SyncConfig {
  autoSync: boolean;
  syncFrequency: number;
  dataTypes: string[];
  mappings: Record<string, string>;
}

export const HRPayroll: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

  const { data: systems } = useQuery<HRSystem[]>(
    ['hr-systems'],
    () => scheduleAPI.getHRSystems()
  );

  const { data: syncConfig } = useQuery<SyncConfig>(
    ['hr-sync-config', selectedSystem],
    () => scheduleAPI.getHRSyncConfig(selectedSystem!),
    { enabled: !!selectedSystem }
  );

  const connectMutation = useMutation(
    (systemId: string) => scheduleAPI.connectHRSystem(systemId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hr-systems');
      },
    }
  );

  const disconnectMutation = useMutation(
    (systemId: string) => scheduleAPI.disconnectHRSystem(systemId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hr-systems');
      },
    }
  );

  const updateConfigMutation = useMutation(
    ({ systemId, config }: { systemId: string; config: Partial<SyncConfig> }) =>
      scheduleAPI.updateHRSyncConfig(systemId, config),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hr-sync-config');
      },
    }
  );

  const testConnectionMutation = useMutation(
    (systemId: string) => scheduleAPI.testHRConnection(systemId)
  );

  const renderFeatureList = (features: HRSystem['features']) => (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {Object.entries(features).map(([key, enabled]) => (
        <div
          key={key}
          className={`text-sm ${enabled ? 'text-green-600' : 'text-gray-400'}`}
        >
          <span className="material-icons-outlined text-sm mr-1">
            {enabled ? 'check_circle' : 'remove_circle_outline'}
          </span>
          {key.replace(/([A-Z])/g, ' $1').trim()}
        </div>
      ))}
    </div>
  );

  const renderSystemCard = (system: HRSystem) => (
    <div
      key={system.id}
      className={`
        p-6 rounded-lg border ${
          system.isConnected ? 'border-green-200 bg-green-50' : 'border-gray-200'
        }
        ${selectedSystem === system.id ? 'ring-2 ring-blue-500' : ''}
        cursor-pointer hover:bg-gray-50 transition-all duration-200
      `}
      onClick={() => setSelectedSystem(system.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={system.icon}
            alt={system.name}
            className="w-8 h-8"
          />
          <div>
            <h3 className="text-lg font-medium">{system.name}</h3>
            <span className="text-sm text-gray-500 capitalize">{system.type}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {system.isConnected ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  testConnectionMutation.mutate(system.id);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Test
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  disconnectMutation.mutate(system.id);
                }}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                connectMutation.mutate(system.id);
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {renderFeatureList(system.features)}

      {system.isConnected && (
        <div className="mt-4 text-sm text-gray-500">
          Last synced: {system.lastSync ? new Date(system.lastSync).toLocaleString() : 'Never'}
        </div>
      )}
    </div>
  );

  const renderSyncConfig = (config: SyncConfig) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Auto Sync</label>
        <div className="relative inline-block w-10 mr-2 align-middle select-none">
          <input
            type="checkbox"
            checked={config.autoSync}
            onChange={(e) =>
              updateConfigMutation.mutate({
                systemId: selectedSystem!,
                config: { autoSync: e.target.checked },
              })
            }
            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
          />
          <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Sync Frequency (minutes)</label>
        <input
          type="number"
          value={config.syncFrequency}
          onChange={(e) =>
            updateConfigMutation.mutate({
              systemId: selectedSystem!,
              config: { syncFrequency: parseInt(e.target.value) },
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Data Types to Sync</label>
        <div className="mt-2 space-y-2">
          {config.dataTypes.map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={true}
                onChange={() => {}}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Field Mappings</label>
        <div className="mt-2 space-y-2">
          {Object.entries(config.mappings).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <input
                value={key}
                readOnly
                className="flex-1 rounded-md border-gray-300 bg-gray-50"
              />
              <span className="text-gray-500">→</span>
              <input
                value={value}
                onChange={(e) =>
                  updateConfigMutation.mutate({
                    systemId: selectedSystem!,
                    config: {
                      mappings: { ...config.mappings, [key]: e.target.value },
                    },
                  })
                }
                className="flex-1 rounded-md border-gray-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systems?.map(renderSystemCard)}
      </div>

      {selectedSystem && syncConfig && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-6">Sync Configuration</h3>
          {renderSyncConfig(syncConfig)}
        </div>
      )}

      {testConnectionMutation.isSuccess && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg">
          Connection test successful!
        </div>
      )}

      {testConnectionMutation.isError && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          Connection test failed. Please check your configuration.
        </div>
      )}
    </div>
  );
};
