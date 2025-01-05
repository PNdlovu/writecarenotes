// src/features/carehome/hooks/useStaffPerformance.ts
import { useQuery } from '@tanstack/react-query';
import { fetchStaffPerformance } from '../api';

interface StaffPerformance {
  id: string;
  name: string;
  role: string;
  department: string;
  metrics: {
    attendance: number;
    taskCompletion: number;
    residentSatisfaction: number;
    trainingCompliance: number;
  };
  trends: {
    period: string;
    score: number;
  }[];
}

export function useStaffPerformance(careHomeId: string) {
  return useQuery<StaffPerformance[], Error>({
    queryKey: ['staffPerformance', careHomeId],
    queryFn: () => fetchStaffPerformance(careHomeId),
  });
}


