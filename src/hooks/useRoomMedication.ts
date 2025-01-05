/**
 * @fileoverview Room Medication Hook
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
import type { MedicationSchedule } from '@/types/global';

export function useRoomMedication(careHomeId: string) {
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

  const loadMedicationSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(
        `/care-homes/${careHomeId}/medication-schedules`,
        { headers: getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch medication schedules:', error);
      showToast('error', 'Failed to load medication schedules');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [careHomeId, getAuthHeaders, showToast]);

  const updateMedicationSchedule = useCallback(async (
    scheduleId: string,
    data: Partial<MedicationSchedule>
  ) => {
    try {
      if (!isOnline) {
        return await queueOfflineAction(
          'updateMedicationSchedule',
          {
            careHomeId,
            scheduleId,
            data,
          }
        );
      }

      const response = await apiClient.put(
        `/care-homes/${careHomeId}/medication-schedules/${scheduleId}`,
        data,
        { headers: getAuthHeaders() }
      );

      showToast('success', 'Medication schedule updated successfully');
      return response.data;
    } catch (error) {
      console.error('Failed to update medication schedule:', error);
      showToast('error', 'Failed to update medication schedule');
      throw error;
    }
  }, [careHomeId, isOnline, queueOfflineAction, getAuthHeaders, showToast]);

  const recordMedicationAdministration = useCallback(async (
    scheduleId: string,
    data: {
      administeredAt: Date;
      administeredBy: string;
      notes?: string;
    }
  ) => {
    try {
      if (!isOnline) {
        return await queueOfflineAction(
          'recordMedicationAdministration',
          {
            careHomeId,
            scheduleId,
            data,
          }
        );
      }

      const response = await apiClient.post(
        `/care-homes/${careHomeId}/medication-schedules/${scheduleId}/administrations`,
        data,
        { headers: getAuthHeaders() }
      );

      showToast('success', 'Medication administration recorded successfully');
      return response.data;
    } catch (error) {
      console.error('Failed to record medication administration:', error);
      showToast('error', 'Failed to record medication administration');
      throw error;
    }
  }, [careHomeId, isOnline, queueOfflineAction, getAuthHeaders, showToast]);

  return {
    isLoading,
    loadMedicationSchedules,
    updateMedicationSchedule,
    recordMedicationAdministration,
  };
}


