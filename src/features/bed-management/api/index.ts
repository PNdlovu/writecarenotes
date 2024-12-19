// src/features/bed-management/api/index.ts

import { z } from 'zod'
import { validateRequest } from '@/lib/api'
import { handleError } from '@/lib/errors'
import type { NextRequest } from 'next/server'
import { BedService } from '../services'
import type { ServiceContext } from '@/types/context'

export async function GET(req: NextRequest) {
  try {
    const context = await validateRequest(req)
    const service = BedService.getInstance()
    const beds = await service.getAllBeds(context)
    return Response.json(beds)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const context = await validateRequest(req)
    const service = BedService.getInstance()
    const data = await req.json()
    const bed = await service.createBed(data, context)
    return Response.json(bed)
  } catch (error) {
    return handleError(error)
  }
}


