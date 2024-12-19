// src/features/bed-management/api/waitlist/route.ts

import { z } from 'zod'
import { validateRequest } from '@/lib/api'
import { handleError } from '@/lib/errors'
import type { NextRequest } from 'next/server'
import { BedAllocationService } from '../../services'

export async function GET(req: NextRequest) {
  try {
    const context = await validateRequest(req)
    const service = BedAllocationService.getInstance()
    const waitlist = await service.getWaitlist(context)
    return Response.json(waitlist)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const context = await validateRequest(req)
    const service = BedAllocationService.getInstance()
    const data = await req.json()
    
    const entry = await service.addToWaitlist(data, context)
    return Response.json(entry)
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const context = await validateRequest(req)
    const service = BedAllocationService.getInstance()
    const data = await req.json()
    
    const updated = await service.updateWaitlistEntry(data, context)
    return Response.json(updated)
  } catch (error) {
    return handleError(error)
  }
}


