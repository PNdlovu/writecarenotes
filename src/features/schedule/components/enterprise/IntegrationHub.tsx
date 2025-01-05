import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface Integration {
  id: string;
  type:
    | 'CALENDAR'
    | 'PAYROLL'
    | 'HR'
    | 'TIME_CLOCK'
    | 'COMMUNICATION'
    | 'ANALYTICS';
  provider: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  config: Record<string, any>;
  lastSync?: string;
  error?: string;
}

interface IntegrationProvider {
  id: string;
  name: string;
  type: Integration['type'];
  description: string;
  requiredConfig: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'select' | 'boolean';
    options?: string[];
    required: boolean;
  }>;
}

export function IntegrationHub() {
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider>();
  const [configForm, setConfigForm] = useState<Record<string, any>>({});

  const { data: integrations = [] } = useQuery<Integration[]>({
    queryKey: ['integrations'],
    queryFn: () => scheduleAPI.getIntegrations(),
  });

  const { data: providers = [] } = useQuery<IntegrationProvider[]>({
    queryKey: ['integration-providers'],
    queryFn: () => scheduleAPI.getIntegrationProviders(),
  });

  const addIntegrationMutation = useMutation({
    mutationFn: (data: {
      providerId: string;
      config: Record<string, any>;
    }) => scheduleAPI.addIntegration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setSelectedProvider(undefined);
      setConfigForm({});
    },
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: (data: { id: string; active: boolean }) =>
      scheduleAPI.toggleIntegration(data.id, data.active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const syncIntegrationMutation = useMutation({
    mutationFn: (integrationId: string) =>
      scheduleAPI.syncIntegration(integrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProvider) {
      addIntegrationMutation.mutate({
        providerId: selectedProvider.id,
        config: configForm,
      });
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Integration Hub
          </h3>
          <button
            onClick={() => setSelectedProvider(undefined)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Integration
          </button>
        </div>

        {selectedProvider ? (
          <div className="max-w-lg mx-auto">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Configure {selectedProvider.name}
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedProvider.requiredConfig.map((config) => (
                <div key={config.key}>
                  <label
                    htmlFor={config.key}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {config.label}
                    {config.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {config.type === 'select' ? (
                    <select
                      id={config.key}
                      value={configForm[config.key] || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          [config.key]: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select...</option>
                      {config.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : config.type === 'boolean' ? (
                    <div className="mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={configForm[config.key] || false}
                          onChange={(e) =>
                            setConfigForm({
                              ...configForm,
                              [config.key]: e.target.checked,
                            })
                          }
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          Enable
                        </span>
                      </label>
                    </div>
                  ) : (
                    <input
                      type={config.type}
                      id={config.key}
                      value={configForm[config.key] || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          [config.key]: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedProvider(undefined)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Integration
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Available Integrations */}
            <div className="mb-8">
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Available Integrations
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
                  >
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => setSelectedProvider(provider)}
                        className="focus:outline-none"
                      >
                        <span className="absolute inset-0" aria-hidden="true" />
                        <p className="text-sm font-medium text-gray-900">
                          {provider.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {provider.description}
                        </p>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Integrations */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Active Integrations
              </h4>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        Integration
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Type
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Last Sync
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {integrations.map((integration) => (
                      <tr key={integration.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                          {integration.provider}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {integration.type}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                              integration.status
                            )}`}
                          >
                            {integration.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {integration.lastSync
                            ? new Date(integration.lastSync).toLocaleString()
                            : 'Never'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() =>
                                toggleIntegrationMutation.mutate({
                                  id: integration.id,
                                  active:
                                    integration.status === 'INACTIVE',
                                })
                              }
                              className="text-blue-600 hover:text-blue-900"
                            >
                              {integration.status === 'ACTIVE'
                                ? 'Disable'
                                : 'Enable'}
                            </button>
                            <button
                              onClick={() =>
                                syncIntegrationMutation.mutate(integration.id)
                              }
                              className="text-green-600 hover:text-green-900"
                            >
                              Sync
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: Integration['status']): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800';
    case 'ERROR':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
