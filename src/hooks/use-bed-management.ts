/**
 * WriteCareNotes.com
 * @fileoverview Bed Management Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export const useBedManagement = () => {
  return useQuery({
    queryKey: ['bed-management'],
    queryFn: async () => {
      const { data } = await api.get('/api/bed-management')
      return data
    }
  })
} 