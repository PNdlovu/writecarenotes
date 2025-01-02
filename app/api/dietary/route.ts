import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { performanceMonitor } from '@/features/nutrition/utils/performance'
import { advancedCache } from '@/features/nutrition/utils/advanced-cache'
import { mobileOptimizer } from '@/features/nutrition/utils/mobile-optimization'

// Validation schemas
const liquidIntakeSchema = z.object({
  userId: z.string(),
  date: z.string(),
  entries: z.array(z.object({
    type: z.enum(['water', 'coffee', 'tea', 'soda', 'juice', 'other']),
    amount: z.number(),
    unit: z.enum(['ml', 'oz', 'cups']),
    timestamp: z.string(),
    notes: z.string().optional()
  })),
  totalIntake: z.number(),
  unit: z.enum(['ml', 'oz', 'cups'])
})

const dietaryPreferenceSchema = z.object({
  userId: z.string(),
  restrictions: z.array(z.string()),
  allergies: z.array(z.string()),
  preferences: z.array(z.string()),
  medicalConditions: z.array(z.string()).optional(),
  goals: z.array(z.string())
})

export async function GET(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('dietary_api_get')
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const date = searchParams.get('date')
    const type = searchParams.get('type') // 'liquid' or 'preferences'

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Try cache first
    const cacheKey = `dietary:${type}:${userId}${date ? `:${date}` : ''}`
    const cachedData = await advancedCache.get(cacheKey)
    if (cachedData) {
      return NextResponse.json(
        await mobileOptimizer.optimizePayload(cachedData, req.url)
      )
    }

    // Fetch from database if not in cache
    let data = {} // Replace with actual database query
    await advancedCache.set(cacheKey, data)

    return NextResponse.json(
      await mobileOptimizer.optimizePayload(data, req.url)
    )
  } catch (error) {
    console.error('Dietary API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}

export async function POST(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('dietary_api_post')
  try {
    const body = await req.json()
    const type = new URL(req.url).searchParams.get('type')

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      )
    }

    let validatedData
    if (type === 'liquid') {
      validatedData = liquidIntakeSchema.parse(body)
    } else if (type === 'preferences') {
      validatedData = dietaryPreferenceSchema.parse(body)
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter' },
        { status: 400 }
      )
    }

    // Save to database
    const savedData = {} // Replace with actual database operation

    // Update cache
    const cacheKey = `dietary:${type}:${validatedData.userId}`
    await advancedCache.set(cacheKey, savedData)

    return NextResponse.json(savedData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Dietary API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}

export async function PUT(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('dietary_api_put')
  try {
    const body = await req.json()
    const type = new URL(req.url).searchParams.get('type')

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      )
    }

    let validatedData
    if (type === 'liquid') {
      validatedData = liquidIntakeSchema.parse(body)
    } else if (type === 'preferences') {
      validatedData = dietaryPreferenceSchema.parse(body)
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter' },
        { status: 400 }
      )
    }

    // Update in database
    const updatedData = {} // Replace with actual database operation

    // Update cache
    const cacheKey = `dietary:${type}:${validatedData.userId}`
    await advancedCache.set(cacheKey, updatedData)

    return NextResponse.json(updatedData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Dietary API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}

export async function DELETE(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('dietary_api_delete')
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!userId || !type || !id) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Delete from database
    // Replace with actual database operation

    // Invalidate cache
    const cacheKey = `dietary:${type}:${userId}`
    await advancedCache.delete(cacheKey)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Dietary API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}
