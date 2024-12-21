import { useQuery } from '@tanstack/react-query'
import { BedStatus } from '../types'

export function useBedStatus() {
  return useQuery<BedStatus[]>({
    queryKey: ['bed-status'],
    queryFn: () => Promise.resolve([]), // TODO: Implement API call
  })
} 