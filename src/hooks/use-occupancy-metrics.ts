/**
 * WriteCareNotes.com
 * @fileoverview Occupancy Metrics Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export const useOccupancyMetrics = () => {
  return useQuery({
    queryKey: ['occupancy-metrics'],
    queryFn: async () => {
      const { data } = await api.get('/api/bed-management/metrics')
      return data
    }
  })
} 