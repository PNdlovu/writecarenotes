import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { BedMaintenanceService } from '../services'
import type { BedMaintenanceSchedule } from '../types/bed.types'
import { ValidationError } from '../types/errors'

export function useBedMaintenance() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const scheduleMaintenance = useCallback(
    async (bedId: string, schedule: BedMaintenanceSchedule) => {
      if (!session?.user) {
        throw new ValidationError('User session required')
      }

      setLoading(true)
      setError(null)

      try {
        const service = BedMaintenanceService.getInstance()
        const result = await service.scheduleMaintenance(bedId, schedule, {
          userId: session.user.id,
          careHomeId: session.user.careHomeId,
          tenantId: session.user.tenantId,
          region: session.user.region,
          language: session.user.language
        })
        return result
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [session]
  )

  const startMaintenance = useCallback(
    async (bedId: string) => {
      if (!session?.user) {
        throw new ValidationError('User session required')
      }

      setLoading(true)
      setError(null)

      try {
        const service = BedMaintenanceService.getInstance()
        const result = await service.startMaintenance(bedId, {
          userId: session.user.id,
          careHomeId: session.user.careHomeId,
          tenantId: session.user.tenantId,
          region: session.user.region,
          language: session.user.language
        })
        return result
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [session]
  )

  const completeMaintenance = useCallback(
    async (bedId: string, issues: string[], notes?: string) => {
      if (!session?.user) {
        throw new ValidationError('User session required')
      }

      setLoading(true)
      setError(null)

      try {
        const service = BedMaintenanceService.getInstance()
        const result = await service.completeMaintenance(bedId, issues, notes, {
          userId: session.user.id,
          careHomeId: session.user.careHomeId,
          tenantId: session.user.tenantId,
          region: session.user.region,
          language: session.user.language
        })
        return result
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
    scheduleMaintenance,
    startMaintenance,
    completeMaintenance,
    loading,
    error
  }
}


