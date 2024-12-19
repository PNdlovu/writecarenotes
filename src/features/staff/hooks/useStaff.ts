import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffAPI } from '../api/staff-api';
import { StaffMember } from '../types';

export function useStaffMembers() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: () => staffAPI.getStaffMembers(),
  });
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: () => staffAPI.getStaffMember(id),
  });
}

export function useCreateStaffMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<StaffMember, 'id'>) => staffAPI.createStaffMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useUpdateStaffMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StaffMember> }) => 
      staffAPI.updateStaffMember(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff', id] });
    },
  });
}

export function useDeleteStaffMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffAPI.deleteStaffMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}


