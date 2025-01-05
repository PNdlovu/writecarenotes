/**
 * @fileoverview Staff Management Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/useToast';
import { useOffline } from '@/hooks/useOffline';
import { apiClient } from '@/lib/apiClient';
import type { Staff, Department, StaffFilters } from '@/types/global';

export const useStaffManagement = (careHomeId: string) => {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const { isOnline, queueOfflineAction } = useOfflineSync();
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = useCallback(() => {
    return {
      Authorization: `Bearer ${session?.accessToken}`,
    };
  }, [session?.accessToken]);

  const listStaff = useCallback(async (
    filters: StaffFilters,
    page: number = 1,
    limit: number = 10
  ) => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(
        `/care-homes/${careHomeId}/staff`,
        {
          params: {
            ...filters,
            page,
            limit,
          },
          headers: getAuthHeaders(),
        }
      );

      const deptResponse = await apiClient.get(
        `/care-homes/${careHomeId}/departments`,
        { headers: getAuthHeaders() }
      );

      return {
        staff: response.data.staff as Staff[],
        departments: deptResponse.data as Department[],
        total: response.data.total,
      };
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      showToast('error', 'Failed to load staff data');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [careHomeId, getAuthHeaders, showToast]);

  const createStaff = useCallback(async (data: Partial<Staff>) => {
    try {
      if (!isOnline) {
        return await queueOfflineAction(
          'createStaff',
          { careHomeId, data }
        );
      }

      const response = await apiClient.post(
        `/care-homes/${careHomeId}/staff`,
        data,
        { headers: getAuthHeaders() }
      );

      showToast('success', 'Staff member created successfully');
      return response.data as Staff;
    } catch (error) {
      console.error('Failed to create staff:', error);
      showToast('error', 'Failed to create staff member');
      throw error;
    }
  }, [careHomeId, isOnline, queueOfflineAction, getAuthHeaders, showToast]);

  const updateStaff = useCallback(async (staffId: string, data: Partial<Staff>) => {
    try {
      if (!isOnline) {
        return await queueOfflineAction(
          'updateStaff',
          { careHomeId, staffId, data }
        );
      }

      const response = await apiClient.put(
        `/care-homes/${careHomeId}/staff/${staffId}`,
        data,
        { headers: getAuthHeaders() }
      );

      showToast('success', 'Staff member updated successfully');
      return response.data as Staff;
    } catch (error) {
      console.error('Failed to update staff:', error);
      showToast('error', 'Failed to update staff member');
      throw error;
    }
  }, [careHomeId, isOnline, queueOfflineAction, getAuthHeaders, showToast]);

  const deleteStaff = useCallback(async (staffId: string) => {
    try {
      if (!isOnline) {
        return await queueOfflineAction(
          'deleteStaff',
          { careHomeId, staffId }
        );
      }

      await apiClient.delete(
        `/care-homes/${careHomeId}/staff/${staffId}`,
        { headers: getAuthHeaders() }
      );

      showToast('success', 'Staff member deleted successfully');
    } catch (error) {
      console.error('Failed to delete staff:', error);
      showToast('error', 'Failed to delete staff member');
      throw error;
    }
  }, [careHomeId, isOnline, queueOfflineAction, getAuthHeaders, showToast]);

  return {
    isLoading,
    listStaff,
    createStaff,
    updateStaff,
    deleteStaff,
  };
};


