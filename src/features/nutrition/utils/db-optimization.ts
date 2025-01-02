import { prisma } from '@/lib/prisma'
import { cacheManager } from './cache'
import DataLoader from 'dataloader'

// DataLoader instances for batch loading
const mealPlanLoader = new DataLoader(async (ids: string[]) => {
  const mealPlans = await prisma.mealPlan.findMany({
    where: { id: { in: ids } },
    include: {
      meals: true,
      dietaryRequirements: true
    }
  })
  return ids.map(id => mealPlans.find(plan => plan.id === id))
})

const residentLoader = new DataLoader(async (ids: string[]) => {
  const residents = await prisma.resident.findMany({
    where: { id: { in: ids } },
    include: {
      dietaryRequirements: true,
      dietaryRestrictions: true,
      nutritionalGoals: true
    }
  })
  return ids.map(id => residents.find(resident => resident.id === id))
})

export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer

  private constructor() {}

  public static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer()
    }
    return DatabaseOptimizer.instance
  }

  // Batch loading methods
  async getMealPlan(id: string) {
    return mealPlanLoader.load(id)
  }

  async getResident(id: string) {
    return residentLoader.load(id)
  }

  // Query optimization methods
  async optimizeQuery<T>(
    key: string,
    query: () => Promise<T>,
    options: {
      ttl?: number
      useCache?: boolean
      primeCache?: boolean
    } = {}
  ): Promise<T> {
    const { ttl = 300, useCache = true, primeCache = false } = options

    if (useCache) {
      const cached = await cacheManager.get<T>(key)
      if (cached) return cached
    }

    const result = await query()

    if (useCache || primeCache) {
      await cacheManager.set(key, result, { ttl })
    }

    return result
  }

  // Pagination helper
  async getPaginatedResults<T>(
    query: any,
    page: number,
    pageSize: number,
    orderBy?: any
  ): Promise<{
    data: T[]
    total: number
    hasMore: boolean
  }> {
    const [data, total] = await Promise.all([
      prisma.$transaction([
        query.skip((page - 1) * pageSize).take(pageSize),
        query.count()
      ])
    ])

    return {
      data,
      total,
      hasMore: total > page * pageSize
    }
  }

  // Cursor-based pagination
  async getCursorPaginatedResults<T>(
    query: any,
    cursor: string | null,
    limit: number,
    orderBy?: any
  ): Promise<{
    data: T[]
    nextCursor: string | null
  }> {
    const items = await query
      .take(limit + 1)
      .cursor(cursor ? { id: cursor } : undefined)
      .orderBy(orderBy || { id: 'asc' })

    const hasMore = items.length > limit
    const data = hasMore ? items.slice(0, -1) : items
    const nextCursor = hasMore ? items[items.length - 2].id : null

    return {
      data,
      nextCursor
    }
  }

  // Query builder with automatic indexing hints
  buildOptimizedQuery(
    table: string,
    filters: Record<string, any>,
    orderBy?: Record<string, 'asc' | 'desc'>
  ) {
    const query: any = { where: {} }

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.where[key] = value
      }
    })

    // Add ordering with index hints
    if (orderBy) {
      query.orderBy = orderBy
    }

    return query
  }

  // Bulk operation helper
  async bulkOperation<T>(
    operations: (() => Promise<T>)[],
    batchSize: number = 100
  ): Promise<T[]> {
    const results: T[] = []
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize)
      const batchResults = await Promise.all(batch.map(op => op()))
      results.push(...batchResults)
    }
    return results
  }

  // Transaction helper with retry logic
  async withTransaction<T>(
    operation: (tx: any) => Promise<T>,
    retries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null

    for (let i = 0; i < retries; i++) {
      try {
        return await prisma.$transaction(operation)
      } catch (error) {
        lastError = error as Error
        if (!this.isRetryableError(error)) {
          throw error
        }
        await this.delay(Math.pow(2, i) * 100) // Exponential backoff
      }
    }

    throw lastError || new Error('Transaction failed')
  }

  // Soft delete helper
  async softDelete(
    model: any,
    id: string,
    userId: string
  ): Promise<void> {
    await model.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId
      }
    })
  }

  // Database maintenance
  async performMaintenance(): Promise<void> {
    // Vacuum analyze for better query planning
    await prisma.$executeRaw`VACUUM ANALYZE;`

    // Update statistics
    await prisma.$executeRaw`ANALYZE;`

    // Clean up soft deleted records older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    await prisma.$transaction([
      prisma.mealPlan.deleteMany({
        where: {
          deletedAt: {
            lt: thirtyDaysAgo
          }
        }
      }),
      prisma.meal.deleteMany({
        where: {
          deletedAt: {
            lt: thirtyDaysAgo
          }
        }
      })
    ])
  }

  // Utility methods
  private isRetryableError(error: any): boolean {
    return (
      error.code === 'P2034' || // Prisma transaction error
      error.code === '40001' || // Serialization failure
      error.code === '40P01' // Deadlock detected
    )
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const dbOptimizer = DatabaseOptimizer.getInstance()
