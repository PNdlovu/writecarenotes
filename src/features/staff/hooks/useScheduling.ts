import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { StaffSchedule, ScheduleUpdate } from '../types';
import { scheduleSchema, scheduleUpdateSchema } from '../utils/validation';
import { CacheService } from '../services/cache-service';
import { scheduleAPI } from '@/features/schedule';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

export function useScheduling() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const startDate = new Date();
  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const {
    data: schedules,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['schedules', session?.user?.organizationId, startDate, endDate],
    queryFn: async () => {
      if (!session?.user?.organizationId) {
        throw new Error('No organization ID found');
      }

      // Try to get from cache first
      const cachedData = await CacheService.getStaffSchedules(
        session.user.organizationId,
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (cachedData) {
        return cachedData;
      }

      // If not in cache, fetch from API using scheduleAPI
      const data = await scheduleAPI.getShifts(startDate.toISOString(), endDate.toISOString());
      
      // Validate data
      const validatedData = z.array(scheduleSchema).parse(data);

      // Cache the validated data
      await CacheService.setStaffSchedules(
        session.user.organizationId,
        startDate.toISOString(),
        endDate.toISOString(),
        validatedData
      );

      return validatedData;
    },
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ scheduleId, updates }: { scheduleId: string; updates: ScheduleUpdate }) => {
      // Validate update data
      const validatedUpdates = scheduleUpdateSchema.parse(updates);

      const response = await fetch(`/api/staff/scheduling/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedUpdates),
      });

      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['schedules']);
      
      // Invalidate cache
      if (session?.user?.organizationId) {
        CacheService.invalidateStaffSchedules(session.user.organizationId);
      }
    },
  });

  const updateSchedule = (scheduleId: string, updates: ScheduleUpdate) => {
    return updateScheduleMutation.mutateAsync({ scheduleId, updates });
  };

  return {
    schedules,
    isLoading,
    isError,
    error,
    refetch,
    updateSchedule,
    isUpdating: updateScheduleMutation.isLoading,
    updateError: updateScheduleMutation.error,
  };
}
