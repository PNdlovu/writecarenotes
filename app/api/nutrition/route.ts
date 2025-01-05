import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { performanceMonitor } from '@/features/nutrition/utils/performance'
import { advancedCache } from '@/features/nutrition/utils/advanced-cache'
import { mobileOptimizer } from '@/features/nutrition/utils/mobile-optimization'

// Validation schemas
const nutritionLogSchema = z.object({
  userId: z.string(),
  date: z.string(),
  meals: z.array(z.object({
    type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    foods: z.array(z.object({
      name: z.string(),
      portion: z.number(),
      unit: z.string(),
      calories: z.number(),
      nutrients: z.object({
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
        fiber: z.number()
      })
    }))
  })),
  totalCalories: z.number(),
  totalNutrients: z.object({
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
    fiber: z.number()
  })
})

const nutritionGoalSchema = z.object({
  userId: z.string(),
  dailyCalories: z.number(),
  macroSplit: z.object({
    protein: z.number(),
    carbs: z.number(),
    fat: z.number()
  }),
  restrictions: z.array(z.string()).optional(),
  preferences: z.array(z.string()).optional()
})

export async function GET(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('nutrition_api_get')
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const date = searchParams.get('date')

    if (!userId || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Try cache first
    const cacheKey = `nutrition:${userId}:${date}`
    const cachedData = await advancedCache.get(cacheKey)
    if (cachedData) {
      return NextResponse.json(
        await mobileOptimizer.optimizePayload(cachedData, req.url)
      )
    }

    // Fetch from database if not in cache
    const nutritionLog = {} // Replace with actual database query
    await advancedCache.set(cacheKey, nutritionLog)

    return NextResponse.json(
      await mobileOptimizer.optimizePayload(nutritionLog, req.url)
    )
  } catch (error) {
    console.error('Nutrition API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}

export async function POST(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('nutrition_api_post')
  try {
    const body = await req.json()
    
    // Validate request body
    const validatedData = nutritionLogSchema.parse(body)

    // Save to database
    const savedLog = {} // Replace with actual database operation

    // Update cache
    const cacheKey = `nutrition:${validatedData.userId}:${validatedData.date}`
    await advancedCache.set(cacheKey, savedLog)

    return NextResponse.json(savedLog)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Nutrition API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}

export async function PUT(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('nutrition_api_put')
  try {
    const body = await req.json()
    
    // Validate request body
    const validatedData = nutritionGoalSchema.parse(body)

    // Update in database
    const updatedGoals = {} // Replace with actual database operation

    // Update cache
    const cacheKey = `nutrition:goals:${validatedData.userId}`
    await advancedCache.set(cacheKey, updatedGoals)

    return NextResponse.json(updatedGoals)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Nutrition API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}

export async function DELETE(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('nutrition_api_delete')
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const date = searchParams.get('date')
    const logId = searchParams.get('logId')

    if (!userId || !date || !logId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Delete from database
    // Replace with actual database operation

    // Invalidate cache
    const cacheKey = `nutrition:${userId}:${date}`
    await advancedCache.delete(cacheKey)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Nutrition API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}
