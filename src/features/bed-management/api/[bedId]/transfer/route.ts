// src/features/bed-management/api/[bedId]/transfer/route.ts

import { z } from 'zod'
import { validateRequest } from '@/lib/api'
import { handleError } from '@/lib/errors'
import type { NextRequest } from 'next/server'
import { BedTransferService } from '../../../services'
import { bedTransferSchema } from '../../validation'

export async function POST(
  req: NextRequest,
  { params }: { params: { bedId: string } }
) {
  try {
    const context = await validateRequest(req)
    const service = BedTransferService.getInstance()
    const data = await req.json()
    
    // Validate request body
    const validatedData = bedTransferSchema.parse({
      ...data,
      sourceBedId: params.bedId
    })
    
    const transfer = await service.createTransfer(validatedData, context)
    return Response.json(transfer)
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
    const service = BedTransferService.getInstance()
    const transfers = await service.getTransfersForBed(params.bedId, context)
    return Response.json(transfers)
  } catch (error) {
    return handleError(error)
  }
}

