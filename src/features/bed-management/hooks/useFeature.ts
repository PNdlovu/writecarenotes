// src/features/bed-management/hooks/useFeature.ts

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { BedService } from '../services'
import type { Bed, BedOccupancyStats } from '../types/bed.types'
import type { ServiceContext } from '@/types/context'

export function useFeature() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [stats, setStats] = useState<BedOccupancyStats | null>(null)

  const getContext = useCallback((): ServiceContext => {
    if (!session?.user) {
      throw new Error('User session required')
    }
    return {
      userId: session.user.id,
      tenantId: session.user.tenantId,
      careHomeId: session.user.careHomeId,
      region: session.user.region,
      language: session.user.language
    }
  }, [session])

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const service = BedService.getInstance()
      const data = await service.getOccupancyStats(getContext())
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [getContext])

  return {
    stats,
    loading,
    error,
    fetchStats
  }
}


