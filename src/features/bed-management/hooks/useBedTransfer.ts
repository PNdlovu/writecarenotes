import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { BedTransferService } from '../services'
import type { BedTransferRequest } from '../types/bed.types'
import { ValidationError } from '../types/errors'

export function useBedTransfer() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const requestTransfer = useCallback(
    async (sourceBedId: string, targetBedId: string, reason: string, notes?: string) => {
      if (!session?.user) {
        throw new ValidationError('User session required')
      }

      setLoading(true)
      setError(null)

      try {
        const service = BedTransferService.getInstance()
        const result = await service.requestTransfer(
          sourceBedId,
          targetBedId,
          reason,
          notes,
          {
            userId: session.user.id,
            careHomeId: session.user.careHomeId,
            tenantId: session.user.tenantId,
            region: session.user.region,
            language: session.user.language
          }
        )
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

  const approveTransfer = useCallback(
    async (transferId: string, notes?: string) => {
      if (!session?.user) {
        throw new ValidationError('User session required')
      }

      setLoading(true)
      setError(null)

      try {
        const service = BedTransferService.getInstance()
        const result = await service.approveTransfer(transferId, notes, {
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

  const executeTransfer = useCallback(
    async (transferId: string) => {
      if (!session?.user) {
        throw new ValidationError('User session required')
      }

      setLoading(true)
      setError(null)

      try {
        const service = BedTransferService.getInstance()
        const result = await service.executeTransfer(transferId, {
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
    requestTransfer,
    approveTransfer,
    executeTransfer,
    loading,
    error
  }
}


