import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HospitalPass, CreateHospitalPassInput, UpdateHospitalPassInput } from '../types/hospitalPass';
import { api } from '@/lib/api';

const QUERY_KEY = 'hospitalPasses';

export function useHospitalPasses(residentId: string) {
  const queryClient = useQueryClient();

  const { data: passes, isLoading, error } = useQuery<HospitalPass[]>({
    queryKey: [QUERY_KEY, residentId],
    queryFn: () => api.get(`/api/residents/${residentId}/hospital-passes`),
  });

  const createPass = useMutation({
    mutationFn: (input: CreateHospitalPassInput) =>
      api.post(`/api/residents/${residentId}/hospital-passes`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, residentId] });
    },
  });

  const updatePass = useMutation({
    mutationFn: (input: UpdateHospitalPassInput) =>
      api.patch(`/api/residents/${residentId}/hospital-passes/${input.id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, residentId] });
    },
  });

  const deletePass = useMutation({
    mutationFn: (passId: string) =>
      api.delete(`/api/residents/${residentId}/hospital-passes/${passId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, residentId] });
    },
  });

  return {
    passes,
    isLoading,
    error,
    createPass,
    updatePass,
    deletePass,
  };
}
