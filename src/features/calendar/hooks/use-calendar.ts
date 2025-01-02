/**
 * @fileoverview React hook for managing calendar events
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { useNetwork } from '@/hooks/use-network';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import type { CalendarEvent, CreateEventData } from '@/app/api/calendar/types';
import type { ApiError, ValidationError } from '@/lib/errors';

interface UseCalendarOptions {
  autoSync?: boolean;
  syncInterval?: number;
  pageSize?: number;
}

export function useCalendar(options: UseCalendarOptions = {}) {
  const { autoSync = true, syncInterval = 30000, pageSize = 20 } = options;
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { t } = useTranslation('calendar');
  const { isOnline } = useNetwork();
  const { showToast } = useToast();
  const { 
    queueOfflineAction,
    syncOfflineActions,
    getPendingActions 
  } = useOfflineSync('calendar');
  
  const abortControllerRef = useRef<AbortController>();
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup function
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // Auto sync when online
  useEffect(() => {
    if (isOnline && autoSync) {
      const syncPending = async () => {
        try {
          await syncOfflineActions();
          await fetchEvents();
        } catch (err) {
          console.error('Sync failed:', err);
        }
        
        syncTimeoutRef.current = setTimeout(syncPending, syncInterval);
      };

      syncPending();
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [isOnline, autoSync, syncInterval]);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof ValidationError) {
      showToast({
        type: 'error',
        title: t('error.validation.title'),
        description: Object.values(error.errors).flat().join(', '),
      });
    } else if (error instanceof ApiError) {
      showToast({
        type: 'error',
        title: t('error.api.title'),
        description: error.message,
      });
    } else {
      showToast({
        type: 'error',
        title: t('error.unknown.title'),
        description: t('error.unknown.description'),
      });
    }
    setError(error as Error);
  }, [t, showToast]);

  const fetchEvents = async (params?: { startDate?: string; endDate?: string }) => {
    try {
      setIsLoading(true);
      setError(null);

      // Cancel previous request if any
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.append('startDate', params.startDate);
      if (params?.endDate) searchParams.append('endDate', params.endDate);
      searchParams.append('page', String(page));
      searchParams.append('limit', String(pageSize));

      const { data, meta } = await apiClient.get<CalendarEvent[]>(
        `/calendar?${searchParams.toString()}`,
        { signal: abortControllerRef.current.signal }
      );

      setEvents(prev => (page === 1 ? data : [...prev, ...data]));
      setHasMore(Boolean(meta?.total && meta.total > page * pageSize));
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (data: CreateEventData) => {
    try {
      setError(null);

      if (!isOnline) {
        const offlineEvent = await queueOfflineAction('create', data);
        setEvents(prev => [...prev, offlineEvent]);
        showToast({
          type: 'info',
          title: t('offline.created.title'),
          description: t('offline.created.description'),
        });
        return offlineEvent;
      }

      const { data: newEvent } = await apiClient.post<CalendarEvent>('/calendar', data);
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const updateEvent = async (id: string, data: Partial<CalendarEvent>) => {
    try {
      setError(null);

      if (!isOnline) {
        const offlineEvent = await queueOfflineAction('update', { id, ...data });
        setEvents(prev => prev.map(event => event.id === id ? { ...event, ...offlineEvent } : event));
        showToast({
          type: 'info',
          title: t('offline.updated.title'),
          description: t('offline.updated.description'),
        });
        return offlineEvent;
      }

      const { data: updatedEvent } = await apiClient.patch<CalendarEvent>(`/calendar/${id}`, data);
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
      return updatedEvent;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      setError(null);

      if (!isOnline) {
        await queueOfflineAction('delete', { id });
        setEvents(prev => prev.filter(event => event.id !== id));
        showToast({
          type: 'info',
          title: t('offline.deleted.title'),
          description: t('offline.deleted.description'),
        });
        return;
      }

      await apiClient.delete(`/calendar/${id}`);
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const refresh = () => {
    setPage(1);
    return fetchEvents();
  };

  return {
    events,
    isLoading,
    error,
    hasMore,
    isOnline,
    pendingActions: getPendingActions(),
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    loadMore,
    refresh,
  };
}
