import { useQuery } from '@tanstack/react-query'
import { OccupancyMetrics } from '../types'

export function useOccupancyMetrics() {
  return useQuery<OccupancyMetrics[]>({
    queryKey: ['occupancy-metrics'],
    queryFn: () => Promise.resolve([]), // TODO: Implement API call
  })
} 