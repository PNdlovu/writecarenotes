// src/features/bed-management/hooks/useActions.ts

import { useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { BedService } from '../services'
import type { 
  Bed, 
  BedAllocationOptions, 
  BedTransferRequest, 
  BedMaintenanceSchedule 
} from '../types/bed.types'
import { ValidationError } from '../types/errors'

export function useActions() {
  const { data: session } = useSession()

  const getContext = useCallback(() => {
    if (!session?.user) {
      throw new ValidationError('User session required')
    }
    return {
      userId: session.user.id,
      tenantId: session.user.tenantId,
      careHomeId: session.user.careHomeId,
      region: session.user.region,
      language: session.user.language
    }
  }, [session])

  const allocateBed = useCallback(async (options: BedAllocationOptions) => {
    const service = BedService.getInstance()
    return await service.allocateBed(options, getContext())
  }, [getContext])

  const transferBed = useCallback(async (request: BedTransferRequest) => {
    const service = BedService.getInstance()
    return await service.transferBed(request, getContext())
  }, [getContext])

  const scheduleMaintenance = useCallback(async (schedule: BedMaintenanceSchedule) => {
    const service = BedService.getInstance()
    return await service.scheduleMaintenance(schedule, getContext())
  }, [getContext])

  const updateBed = useCallback(async (bedId: string, data: Partial<Bed>) => {
    const service = BedService.getInstance()
    return await service.updateBed(bedId, data, getContext())
  }, [getContext])

  return {
    allocateBed,
    transferBed,
    scheduleMaintenance,
    updateBed
  }
}


