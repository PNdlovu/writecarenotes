import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { scheduleAPI } from '../api/schedule-api';

interface NotificationPreference {
  id: string;
  userId: string;
  type: 'SHIFT_REMINDER' | 'SWAP_REQUEST' | 'SCHEDULE_CHANGE' | 'AVAILABILITY_CONFLICT';
  method: 'EMAIL' | 'SMS' | 'PUSH';
  advance: number; // minutes
  enabled: boolean;
}

interface NotificationMessage {
  id: string;
  userId: string;
  type: NotificationPreference['type'];
  message: string;
  read: boolean;
  createdAt: string;
}

export function ScheduleNotifications() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<'preferences' | 'messages'>(
    'messages'
  );

  const { data: preferences = [] } = useQuery<NotificationPreference[]>({
    queryKey: ['notification-preferences'],
    queryFn: () => scheduleAPI.getNotificationPreferences(),
  });

  const { data: messages = [] } = useQuery<NotificationMessage[]>({
    queryKey: ['notification-messages'],
    queryFn: () => scheduleAPI.getNotificationMessages(),
  });

  const updatePreferenceMutation = useMutation({
    mutationFn: (preference: NotificationPreference) =>
      scheduleAPI.updateNotificationPreference(preference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) =>
      scheduleAPI.markNotificationAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-messages'] });
    },
  });

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setSelectedTab('messages')}
            className={`w-1/2 py-4 px-1 text-center border-b-2 text-sm font-medium ${
              selectedTab === 'messages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setSelectedTab('preferences')}
            className={`w-1/2 py-4 px-1 text-center border-b-2 text-sm font-medium ${
              selectedTab === 'preferences'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Preferences
          </button>
        </nav>
      </div>

      <div className="p-4">
        {selectedTab === 'messages' ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${
                  message.read ? 'bg-gray-50' : 'bg-blue-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        message.read ? 'text-gray-900' : 'text-blue-900'
                      }`}
                    >
                      {message.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  {!message.read && (
                    <button
                      onClick={() => markAsReadMutation.mutate(message.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {preferences.map((pref) => (
              <div key={pref.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {pref.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Via {pref.method},{' '}
                    {pref.advance > 0
                      ? `${pref.advance} minutes before`
                      : 'immediately'}
                  </p>
                </div>
                <div className="flex items-center">
                  <select
                    value={pref.method}
                    onChange={(e) =>
                      updatePreferenceMutation.mutate({
                        ...pref,
                        method: e.target.value as NotificationPreference['method'],
                      })
                    }
                    className="mr-4 text-sm border-gray-300 rounded-md"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="PUSH">Push</option>
                  </select>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pref.enabled}
                      onChange={(e) =>
                        updatePreferenceMutation.mutate({
                          ...pref,
                          enabled: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
