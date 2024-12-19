/**
 * @fileoverview Visitor Management Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/useToast';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useFloorPlan } from '@/hooks/useFloorPlan';
import { apiClient } from '@/lib/apiClient';
import type { VisitorSchedule } from '@/types/global';

interface VisitorManagementProps {
  careHomeId: string;
}

export function useVisitorManagement(careHomeId: string) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const { isOnline, queueOfflineAction } = useOfflineSync();
  const { floorPlan } = useFloorPlan({ careHomeId });
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = useCallback(() => {
    return {
      Authorization: `Bearer ${session?.accessToken}`,
    };
  }, [session?.accessToken]);

  const loadVisitorSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(
        `/care-homes/${careHomeId}/visitor-schedules`,
        { headers: getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch visitor schedules:', error);
      showToast('error', 'Failed to load visitor schedules');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [careHomeId, getAuthHeaders, showToast]);

  const scheduleVisit = useCallback(async (schedule: Omit<VisitorSchedule, 'careHomeId'>) => {
    try {
      if (!floorPlan || !session) return null;

      if (!isOnline) {
        return await queueOfflineAction(
          'scheduleVisit',
          {
            careHomeId,
            schedule: {
              ...schedule,
              careHomeId,
            },
          }
        );
      }

      const response = await apiClient.post(
        `/care-homes/${careHomeId}/visitor-schedules`,
        {
          ...schedule,
          careHomeId,
        },
        { headers: getAuthHeaders() }
      );

      showToast('success', 'Visit scheduled successfully');
      return response.data;
    } catch (error) {
      console.error('Failed to schedule visit:', error);
      showToast('error', 'Failed to schedule visit');
      throw error;
    }
  }, [careHomeId, floorPlan, isOnline, queueOfflineAction, session, getAuthHeaders, showToast]);

  const checkInVisitor = useCallback(async (scheduleId: string) => {
    try {
      if (!isOnline) {
        return await queueOfflineAction(
          'checkInVisitor',
          { careHomeId, scheduleId }
        );
      }

      const response = await apiClient.post(
        `/care-homes/${careHomeId}/visitor-schedules/${scheduleId}/checkin`,
        {},
        { headers: getAuthHeaders() }
      );

      showToast('success', 'Visitor checked in successfully');
      await loadVisitorSchedules();
      return response.data;
    } catch (error) {
      console.error('Failed to check in visitor:', error);
      showToast('error', 'Failed to check in visitor');
      throw error;
    }
  }, [careHomeId, isOnline, queueOfflineAction, getAuthHeaders, showToast, loadVisitorSchedules]);

  return {
    isLoading,
    loadVisitorSchedules,
    scheduleVisit,
    checkInVisitor,
  };
}


