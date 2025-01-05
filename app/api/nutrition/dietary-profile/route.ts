import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { performanceMonitor } from '@/features/nutrition/utils/performance'
import { advancedCache } from '@/features/nutrition/utils/advanced-cache'
import { mobileOptimizer } from '@/features/nutrition/utils/mobile-optimization'

const dietaryProfileSchema = z.object({
  userId: z.string(),
  restrictions: z.array(z.string()),
  allergies: z.array(z.string()),
  preferences: z.array(z.string()),
  medicalConditions: z.array(z.object({
    condition: z.string(),
    details: z.string().optional(),
    restrictions: z.array(z.string()).optional()
  })).optional(),
  goals: z.array(z.object({
    type: z.enum(['weight', 'health', 'fitness', 'other']),
    description: z.string(),
    target: z.number().optional(),
    unit: z.string().optional(),
    deadline: z.string().optional()
  })),
  nutritionalNeeds: z.object({
    calories: z.number(),
    macros: z.object({
      protein: z.number(),
      carbs: z.number(),
      fat: z.number()
    }),
    micronutrients: z.array(z.object({
      name: z.string(),
      target: z.number(),
      unit: z.string()
    })).optional()
  })
})

const dietaryAnalysisSchema = z.object({
  userId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  metrics: z.array(z.object({
    name: z.string(),
    value: z.number(),
    unit: z.string(),
    target: z.number().optional(),
    compliance: z.number().optional()
  })),
  recommendations: z.array(z.object({
    category: z.string(),
    suggestion: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    reason: z.string().optional()
  })).optional()
})

export async function GET(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('dietary_profile_api_get')
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'profile' or 'analysis'

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const cacheKey = `dietary:${type}:${userId}`
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
    console.error('Dietary Profile API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}

export async function POST(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('dietary_profile_api_post')
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
    if (type === 'profile') {
      validatedData = dietaryProfileSchema.parse(body)
    } else if (type === 'analysis') {
      validatedData = dietaryAnalysisSchema.parse(body)
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
    
    console.error('Dietary Profile API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}

export async function PUT(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('dietary_profile_api_put')
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
    if (type === 'profile') {
      validatedData = dietaryProfileSchema.parse(body)
    } else if (type === 'analysis') {
      validatedData = dietaryAnalysisSchema.parse(body)
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

    // If updating profile, invalidate analysis cache
    if (type === 'profile') {
      await advancedCache.delete(
        `dietary:analysis:${validatedData.userId}`
      )
    }

    return NextResponse.json(updatedData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Dietary Profile API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}

export async function DELETE(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('dietary_profile_api_delete')
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Delete from database
    // Replace with actual database operation

    // Invalidate caches
    await Promise.all([
      advancedCache.delete(`dietary:${type}:${userId}`),
      type === 'profile'
        ? advancedCache.delete(`dietary:analysis:${userId}`)
        : null
    ].filter(Boolean))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Dietary Profile API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}
