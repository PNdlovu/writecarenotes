/**
 * @writecarenotes.com
 * @fileoverview Hook for managing medication schedules with offline support
 * @version 1.0.0
 * @created 2024-01-07
 * @updated 2024-01-07
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Enterprise-grade hook for medication schedule management with
 * offline support, caching, error handling, and regional compliance.
 */

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfDay, endOfDay, format } from 'date-fns';
import { useToast } from '@/components/ui/UseToast';
import { useOfflineSync } from '@/lib/offline/hooks/useOfflineSync';
import { useRegionalSettings } from '@/hooks/useRegionalSettings';
import type { MedicationScheduleItem, MedicationError } from '../types';
import type { Region } from '@/types/region';

interface UseScheduleOptions {
  enableOfflineSupport?: boolean;
  cacheTime?: number;
  staleTime?: number;
  retryAttempts?: number;
}

const DEFAULT_OPTIONS: UseScheduleOptions = {
  enableOfflineSupport: true,
  cacheTime: 1000 * 60 * 30, // 30 minutes
  staleTime: 1000 * 60 * 5, // 5 minutes
  retryAttempts: 3,
};

export function useSchedule(
  residentId: string,
  date: Date = new Date(),
  region: Region = 'england',
  options: UseScheduleOptions = {}
) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useRegionalSettings(region);
  const { isOnline, syncData } = useOfflineSync();
  const [localSchedule, setLocalSchedule] = useState<MedicationScheduleItem[]>([]);

  // Query key for this schedule
  const queryKey = ['medicationSchedule', residentId, format(date, 'yyyy-MM-dd')];

  // Fetch schedule from API
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await fetch('/api/medications/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            residentId,
            startDate: startOfDay(date).toISOString(),
            endDate: endOfDay(date).toISOString(),
            region,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch medication schedule');
        }

        const data = await response.json();
        return data as MedicationScheduleItem[];
      } catch (error) {
        const medicationError: MedicationError = {
          code: 'SCHEDULE_FETCH_ERROR',
          message: 'Failed to fetch medication schedule',
          timestamp: new Date().toISOString(),
          details: error instanceof Error ? error.message : 'Unknown error',
        };
        throw medicationError;
      }
    },
    retry: mergedOptions.retryAttempts,
    cacheTime: mergedOptions.cacheTime,
    staleTime: mergedOptions.staleTime,
    onError: (error: MedicationError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle offline storage and sync
  useEffect(() => {
    if (mergedOptions.enableOfflineSupport && !isOnline && data) {
      localStorage.setItem(
        `medication_schedule_${residentId}_${format(date, 'yyyy-MM-dd')}`,
        JSON.stringify(data)
      );
    }
  }, [isOnline, data, residentId, date, mergedOptions.enableOfflineSupport]);

  // Load from offline storage when offline
  useEffect(() => {
    if (mergedOptions.enableOfflineSupport && !isOnline) {
      const storedData = localStorage.getItem(
        `medication_schedule_${residentId}_${format(date, 'yyyy-MM-dd')}`
      );
      if (storedData) {
        setLocalSchedule(JSON.parse(storedData));
      }
    }
  }, [isOnline, residentId, date, mergedOptions.enableOfflineSupport]);

  // Sync offline changes when back online
  useEffect(() => {
    if (mergedOptions.enableOfflineSupport && isOnline) {
      syncOfflineChanges();
    }
  }, [isOnline]);

  const syncOfflineChanges = async () => {
    if (!mergedOptions.enableOfflineSupport) return;

    try {
      const offlineChanges = await syncData('medication_schedules');
      if (offlineChanges) {
        queryClient.invalidateQueries(queryKey);
      }
    } catch (error) {
      toast({
        title: 'Sync Error',
        description: 'Failed to sync offline changes',
        variant: 'destructive',
      });
    }
  };

  // Prefetch next day's schedule
  const prefetchNextDay = async () => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    await queryClient.prefetchQuery({
      queryKey: ['medicationSchedule', residentId, format(nextDay, 'yyyy-MM-dd')],
      queryFn: () => fetch('/api/medications/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          residentId,
          startDate: startOfDay(nextDay).toISOString(),
          endDate: endOfDay(nextDay).toISOString(),
          region,
        }),
      }).then(res => res.json()),
    });
  };

  return {
    schedule: !isOnline ? localSchedule : data || [],
    isLoading,
    error,
    refetch,
    prefetchNextDay,
    isOffline: !isOnline,
    syncOfflineChanges,
  };
} 