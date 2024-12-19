import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface CommunicationPlatform {
  id: string;
  name: string;
  icon: string;
  isConnected: boolean;
  features: {
    notifications: boolean;
    messages: boolean;
    channels: boolean;
    directMessages: boolean;
    fileSharing: boolean;
  };
  settings?: {
    notificationTypes: string[];
    channels: string[];
    mentionRoles: string[];
  };
}

interface NotificationRule {
  id: string;
  event: string;
  channel: string;
  template: string;
  enabled: boolean;
}

export const Communication: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<string | null>(null);

  const { data: platforms } = useQuery<CommunicationPlatform[]>(
    ['communication-platforms'],
    () => scheduleAPI.getCommunicationPlatforms()
  );

  const { data: notificationRules } = useQuery<NotificationRule[]>(
    ['notification-rules', selectedPlatform],
    () => scheduleAPI.getNotificationRules(selectedPlatform!),
    { enabled: !!selectedPlatform }
  );

  const connectMutation = useMutation(
    (platformId: string) => scheduleAPI.connectCommunicationPlatform(platformId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('communication-platforms');
      },
    }
  );

  const disconnectMutation = useMutation(
    (platformId: string) => scheduleAPI.disconnectCommunicationPlatform(platformId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('communication-platforms');
      },
    }
  );

  const updateSettingsMutation = useMutation(
    ({
      platformId,
      settings,
    }: {
      platformId: string;
      settings: CommunicationPlatform['settings'];
    }) => scheduleAPI.updateCommunicationSettings(platformId, settings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('communication-platforms');
      },
    }
  );

  const updateRuleMutation = useMutation(
    (rule: NotificationRule) => scheduleAPI.updateNotificationRule(rule),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notification-rules');
        setEditingRule(null);
      },
    }
  );

  const testNotificationMutation = useMutation(
    (platformId: string) => scheduleAPI.testCommunicationNotification(platformId)
  );

  const renderFeatureList = (features: CommunicationPlatform['features']) => (
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

  const renderPlatformCard = (platform: CommunicationPlatform) => (
    <div
      key={platform.id}
      className={`
        p-6 rounded-lg border ${
          platform.isConnected ? 'border-green-200 bg-green-50' : 'border-gray-200'
        }
        ${selectedPlatform === platform.id ? 'ring-2 ring-blue-500' : ''}
        cursor-pointer hover:bg-gray-50 transition-all duration-200
      `}
      onClick={() => setSelectedPlatform(platform.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={platform.icon}
            alt={platform.name}
            className="w-8 h-8"
          />
          <h3 className="text-lg font-medium">{platform.name}</h3>
        </div>

        <div className="flex items-center gap-2">
          {platform.isConnected ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  testNotificationMutation.mutate(platform.id);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Test
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  disconnectMutation.mutate(platform.id);
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
                connectMutation.mutate(platform.id);
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {renderFeatureList(platform.features)}

      {platform.isConnected && platform.settings && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Notification Types</label>
            <select
              multiple
              value={platform.settings.notificationTypes}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map(
                  (option) => option.value
                );
                updateSettingsMutation.mutate({
                  platformId: platform.id,
                  settings: {
                    ...platform.settings,
                    notificationTypes: selected,
                  },
                });
              }}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              <option value="shifts">Shifts</option>
              <option value="requests">Requests</option>
              <option value="updates">Updates</option>
              <option value="alerts">Alerts</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Channels</label>
            <input
              type="text"
              value={platform.settings.channels.join(', ')}
              onChange={(e) =>
                updateSettingsMutation.mutate({
                  platformId: platform.id,
                  settings: {
                    ...platform.settings,
                    channels: e.target.value.split(',').map((c) => c.trim()),
                  },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderNotificationRules = () => (
    <div className="space-y-4">
      {notificationRules?.map((rule) => (
        <div
          key={rule.id}
          className="p-4 border rounded-lg bg-white"
        >
          {editingRule === rule.id ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Event</label>
                <input
                  type="text"
                  value={rule.event}
                  onChange={(e) =>
                    updateRuleMutation.mutate({
                      ...rule,
                      event: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Channel</label>
                <input
                  type="text"
                  value={rule.channel}
                  onChange={(e) =>
                    updateRuleMutation.mutate({
                      ...rule,
                      channel: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Template</label>
                <textarea
                  value={rule.template}
                  onChange={(e) =>
                    updateRuleMutation.mutate({
                      ...rule,
                      template: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingRule(null)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateRuleMutation.mutate(rule)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{rule.event}</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingRule(rule.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <span className="material-icons-outlined text-sm">edit</span>
                  </button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) =>
                        updateRuleMutation.mutate({
                          ...rule,
                          enabled: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              <div className="text-sm text-gray-500">Channel: {rule.channel}</div>
              <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                {rule.template}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms?.map(renderPlatformCard)}
      </div>

      {selectedPlatform && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-6">Notification Rules</h3>
          {renderNotificationRules()}
        </div>
      )}

      {testNotificationMutation.isSuccess && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg">
          Test notification sent successfully!
        </div>
      )}

      {testNotificationMutation.isError && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          Failed to send test notification. Please check your configuration.
        </div>
      )}
    </div>
  );
};
