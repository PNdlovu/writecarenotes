/**
 * @writecarenotes.com
 * @fileoverview Hook for managing territory data
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom hook for fetching and managing territory data, including boundaries,
 * staff assignments, and client coverage areas.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { territoryAPI } from '../../../../app/api/territory-api';
import type { Territory } from '@/features/territory/types';

export function useTerritory() {
  const queryClient = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ['territories'],
    queryFn: () => territoryAPI.getTerritories(),
  });

  const updateTerritory = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Territory> }) =>
      territoryAPI.updateTerritory(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
      queryClient.invalidateQueries({ queryKey: ['territories', id] });
    },
  });

  return {
    territories: data,
    updateTerritory: updateTerritory.mutate,
  };
}

export function useTerritoryById(id: string) {
  return useQuery({
    queryKey: ['territories', id],
    queryFn: () => territoryAPI.getTerritory(id),
  });
}

export function useCreateTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Territory, 'id'>) => territoryAPI.createTerritory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
    },
  });
}

export function useDeleteTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => territoryAPI.deleteTerritory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
    },
  });
} 