/**
 * @fileoverview Staffing Requirements Hook
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
import type { StaffRoster, StaffAssignment, StaffRequest } from '@/types/global';

interface StaffingRequirementsProps {
  careHomeId: string;
}

export function useStaffingRequirements(careHomeId: string) {
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

  const loadCurrentStaff = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(
        `/care-homes/${careHomeId}/staff-roster`,
        { headers: getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch staff roster:', error);
      showToast('error', 'Failed to load staff roster');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [careHomeId, getAuthHeaders, showToast]);

  const assignStaff = useCallback(async (assignment: Omit<StaffAssignment, 'careHomeId'>) => {
    try {
      if (!isOnline) {
        return await queueOfflineAction(
          'assignStaff',
          {
            careHomeId,
            assignment: {
              ...assignment,
              careHomeId,
            },
          }
        );
      }

      const response = await apiClient.post(
        `/care-homes/${careHomeId}/staff-assignments`,
        {
          ...assignment,
          careHomeId,
        },
        { headers: getAuthHeaders() }
      );

      showToast('success', 'Staff assigned successfully');
      await loadCurrentStaff();
      return response.data;
    } catch (error) {
      console.error('Failed to assign staff:', error);
      showToast('error', 'Failed to assign staff');
      throw error;
    }
  }, [careHomeId, isOnline, queueOfflineAction, getAuthHeaders, showToast, loadCurrentStaff]);

  const requestStaff = useCallback(async (request: Omit<StaffRequest, 'careHomeId'>) => {
    try {
      if (!isOnline) {
        return await queueOfflineAction(
          'requestStaff',
          {
            careHomeId,
            request: {
              ...request,
              careHomeId,
            },
          }
        );
      }

      const response = await apiClient.post(
        `/care-homes/${careHomeId}/staff-requests`,
        {
          ...request,
          careHomeId,
        },
        { headers: getAuthHeaders() }
      );

      showToast('success', 'Staff request submitted successfully');
      return response.data;
    } catch (error) {
      console.error('Failed to submit staff request:', error);
      showToast('error', 'Failed to submit staff request');
      throw error;
    }
  }, [careHomeId, isOnline, queueOfflineAction, getAuthHeaders, showToast]);

  return {
    isLoading,
    loadCurrentStaff,
    assignStaff,
    requestStaff,
  };
}


