import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationTopic {
  id: string;
  name: string;
  description: string;
  isSubscribed: boolean;
  priority: 'low' | 'medium' | 'high';
  settings?: {
    quiet_hours?: {
      enabled: boolean;
      start: string;
      end: string;
    };
    grouping?: {
      enabled: boolean;
      max_group_size: number;
      time_window: number;
    };
  };
}

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  topic: string;
  action?: {
    type: string;
    data: any;
  };
  status: 'delivered' | 'clicked' | 'dismissed';
}

export const PushNotifications: React.FC = () => {
  const queryClient = useQueryClient();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const { data: topics } = useQuery<NotificationTopic[]>(
    ['notification-topics'],
    () => scheduleAPI.getNotificationTopics()
  );

  const { data: history } = useQuery<NotificationHistory[]>(
    ['notification-history'],
    () => scheduleAPI.getNotificationHistory(),
    {
      enabled: showHistory,
    }
  );

  const updateTopicMutation = useMutation(
    (topic: NotificationTopic) => scheduleAPI.updateNotificationTopic(topic),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notification-topics');
      },
    }
  );

  const clearHistoryMutation = useMutation(
    () => scheduleAPI.clearNotificationHistory(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notification-history');
      },
    }
  );

  const testNotificationMutation = useMutation(
    (topicId: string) => scheduleAPI.sendTestNotification(topicId)
  );

  useEffect(() => {
    const checkPermission = async () => {
      if ('Notification' in window) {
        const currentPermission = await Notification.requestPermission();
        setPermission(currentPermission);

        if (currentPermission === 'granted') {
          const registration = await navigator.serviceWorker.ready;
          const currentSubscription = await registration.pushManager.getSubscription();
          setSubscription(currentSubscription);
        }
      }
    };

    checkPermission();
  }, []);

  const subscribeToNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
      });

      await scheduleAPI.registerPushSubscription(subscription);
      setSubscription(subscription);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (subscription) {
      try {
        await subscription.unsubscribe();
        await scheduleAPI.unregisterPushSubscription(subscription.endpoint);
        setSubscription(null);
      } catch (error) {
        console.error('Failed to unsubscribe from push notifications:', error);
      }
    }
  };

  const renderPermissionPrompt = () => (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium mb-4">Enable Push Notifications</h3>
      <p className="text-gray-500 mb-6">
        Stay updated with important schedule changes and announcements.
      </p>
      <button
        onClick={subscribeToNotifications}
        disabled={permission === 'denied'}
        className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {permission === 'denied'
          ? 'Notifications Blocked'
          : 'Enable Notifications'}
      </button>
      {permission === 'denied' && (
        <p className="text-sm text-red-500 mt-4">
          Please enable notifications in your browser settings to continue.
        </p>
      )}
    </div>
  );

  const renderTopicCard = (topic: NotificationTopic) => (
    <div
      key={topic.id}
      className={`
        p-6 rounded-lg border border-gray-200
        ${selectedTopic === topic.id ? 'ring-2 ring-blue-500' : ''}
        cursor-pointer hover:bg-gray-50 transition-all duration-200
      `}
      onClick={() => setSelectedTopic(topic.id)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium">{topic.name}</h3>
          <p className="text-sm text-gray-500">{topic.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm px-2 py-1 rounded-full ${
              topic.priority === 'high'
                ? 'bg-red-100 text-red-800'
                : topic.priority === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {topic.priority}
          </span>
          <div className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={topic.isSubscribed}
              onChange={(e) =>
                updateTopicMutation.mutate({
                  ...topic,
                  isSubscribed: e.target.checked,
                })
              }
              onClick={(e) => e.stopPropagation()}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </div>
      </div>

      {topic.settings && (
        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Quiet Hours</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={topic.settings.quiet_hours?.enabled}
                  onChange={(e) =>
                    updateTopicMutation.mutate({
                      ...topic,
                      settings: {
                        ...topic.settings,
                        quiet_hours: {
                          ...topic.settings.quiet_hours,
                          enabled: e.target.checked,
                        },
                      },
                    })
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>

            {topic.settings.quiet_hours?.enabled && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-sm">Start Time</label>
                  <input
                    type="time"
                    value={topic.settings.quiet_hours.start}
                    onChange={(e) =>
                      updateTopicMutation.mutate({
                        ...topic,
                        settings: {
                          ...topic.settings,
                          quiet_hours: {
                            ...topic.settings.quiet_hours,
                            start: e.target.value,
                          },
                        },
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="text-sm">End Time</label>
                  <input
                    type="time"
                    value={topic.settings.quiet_hours.end}
                    onChange={(e) =>
                      updateTopicMutation.mutate({
                        ...topic,
                        settings: {
                          ...topic.settings,
                          quiet_hours: {
                            ...topic.settings.quiet_hours,
                            end: e.target.value,
                          },
                        },
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Group Notifications</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={topic.settings.grouping?.enabled}
                  onChange={(e) =>
                    updateTopicMutation.mutate({
                      ...topic,
                      settings: {
                        ...topic.settings,
                        grouping: {
                          ...topic.settings.grouping,
                          enabled: e.target.checked,
                        },
                      },
                    })
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>

            {topic.settings.grouping?.enabled && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-sm">Max Group Size</label>
                  <input
                    type="number"
                    value={topic.settings.grouping.max_group_size}
                    onChange={(e) =>
                      updateTopicMutation.mutate({
                        ...topic,
                        settings: {
                          ...topic.settings,
                          grouping: {
                            ...topic.settings.grouping,
                            max_group_size: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="text-sm">Time Window (mins)</label>
                  <input
                    type="number"
                    value={topic.settings.grouping.time_window}
                    onChange={(e) =>
                      updateTopicMutation.mutate({
                        ...topic,
                        settings: {
                          ...topic.settings,
                          grouping: {
                            ...topic.settings.grouping,
                            time_window: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            testNotificationMutation.mutate(topic.id);
          }}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Send Test Notification
        </button>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Notification History</h3>
        <button
          onClick={() => clearHistoryMutation.mutate()}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Clear History
        </button>
      </div>

      {history?.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border ${
            notification.status === 'clicked'
              ? 'bg-blue-50 border-blue-200'
              : notification.status === 'dismissed'
              ? 'bg-gray-50 border-gray-200'
              : 'border-gray-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{notification.title}</h4>
              <p className="text-sm text-gray-500">{notification.body}</p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(notification.timestamp).toLocaleString()}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-500">{notification.topic}</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                notification.status === 'clicked'
                  ? 'bg-blue-100 text-blue-800'
                  : notification.status === 'dismissed'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {notification.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  if (!subscription) {
    return renderPermissionPrompt();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Push Notifications</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          <button
            onClick={unsubscribeFromNotifications}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Disable Notifications
          </button>
        </div>
      </div>

      {showHistory ? (
        renderHistory()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics?.map(renderTopicCard)}
        </div>
      )}

      {testNotificationMutation.isSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-6 py-3 rounded-lg shadow-lg">
          Test notification sent successfully!
        </div>
      )}
    </div>
  );
};
