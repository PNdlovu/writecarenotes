import { useQuery } from '@tanstack/react-query'
import { MaintenanceStatus } from '../types'

export function useMaintenanceStatus() {
  return useQuery<MaintenanceStatus[]>({
    queryKey: ['maintenance-status'],
    queryFn: () => Promise.resolve([]), // TODO: Implement API call
  })
} 