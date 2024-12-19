// src/features/bed-management/api/[bedId]/maintenance/route.ts

import { z } from 'zod'
import { validateRequest } from '@/lib/api'
import { handleError } from '@/lib/errors'
import type { NextRequest } from 'next/server'
import { BedMaintenanceService } from '../../../services'
import { bedMaintenanceSchema } from '../../validation'

export async function POST(
  req: NextRequest,
  { params }: { params: { bedId: string } }
) {
  try {
    const context = await validateRequest(req)
    const service = BedMaintenanceService.getInstance()
    const data = await req.json()
    
    // Validate request body
    const validatedData = bedMaintenanceSchema.parse({
      ...data,
      bedId: params.bedId
    })
    
    const maintenance = await service.scheduleMaintenance(validatedData, context)
    return Response.json(maintenance)
  } catch (error) {
    return handleError(error)
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { bedId: string } }
) {
  try {
    const context = await validateRequest(req)
    const service = BedMaintenanceService.getInstance()
    const history = await service.getMaintenanceHistory(params.bedId, context)
    return Response.json(history)
  } catch (error) {
    return handleError(error)
  }
}

