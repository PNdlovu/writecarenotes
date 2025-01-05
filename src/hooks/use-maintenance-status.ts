/**
 * WriteCareNotes.com
 * @fileoverview Maintenance Status Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export const useMaintenanceStatus = () => {
  return useQuery({
    queryKey: ['maintenance-status'],
    queryFn: async () => {
      const { data } = await api.get('/api/bed-management/maintenance')
      return data
    }
  })
} 