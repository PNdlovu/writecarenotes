/**
 * @fileoverview Hook for managing calendar events with platform-aware features
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useOfflineSync } from './use-offline-sync';
import { useNetwork } from './use-network';
import { getCurrentPlatform, canUseFeature } from '@/utils/platform';
import type { CalendarEvent, CreateEventData, UpdateEventData } from '@/types/calendar';
import type { Platform } from '@/utils/platform';

interface UseCalendarOptions {
  enableOfflineSync?: boolean;
  enableBackgroundSync?: boolean;
  enablePushNotifications?: boolean;
}

const MODULE_NAME = 'calendar';

export function useCalendar(options: UseCalendarOptions = {}) {
  const {
    enableOfflineSync = true,
    enableBackgroundSync = true,
    enablePushNotifications = true,
  } = options;

  const queryClient = useQueryClient();
  const { isOnline } = useNetwork();
  const [platform] = useState<Platform>(getCurrentPlatform());
  const { queueOfflineAction, syncOfflineActions, getPendingActions } = useOfflineSync(MODULE_NAME);
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);

  // Feature flags based on platform capabilities
  const canUseOffline = enableOfflineSync && canUseFeature('canUseOfflineStorage');
  const canUseBackgroundSync = enableBackgroundSync && canUseFeature('canUseBackgroundSync');
  const canUsePush = enablePushNotifications && canUseFeature('canUsePushNotifications');

  // Sync offline actions when coming back online
  useEffect(() => {
    if (isOnline && canUseOffline && canUseBackgroundSync) {
      syncOfflineActions();
    }
  }, [isOnline, canUseOffline, canUseBackgroundSync, syncOfflineActions]);

  // Load pending offline actions
  useEffect(() => {
    const loadPendingActions = async () => {
      if (!canUseOffline) return;
      
      const actions = await getPendingActions();
      const events = actions
        .filter(action => action.type !== 'delete')
        .map(action => action.data as CalendarEvent);
      setLocalEvents(events);
    };

    if (!isOnline) {
      loadPendingActions();
    }
  }, [isOnline, canUseOffline, getPendingActions]);

  // Fetch events from the API
  const { data: remoteEvents = [], isLoading, error } = useQuery({
    queryKey: ['calendar', 'events', platform],
    queryFn: () => apiClient.get<CalendarEvent[]>('/calendar/events'),
    enabled: isOnline,
  });

  // Combine remote and local events
  const events = isOnline ? remoteEvents : (canUseOffline ? [...remoteEvents, ...localEvents] : remoteEvents);

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateEventData) => {
      if (!isOnline && canUseOffline) {
        const event: CalendarEvent = {
          id: crypto.randomUUID(),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await queueOfflineAction('create', event);
        setLocalEvents(prev => [...prev, event]);
        return event;
      }
      return apiClient.post<CalendarEvent>('/calendar/events', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events', platform] });
    },
  });

  // Update event mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEventData }) => {
      if (!isOnline && canUseOffline) {
        const event = events.find(e => e.id === id);
        if (!event) throw new Error('Event not found');
        const updatedEvent: CalendarEvent = {
          ...event,
          ...data,
          updatedAt: new Date().toISOString(),
        };
        await queueOfflineAction('update', updatedEvent);
        setLocalEvents(prev => prev.map(e => (e.id === id ? updatedEvent : e)));
        return updatedEvent;
      }
      return apiClient.patch<CalendarEvent>(`/calendar/events/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events', platform] });
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isOnline && canUseOffline) {
        await queueOfflineAction('delete', { id });
        setLocalEvents(prev => prev.filter(e => e.id !== id));
        return;
      }
      return apiClient.delete(`/calendar/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events', platform] });
    },
  });

  const createEvent = useCallback(
    (data: CreateEventData) => createMutation.mutate(data),
    [createMutation]
  );

  const updateEvent = useCallback(
    (id: string, data: UpdateEventData) => updateMutation.mutate({ id, data }),
    [updateMutation]
  );

  const deleteEvent = useCallback(
    (id: string) => deleteMutation.mutate(id),
    [deleteMutation]
  );

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    isOnline,
    platform,
    features: {
      offlineSync: canUseOffline,
      backgroundSync: canUseBackgroundSync,
      pushNotifications: canUsePush,
    },
  };
} 