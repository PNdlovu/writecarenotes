/**
 * @writecarenotes.com
 * @fileoverview Hook for managing visit data
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom hook for fetching and managing visit data, including scheduling,
 * assignment, and status updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitsAPI } from '../api/visits-api';
import type { Visit } from '../types';

export function useVisits() {
  const { data = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: () => visitsAPI.getVisits(),
  });

  return {
    visits: data
  };
}

export function useVisit(id: string) {
  return useQuery({
    queryKey: ['visits', id],
    queryFn: () => visitsAPI.getVisit(id),
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Visit, 'id'>) => visitsAPI.createVisit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}

export function useUpdateVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Visit> }) =>
      visitsAPI.updateVisit(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['visits', id] });
    },
  });
}

export function useDeleteVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => visitsAPI.deleteVisit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
} 