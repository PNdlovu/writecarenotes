import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { performanceMonitor } from '@/features/nutrition/utils/performance'
import { advancedCache } from '@/features/nutrition/utils/advanced-cache'
import { mobileOptimizer } from '@/features/nutrition/utils/mobile-optimization'

const mealPlanSchema = z.object({
  userId: z.string(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  meals: z.array(z.object({
    day: z.number(), // 0-6 for days of week
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
  totalCaloriesPerDay: z.number(),
  macroSplit: z.object({
    protein: z.number(),
    carbs: z.number(),
    fat: z.number()
  }),
  dietaryRestrictions: z.array(z.string()).optional(),
  notes: z.string().optional()
})

export async function GET(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('meal_plans_api_get')
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const planId = searchParams.get('planId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const cacheKey = planId 
      ? `meal-plan:${userId}:${planId}`
      : `meal-plans:${userId}`

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
    console.error('Meal Plans API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}

export async function POST(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('meal_plans_api_post')
  try {
    const body = await req.json()
    const validatedData = mealPlanSchema.parse(body)

    // Save to database
    const savedPlan = {} // Replace with actual database operation

    // Update cache
    const cacheKey = `meal-plan:${validatedData.userId}:${savedPlan.id}`
    await advancedCache.set(cacheKey, savedPlan)

    // Invalidate user's meal plans list
    await advancedCache.delete(`meal-plans:${validatedData.userId}`)

    return NextResponse.json(savedPlan)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Meal Plans API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}

export async function PUT(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('meal_plans_api_put')
  try {
    const body = await req.json()
    const planId = new URL(req.url).searchParams.get('planId')

    if (!planId) {
      return NextResponse.json(
        { error: 'Missing planId parameter' },
        { status: 400 }
      )
    }

    const validatedData = mealPlanSchema.parse(body)

    // Update in database
    const updatedPlan = {} // Replace with actual database operation

    // Update cache
    const cacheKey = `meal-plan:${validatedData.userId}:${planId}`
    await advancedCache.set(cacheKey, updatedPlan)

    // Invalidate user's meal plans list
    await advancedCache.delete(`meal-plans:${validatedData.userId}`)

    return NextResponse.json(updatedPlan)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Meal Plans API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}

export async function DELETE(req: NextRequest) {
  const metricId = performanceMonitor.startMetric('meal_plans_api_delete')
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const planId = searchParams.get('planId')

    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Delete from database
    // Replace with actual database operation

    // Invalidate caches
    await Promise.all([
      advancedCache.delete(`meal-plan:${userId}:${planId}`),
      advancedCache.delete(`meal-plans:${userId}`)
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Meal Plans API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    performanceMonitor.endMetric(metricId)
  }
}
