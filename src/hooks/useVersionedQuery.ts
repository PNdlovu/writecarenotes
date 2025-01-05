import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api-client';
import { LATEST_API_VERSION, type ApiVersion } from '@/config/api-versions';

// Create API client instance
const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
});

interface UseVersionedQueryOptions<TData, TError> 
  extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  version?: ApiVersion;
}

export function useVersionedQuery<TData, TError = Error>(
  queryKey: string[],
  fetcher: (client: ApiClient) => Promise<TData>,
  options?: UseVersionedQueryOptions<TData, TError>
) {
  const { version = LATEST_API_VERSION, ...queryOptions } = options || {};

  return useQuery({
    queryKey: [version, ...queryKey],
    queryFn: () => fetcher(apiClient.upgradeToVersion(version)),
    ...queryOptions,
  });
}


