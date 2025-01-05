import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { BedAnalyticsService } from '../services'
import { ValidationError } from '../types/errors'
import { ANALYTICS } from '../constants'

export function useBedAnalytics() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const getOccupancyStats = useCallback(
    async (startDate: Date, endDate: Date) => {
      if (!session?.user) {
        throw new ValidationError('User session required')
      }

      // Validate date range
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff > ANALYTICS.MAX_DATE_RANGE_DAYS) {
        throw new ValidationError(`Date range cannot exceed ${ANALYTICS.MAX_DATE_RANGE_DAYS} days`)
      }

      setLoading(true)
      setError(null)

      try {
        const service = BedAnalyticsService.getInstance()
        const stats = await service.getOccupancyStats(startDate, endDate, {
          userId: session.user.id,
          careHomeId: session.user.careHomeId,
          tenantId: session.user.tenantId,
          region: session.user.region,
          language: session.user.language
        })
        return stats
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [session]
  )

  const getMaintenanceStats = useCallback(
    async (startDate: Date, endDate: Date) => {
      if (!session?.user) {
        throw new ValidationError('User session required')
      }

      setLoading(true)
      setError(null)

      try {
        const service = BedAnalyticsService.getInstance()
        const stats = await service.getMaintenanceStats(startDate, endDate, {
          userId: session.user.id,
          careHomeId: session.user.careHomeId,
          tenantId: session.user.tenantId,
          region: session.user.region,
          language: session.user.language
        })
        return stats
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [session]
  )

  const getTransferStats = useCallback(
    async (startDate: Date, endDate: Date) => {
      if (!session?.user) {
        throw new ValidationError('User session required')
      }

      setLoading(true)
      setError(null)

      try {
        const service = BedAnalyticsService.getInstance()
        const stats = await service.getTransferStats(startDate, endDate, {
          userId: session.user.id,
          careHomeId: session.user.careHomeId,
          tenantId: session.user.tenantId,
          region: session.user.region,
          language: session.user.language
        })
        return stats
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [session]
  )

  return {
    getOccupancyStats,
    getMaintenanceStats,
    getTransferStats,
    loading,
    error
  }
}


