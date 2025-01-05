import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { BedAllocationService } from '../services'
import type { BedAllocationOptions, WaitlistEntry } from '../types/bed.types'
import { ValidationError } from '../types/errors'

export function useBedAllocation() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const findOptimalBed = useCallback(
    async (options: BedAllocationOptions) => {
      if (!session?.user) {
        throw new ValidationError('User session required')
      }

      setLoading(true)
      setError(null)

      try {
        const service = BedAllocationService.getInstance()
        const bed = await service.findOptimalBed(options, {
          userId: session.user.id,
          careHomeId: session.user.careHomeId,
          tenantId: session.user.tenantId,
          region: session.user.region,
          language: session.user.language
        })
        return bed
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [session]
  )

  const addToWaitlist = useCallback(
    async (residentId: string, options: Omit<WaitlistEntry, 'id' | 'status'>) => {
      if (!session?.user) {
        throw new ValidationError('User session required')
      }

      setLoading(true)
      setError(null)

      try {
        const service = BedAllocationService.getInstance()
        const entry = await service.addToWaitlist(residentId, options, {
          userId: session.user.id,
          careHomeId: session.user.careHomeId,
          tenantId: session.user.tenantId,
          region: session.user.region,
          language: session.user.language
        })
        return entry
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [session]
  )

  const processWaitlist = useCallback(async () => {
    if (!session?.user) {
      throw new ValidationError('User session required')
    }

    setLoading(true)
    setError(null)

    try {
      const service = BedAllocationService.getInstance()
      await service.processWaitlist({
        userId: session.user.id,
        careHomeId: session.user.careHomeId,
        tenantId: session.user.tenantId,
        region: session.user.region,
        language: session.user.language
      })
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [session])

  return {
    findOptimalBed,
    addToWaitlist,
    processWaitlist,
    loading,
    error
  }
}


