import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleAPI, ScheduleShift, ScheduleShiftWithStaff } from '../api/schedule-api';

export function useShifts(startDate: Date, endDate: Date) {
  return useQuery<ScheduleShiftWithStaff[]>({
    queryKey: ['shifts', startDate.toISOString(), endDate.toISOString()],
    queryFn: () => scheduleAPI.getShifts(startDate.toISOString(), endDate.toISOString()),
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shiftData: Omit<ScheduleShift, 'id'>) => scheduleAPI.createShift(shiftData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}
