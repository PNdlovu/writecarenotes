/**
 * @fileoverview Medications Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { useQuery, useQueryClient, useMutation, useOnlineStatus } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import type { Medication, CreateMedicationDTO, UpdateMedicationDTO } from '../types';
import { medicationService } from '../services/medicationService';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { toast } from '../components/Toast';
import { captureError } from '../utils/errorHandling';

interface UseMedicationsProps {
  tenantId: string;
  careHomeId: string;
  residentId?: string;
  type?: 'REGULAR' | 'PRN' | 'CONTROLLED';
}

interface UseMedicationsResult {
  medications: Medication[];
  addMedication: (newMedication: CreateMedicationDTO) => Promise<Medication>;
  updateMedication: (update: { id: string; data: UpdateMedicationDTO }) => Promise<Medication>;
  isLoading: boolean;
  isError: boolean;
  isOffline: boolean;
  error: Error | null;
  pendingSync: boolean;
}

async function fetchMedications({
  tenantId,
  careHomeId,
  residentId,
  type,
}: UseMedicationsProps): Promise<Medication[]> {
  const params = new URLSearchParams({
    tenantId,
    careHomeId,
    ...(residentId && { residentId }),
    ...(type && { type }),
  });

  const response = await fetch(`/api/medications?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch medications');
  }

  return response.json();
}

export function useMedications({
  tenantId,
  careHomeId,
  residentId,
  type,
}: UseMedicationsProps): UseMedicationsResult {
  const queryClient = useQueryClient();
  const [offlineQueue, setOfflineQueue] = useState<Array<PendingOperation>>([]);

  // Network status
  const isOnline = useOnlineStatus();
  const { addToQueue, processQueue } = useOfflineSync();

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['medications', tenantId, careHomeId, residentId, type],
    queryFn: () => fetchMedications({ tenantId, careHomeId, residentId, type }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
  });

  const addMedication = useMutation({
    mutationFn: async (newMedication: CreateMedicationDTO) => {
      if (!isOnline) {
        // Store in IndexedDB and queue for sync
        const tempId = `temp_${Date.now()}`;
        await addToQueue({
          type: 'CREATE',
          resource: 'medication',
          data: newMedication,
          tempId,
        });
        return { ...newMedication, id: tempId, status: 'PENDING_SYNC' };
      }
      return medicationService.createMedication(newMedication, tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medications', tenantId]);
    },
    onError: (error) => {
      toast.error('Failed to add medication. Will retry when online.');
      captureError(error);
    },
  });

  const updateMedication = useMutation({
    mutationFn: async (update: { id: string; data: UpdateMedicationDTO }) => {
      if (!isOnline) {
        await addToQueue({
          type: 'UPDATE',
          resource: 'medication',
          resourceId: update.id,
          data: update.data,
        });
        return { ...update.data, status: 'PENDING_SYNC' };
      }
      return medicationService.updateMedication(update.id, update.data, tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medications', tenantId]);
    },
    onError: (error) => {
      toast.error('Failed to update medication. Will retry when online.');
      captureError(error);
    },
  });

  // Process offline queue when coming back online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      processQueue().catch(captureError);
    }
  }, [isOnline, offlineQueue]);

  return {
    medications: data,
    addMedication,
    updateMedication,
    isLoading,
    isError,
    isOffline: !isOnline,
    error: error as Error | null,
    pendingSync: offlineQueue.length > 0,
  };
}


