// src/features/carehome/hooks/useCareHomeData.ts
import { useQuery } from '@tanstack/react-query';
import type { CareHome } from '../types';
import { fetchCareHomeData } from '../api';

export function useCareHomeData(careHomeId: string) {
  return useQuery<CareHome, Error>({
    queryKey: ['careHome', careHomeId],
    queryFn: () => fetchCareHomeData(careHomeId),
  });
}


