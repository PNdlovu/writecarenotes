import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { performanceMonitor } from '@/features/nutrition/utils/performance'
import { advancedCache } from '@/features/nutrition/utils/advanced-cache'
import { mobileOptimizer } from '@/features/nutrition/utils/mobile-optimization'
import { OrganizationError } from '@/features/organizations/types/errors'

type HydrationErrorCode = 
  | 'INVALID_REQUEST'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'UNAUTHORIZED'

class HydrationError extends OrganizationError {
  constructor(
    message: string,
    code: HydrationErrorCode,
    public context?: Record<string, any>
  ) {
    super(message, code, context)
    this.name = 'HydrationError'
  }
}

const hydrationLogSchema = z.object({
  organizationId: z.string(),
  residentId: z.string(),
  date: z.string(),
  entries: z.array(z.object({
    type: z.enum(['water', 'coffee', 'tea', 'soda', 'juice', 'other']),
    amount: z.number().positive(),
    unit: z.enum(['ml', 'oz', 'cups']),
    timestamp: z.string(),
    notes: z.string().optional()
  })),
  totalIntake: z.number().positive(),
  unit: z.enum(['ml', 'oz', 'cups'])
})

const hydrationGoalSchema = z.object({
  organizationId: z.string(),
  residentId: z.string(),
  dailyGoal: z.number().positive(),
  unit: z.enum(['ml', 'oz', 'cups']),
  reminders: z.array(z.object({
    time: z.string(),
    enabled: z.boolean(),
    message: z.string().optional()
  })).optional(),
  preferences: z.object({
    preferredUnit: z.enum(['ml', 'oz', 'cups']),
    trackCaffeine: z.boolean().optional(),
    excludeTypes: z.array(z.string()).optional()
  }).optional()
})

export async function GET(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('hydration_api_get')
  try {
    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get('organizationId')
    const residentId = searchParams.get('residentId')
    const date = searchParams.get('date')
    const type = searchParams.get('type') // 'log' or 'goal'

    if (!organizationId || !residentId || !type) {
      throw new HydrationError('Missing required parameters: organizationId, residentId, and type are required', 'INVALID_REQUEST')
    }

    const cacheKey = `hydration:${type}:${organizationId}:${residentId}${
      date ? `:${date}` : ''
    }`
    const cachedData = await advancedCache.get(cacheKey)
    if (cachedData) {
      return NextResponse.json(
        await mobileOptimizer.optimizePayload(cachedData, req.url)
      )
    }

    // Fetch from database
    const data = {} // Replace with actual database query
    await advancedCache.set(cacheKey, data)

    return NextResponse.json(
      await mobileOptimizer.optimizePayload(data, req.url)
    )
  } catch (error) {
    if (error instanceof HydrationError) {
      return NextResponse.json(
        { error: error.message, code: error.code, context: error.context },
        { status: 400 }
      )
    }
    
    console.error('Hydration API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}

export async function POST(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('hydration_api_post')
  try {
    const body = await req.json()
    const type = new URL(req.url).searchParams.get('type')

    if (!type) {
      throw new HydrationError('Missing type parameter', 'INVALID_REQUEST')
    }

    let validatedData
    if (type === 'log') {
      validatedData = hydrationLogSchema.parse(body)
    } else if (type === 'goal') {
      validatedData = hydrationGoalSchema.parse(body)
    } else {
      throw new HydrationError('Invalid type parameter', 'INVALID_REQUEST')
    }

    // Save to database
    const savedData = {} // Replace with actual database operation

    // Update cache
    const cacheKey = `hydration:${type}:${validatedData.organizationId}:${validatedData.residentId}${
      type === 'log' ? `:${validatedData.date}` : ''
    }`
    await advancedCache.set(cacheKey, savedData)

    return NextResponse.json(savedData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new HydrationError('Invalid request data', 'VALIDATION_ERROR', { errors: error.errors })
    }
    
    if (error instanceof HydrationError) {
      return NextResponse.json(
        { error: error.message, code: error.code, context: error.context },
        { status: 400 }
      )
    }
    
    console.error('Hydration API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}

export async function PUT(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('hydration_api_put')
  try {
    const body = await req.json()
    const type = new URL(req.url).searchParams.get('type')
    const entryId = new URL(req.url).searchParams.get('entryId')

    if (!type || !entryId) {
      throw new HydrationError('Missing required parameters', 'INVALID_REQUEST')
    }

    let validatedData
    if (type === 'log') {
      validatedData = hydrationLogSchema.parse(body)
    } else if (type === 'goal') {
      validatedData = hydrationGoalSchema.parse(body)
    } else {
      throw new HydrationError('Invalid type parameter', 'INVALID_REQUEST')
    }

    // Update in database
    const updatedData = {} // Replace with actual database operation

    // Update cache
    const cacheKey = `hydration:${type}:${validatedData.organizationId}:${validatedData.residentId}${
      type === 'log' ? `:${validatedData.date}` : ''
    }`
    await advancedCache.set(cacheKey, updatedData)

    return NextResponse.json(updatedData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new HydrationError('Invalid request data', 'VALIDATION_ERROR', { errors: error.errors })
    }
    
    if (error instanceof HydrationError) {
      return NextResponse.json(
        { error: error.message, code: error.code, context: error.context },
        { status: 400 }
      )
    }
    
    console.error('Hydration API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}

export async function DELETE(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('hydration_api_delete')
  try {
    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get('organizationId')
    const residentId = searchParams.get('residentId')
    const type = searchParams.get('type')
    const entryId = searchParams.get('entryId')

    if (!organizationId || !residentId || !type || !entryId) {
      throw new HydrationError('Missing required parameters', 'INVALID_REQUEST')
    }

    // Delete from database
    // Replace with actual database operation

    // Invalidate cache
    if (type === 'log') {
      const date = searchParams.get('date')
      if (!date) {
        throw new HydrationError('Missing date parameter for log deletion', 'INVALID_REQUEST')
      }
      await advancedCache.delete(`hydration:${type}:${organizationId}:${residentId}:${date}`)
    } else {
      await advancedCache.delete(`hydration:${type}:${organizationId}:${residentId}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof HydrationError) {
      return NextResponse.json(
        { error: error.message, code: error.code, context: error.context },
        { status: 400 }
      )
    }
    
    console.error('Hydration API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}
