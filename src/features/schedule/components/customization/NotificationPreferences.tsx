import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface NotificationChannel {
  id: string;
  type: 'email' | 'push' | 'sms' | 'slack' | 'teams';
  name: string;
  icon: string;
  isConfigured: boolean;
  settings?: {
    address?: string;
    phone?: string;
    webhook?: string;
    frequency?: 'instant' | 'digest' | 'custom';
    customInterval?: number;
  };
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  events: NotificationEvent[];
}

interface NotificationEvent {
  id: string;
  name: string;
  description: string;
  channels: {
    channelId: string;
    enabled: boolean;
  }[];
}

interface NotificationTest {
  id: string;
  timestamp: Date;
  channel: string;
  status: 'success' | 'failure';
  message: string;
}

export const NotificationPreferences: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showTestResults, setShowTestResults] = useState(false);

  const { data: channels } = useQuery<NotificationChannel[]>(
    ['notification-channels'],
    () => scheduleAPI.getNotificationChannels()
  );

  const { data: categories } = useQuery<NotificationCategory[]>(
    ['notification-categories'],
    () => scheduleAPI.getNotificationCategories()
  );

  const { data: testResults } = useQuery<NotificationTest[]>(
    ['notification-tests'],
    () => scheduleAPI.getNotificationTests(),
    {
      enabled: showTestResults,
    }
  );

  const updateChannelMutation = useMutation(
    (channel: NotificationChannel) => scheduleAPI.updateNotificationChannel(channel),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notification-channels');
      },
    }
  );

  const updateEventMutation = useMutation(
    ({
      categoryId,
      eventId,
      channels,
    }: {
      categoryId: string;
      eventId: string;
      channels: { channelId: string; enabled: boolean }[];
    }) => scheduleAPI.updateNotificationEvent(categoryId, eventId, channels),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notification-categories');
      },
    }
  );

  const testChannelMutation = useMutation(
    (channelId: string) => scheduleAPI.testNotificationChannel(channelId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notification-tests');
        setShowTestResults(true);
      },
    }
  );

  const renderChannelCard = (channel: NotificationChannel) => (
    <div
      key={channel.id}
      className="p-6 rounded-lg border border-gray-200 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={channel.icon}
            alt={channel.name}
            className="w-8 h-8"
          />
          <div>
            <h3 className="font-medium">{channel.name}</h3>
            <span className="text-sm text-gray-500 capitalize">{channel.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => testChannelMutation.mutate(channel.id)}
            disabled={!channel.isConfigured}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            Test
          </button>
          {channel.isConfigured ? (
            <span className="text-green-600">●</span>
          ) : (
            <span className="text-gray-400">●</span>
          )}
        </div>
      </div>

      {channel.type === 'email' && (
        <div>
          <label className="text-sm font-medium">Email Address</label>
          <input
            type="email"
            value={channel.settings?.address || ''}
            onChange={(e) =>
              updateChannelMutation.mutate({
                ...channel,
                settings: { ...channel.settings, address: e.target.value },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300"
          />
        </div>
      )}

      {channel.type === 'sms' && (
        <div>
          <label className="text-sm font-medium">Phone Number</label>
          <input
            type="tel"
            value={channel.settings?.phone || ''}
            onChange={(e) =>
              updateChannelMutation.mutate({
                ...channel,
                settings: { ...channel.settings, phone: e.target.value },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300"
          />
        </div>
      )}

      {(channel.type === 'slack' || channel.type === 'teams') && (
        <div>
          <label className="text-sm font-medium">Webhook URL</label>
          <input
            type="url"
            value={channel.settings?.webhook || ''}
            onChange={(e) =>
              updateChannelMutation.mutate({
                ...channel,
                settings: { ...channel.settings, webhook: e.target.value },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300"
          />
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Notification Frequency</label>
        <select
          value={channel.settings?.frequency || 'instant'}
          onChange={(e) =>
            updateChannelMutation.mutate({
              ...channel,
              settings: {
                ...channel.settings,
                frequency: e.target.value as NotificationChannel['settings']['frequency'],
              },
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300"
        >
          <option value="instant">Instant</option>
          <option value="digest">Daily Digest</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {channel.settings?.frequency === 'custom' && (
        <div>
          <label className="text-sm font-medium">Custom Interval (minutes)</label>
          <input
            type="number"
            value={channel.settings?.customInterval || 30}
            onChange={(e) =>
              updateChannelMutation.mutate({
                ...channel,
                settings: {
                  ...channel.settings,
                  customInterval: parseInt(e.target.value),
                },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300"
          />
        </div>
      )}
    </div>
  );

  const renderCategoryCard = (category: NotificationCategory) => (
    <div
      key={category.id}
      className={`
        p-6 rounded-lg border border-gray-200
        ${selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''}
        cursor-pointer hover:bg-gray-50 transition-all duration-200
      `}
      onClick={() => setSelectedCategory(category.id)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium">{category.name}</h3>
          <p className="text-sm text-gray-500">{category.description}</p>
        </div>
        <span
          className={`text-sm px-2 py-1 rounded-full ${
            category.priority === 'high'
              ? 'bg-red-100 text-red-800'
              : category.priority === 'medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {category.priority} priority
        </span>
      </div>

      <div className="space-y-4">
        {category.events.map((event) => (
          <div key={event.id} className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{event.name}</div>
                <div className="text-sm text-gray-500">{event.description}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {channels?.map((channel) => {
                const eventChannel = event.channels.find(
                  (ec) => ec.channelId === channel.id
                );
                return (
                  <label
                    key={channel.id}
                    className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={channel.icon}
                      alt={channel.name}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{channel.name}</span>
                    <input
                      type="checkbox"
                      checked={eventChannel?.enabled || false}
                      onChange={(e) =>
                        updateEventMutation.mutate({
                          categoryId: category.id,
                          eventId: event.id,
                          channels: event.channels.map((ec) =>
                            ec.channelId === channel.id
                              ? { ...ec, enabled: e.target.checked }
                              : ec
                          ),
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTestResults = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Test Results</h3>
        <button
          onClick={() => setShowTestResults(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <span className="material-icons-outlined">close</span>
        </button>
      </div>

      {testResults?.map((result) => (
        <div
          key={result.id}
          className={`p-4 rounded-lg ${
            result.status === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium capitalize">{result.channel}</div>
              <div className="text-sm">{result.message}</div>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Notification Channels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels?.map(renderChannelCard)}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Notification Categories</h2>
        <div className="space-y-4">
          {categories?.map(renderCategoryCard)}
        </div>
      </div>

      {showTestResults && (
        <div className="bg-white rounded-lg shadow p-6">
          {renderTestResults()}
        </div>
      )}
    </div>
  );
};
