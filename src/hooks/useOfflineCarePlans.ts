/**
 * @fileoverview Offline Care Plans Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/useToast';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { apiClient } from '@/lib/apiClient';
import type { CarePlan } from '@/types/global';

interface OfflineCarePlansProps {
  careHomeId: string;
}

export function useOfflineCarePlans({ careHomeId }: OfflineCarePlansProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const { isOnline, queueOfflineAction } = useOfflineSync();
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = useCallback(() => {
    return {
      Authorization: `Bearer ${session?.accessToken}`,
    };
  }, [session?.accessToken]);

  const loadCarePlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(
        `/care-homes/${careHomeId}/care-plans`,
        { headers: getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch care plans:', error);
      showToast('error', 'Failed to load care plans');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [careHomeId, getAuthHeaders, showToast]);

  const updateCarePlan = useCallback(async (
    planId: string,
    data: Partial<CarePlan>
  ) => {
    try {
      if (!isOnline) {
        return await queueOfflineAction(
          'updateCarePlan',
          {
            careHomeId,
            planId,
            data,
          }
        );
      }

      const response = await apiClient.put(
        `/care-homes/${careHomeId}/care-plans/${planId}`,
        data,
        { headers: getAuthHeaders() }
      );

      showToast('success', 'Care plan updated successfully');
      return response.data;
    } catch (error) {
      console.error('Failed to update care plan:', error);
      showToast('error', 'Failed to update care plan');
      throw error;
    }
  }, [careHomeId, isOnline, queueOfflineAction, getAuthHeaders, showToast]);

  const createCarePlan = useCallback(async (data: Partial<CarePlan>) => {
    try {
      if (!isOnline) {
        return await queueOfflineAction(
          'createCarePlan',
          {
            careHomeId,
            data,
          }
        );
      }

      const response = await apiClient.post(
        `/care-homes/${careHomeId}/care-plans`,
        data,
        { headers: getAuthHeaders() }
      );

      showToast('success', 'Care plan created successfully');
      return response.data;
    } catch (error) {
      console.error('Failed to create care plan:', error);
      showToast('error', 'Failed to create care plan');
      throw error;
    }
  }, [careHomeId, isOnline, queueOfflineAction, getAuthHeaders, showToast]);

  return {
    isLoading,
    loadCarePlans,
    updateCarePlan,
    createCarePlan,
  };
} 


