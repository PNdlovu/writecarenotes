// src/features/carehome/hooks/useResidentManagement.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { useTenantContext } from '@/contexts/TenantContext';
import { useRegion } from '@/hooks/useRegion';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';
import ResidentService from '../services/ResidentService';
import type { Resident, ResidentStatus } from '../types/resident';
import type { CareLevel } from '../types/care';

interface UseResidentManagementReturn {
  residents: Resident[];
  filteredResidents: Resident[];
  selectedResident: Resident | null;
  isLoading: boolean;
  error: Error | null;
  setStatusFilter: (status: ResidentStatus | 'ALL') => void;
  setSearchQuery: (query: string) => void;
  selectResident: (id: string) => void;
  admitResident: (data: Omit<Resident, 'id'>) => Promise<void>;
  updateResident: (id: string, data: Partial<Resident>) => Promise<void>;
  dischargeResident: (id: string, reason: string) => Promise<void>;
}

export function useResidentManagement(
  careHomeId: string
): UseResidentManagementReturn {
  const [statusFilter, setStatusFilter] = useState<ResidentStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { tenant } = useTenantContext();
  const { region } = useRegion();
  const { isOnline, syncStatus } = useOfflineSupport();

  // Fetch residents
  const {
    data: residents = [],
    isLoading,
    error,
  } = useQuery(
    ['residents', careHomeId, statusFilter],
    async () => {
      // Handle offline scenario
      if (!isOnline) {
        const offlineData = await syncStatus.getOfflineData('residents', careHomeId);
        if (offlineData) {
          return offlineData.residents;
        }
      }

      // Online fetch
      if (statusFilter === 'ALL') {
        const allStatuses = Object.values(ResidentStatus);
        const residentsPromises = allStatuses.map(status =>
          ResidentService.getResidentsByStatus(careHomeId, status)
        );
        const residentsArrays = await Promise.all(residentsPromises);
        return residentsArrays.flat();
      }
      return ResidentService.getResidentsByStatus(careHomeId, statusFilter);
    },
    {
      staleTime: 30000, // 30 seconds
      cacheTime: 3600000, // 1 hour
    }
  );

  // Filter residents based on search query
  const filteredResidents = residents.filter(resident => {
    const searchString = `${resident.firstName} ${resident.lastName}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  // Admit new resident
  const { mutateAsync: admitResident } = useMutation(
    async (data: Omit<Resident, 'id'>) => {
      const newResident = await ResidentService.admitResident(data);
      showToast({
        title: 'Success',
        description: 'New resident admitted successfully',
        type: 'success',
      });
      return newResident;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['residents', careHomeId]);
      },
      onError: (error: Error) => {
        showToast({
          title: 'Error',
          description: `Failed to admit resident: ${error.message}`,
          type: 'error',
        });
      },
    }
  );

  // Update resident
  const { mutateAsync: updateResident } = useMutation(
    async ({ id, data }: { id: string; data: Partial<Resident> }) => {
      const updated = await ResidentService.updateResident(id, data);
      showToast({
        title: 'Success',
        description: 'Resident updated successfully',
        type: 'success',
      });
      return updated;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['residents', careHomeId]);
      },
      onError: (error: Error) => {
        showToast({
          title: 'Error',
          description: `Failed to update resident: ${error.message}`,
          type: 'error',
        });
      },
    }
  );

  // Discharge resident
  const { mutateAsync: dischargeResident } = useMutation(
    async ({ id, reason }: { id: string; reason: string }) => {
      const discharged = await ResidentService.dischargeResident(id, reason, new Date());
      showToast({
        title: 'Success',
        description: 'Resident discharged successfully',
        type: 'success',
      });
      return discharged;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['residents', careHomeId]);
      },
      onError: (error: Error) => {
        showToast({
          title: 'Error',
          description: `Failed to discharge resident: ${error.message}`,
          type: 'error',
        });
      },
    }
  );

  // Select resident
  const selectResident = useCallback(async (id: string) => {
    const resident = await ResidentService.getResident(id);
    setSelectedResident(resident);
  }, []);

  return {
    residents,
    filteredResidents,
    selectedResident,
    isLoading,
    error,
    setStatusFilter,
    setSearchQuery,
    selectResident,
    admitResident: async (data) => {
      await admitResident(data);
    },
    updateResident: async (id, data) => {
      await updateResident({ id, data });
    },
    dischargeResident: async (id, reason) => {
      await dischargeResident({ id, reason });
    },
  };
}
