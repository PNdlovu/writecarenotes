import { useQuery } from '@tanstack/react-query';

const fetchRegionalMetrics = async (region: string) => {
  const res = await fetch(`/api/regional-metrics?region=${region}`);
  if (!res.ok) {
    throw new Error('Failed to fetch regional metrics');
  }
  return res.json();
};

export function useRegionalMetrics(region: string) {
  return useQuery({
    queryKey: ['regionalMetrics', region],
    queryFn: () => fetchRegionalMetrics(region),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}


