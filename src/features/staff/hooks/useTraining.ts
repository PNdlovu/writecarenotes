import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingAPI } from '../api/training-api';
import { Training } from '../types';

export function useTrainings() {
  return useQuery({
    queryKey: ['trainings'],
    queryFn: () => trainingAPI.getTrainings(),
  });
}

export function useTraining(id: string) {
  return useQuery({
    queryKey: ['trainings', id],
    queryFn: () => trainingAPI.getTraining(id),
  });
}

export function useCreateTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Training, 'id'>) => trainingAPI.createTraining(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
}

export function useAssignTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trainingAPI.assignTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
}

export function useUpdateTrainingProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      trainingAPI.updateTrainingProgress(id, progress),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['trainings', id] });
    },
  });
}


