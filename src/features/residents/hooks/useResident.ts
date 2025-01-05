import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Resident, ResidentCreateDTO, ResidentUpdateDTO } from '../types';
import { apiClient } from '@/lib/api/apiClient';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from 'next-i18next';
import { useOffline } from '@/hooks/useOffline';

export function useResidents(filters?: Record<string, any>) {
  return useQuery<Resident[]>({
    queryKey: ['residents', filters],
    queryFn: () => apiClient.get('/api/residents', { params: filters }),
  });
}

export function useResident(id: string) {
  return useQuery<Resident>({
    queryKey: ['resident', id],
    queryFn: () => apiClient.get(`/api/residents/${id}`),
    enabled: !!id,
  });
}

export function useCreateResident() {
  const queryClient = useQueryClient();

  return useMutation<Resident, Error, ResidentCreateDTO>({
    mutationFn: (data) => apiClient.post('/api/residents', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
    },
  });
}

export function useUpdateResident() {
  const queryClient = useQueryClient();

  return useMutation<Resident, Error, { id: string; data: ResidentUpdateDTO }>({
    mutationFn: ({ id, data }) => apiClient.patch(`/api/residents/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['resident', variables.id] });
    },
  });
}


