// src/features/bed-management/api/analytics/route.ts

import { z } from 'zod'
import { validateRequest } from '@/lib/api'
import { handleError } from '@/lib/errors'
import type { NextRequest } from 'next/server'
import { BedAnalyticsService } from '../../services'

export async function GET(req: NextRequest) {
  try {
    const context = await validateRequest(req)
    const service = BedAnalyticsService.getInstance()
    
    // Get query parameters
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const analytics = await service.getAnalytics({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    }, context)
    
    return Response.json(analytics)
  } catch (error) {
    return handleError(error)
  }
}


