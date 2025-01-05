import { NextApiRequest, NextApiResponse } from 'next'
import { cacheManager } from './cache'
import { performanceMonitor } from './performance'
import { z } from 'zod'
import { compress } from 'compression'
import rateLimit from 'express-rate-limit'

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

// Compression middleware
const compression = compress()

// API Response cache configuration
const API_CACHE_TTL = 300 // 5 minutes
const STALE_WHILE_REVALIDATE = 60 // 1 minute

export class ApiOptimizer {
  private static instance: ApiOptimizer

  private constructor() {}

  public static getInstance(): ApiOptimizer {
    if (!ApiOptimizer.instance) {
      ApiOptimizer.instance = new ApiOptimizer()
    }
    return ApiOptimizer.instance
  }

  // API route wrapper with optimization features
  createOptimizedHandler(
    handler: (
      req: NextApiRequest,
      res: NextApiResponse
    ) => Promise<void>,
    options: {
      schema?: z.ZodSchema
      cache?: boolean
      rateLimit?: boolean
      compress?: boolean
    } = {}
  ) {
    return async (
      req: NextApiRequest,
      res: NextApiResponse
    ): Promise<void> => {
      const metricId = performanceMonitor.startMetric('api_request', {
        method: req.method,
        url: req.url
      })

      try {
        // Apply rate limiting
        if (options.rateLimit) {
          await this.applyRateLimit(req, res)
        }

        // Apply compression
        if (options.compress) {
          await this.applyCompression(req, res)
        }

        // Validate request
        if (options.schema) {
          try {
            options.schema.parse(req.body)
          } catch (error) {
            res.status(400).json({
              error: 'Invalid request data',
              details: error
            })
            return
          }
        }

        // Check cache
        if (options.cache) {
          const cacheKey = this.getCacheKey(req)
          const cached = await cacheManager.get(cacheKey)

          if (cached) {
            res.setHeader('X-Cache', 'HIT')
            res.json(cached)
            return
          }

          // Wrap handler to cache response
          const originalJson = res.json
          res.json = (body: any) => {
            cacheManager.set(cacheKey, body, {
              ttl: API_CACHE_TTL
            })
            return originalJson.call(res, body)
          }
        }

        // Execute handler
        await handler(req, res)
      } catch (error) {
        console.error('API Error:', error)
        res.status(500).json({
          error: 'Internal server error'
        })
      } finally {
        performanceMonitor.endMetric(metricId)
      }
    }
  }

  // Batch API request handler
  async handleBatchRequest(
    req: NextApiRequest,
    res: NextApiResponse,
    handlers: Record<string, (data: any) => Promise<any>>
  ): Promise<void> {
    const batch = req.body as {
      id: string
      method: string
      data: any
    }[]

    const results = await Promise.allSettled(
      batch.map(async ({ id, method, data }) => {
        const handler = handlers[method]
        if (!handler) {
          throw new Error(`Unknown method: ${method}`)
        }
        return {
          id,
          result: await handler(data)
        }
      })
    )

    res.json(
      results.map((result, index) => ({
        id: batch[index].id,
        ...(result.status === 'fulfilled'
          ? { result: result.value }
          : { error: result.reason.message })
      }))
    )
  }

  // GraphQL-style query optimization
  parseQueryFields(query: string): Set<string> {
    const fields = new Set<string>()
    const regex = /\{([^}]+)\}/g
    let match

    while ((match = regex.exec(query)) !== null) {
      match[1]
        .split('\n')
        .map(s => s.trim())
        .filter(s => s && !s.includes('{'))
        .forEach(field => fields.add(field))
    }

    return fields
  }

  // Response streaming helper
  async *streamResponse(
    items: AsyncIterator<any>,
    transform?: (item: any) => any
  ): AsyncIterator<any> {
    for await (const item of items) {
      yield transform ? transform(item) : item
    }
  }

  // Error handling with retry
  async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      retries?: number
      backoff?: number
    } = {}
  ): Promise<T> {
    const { retries = 3, backoff = 300 } = options
    let lastError: Error | null = null

    for (let i = 0; i < retries; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        if (i < retries - 1) {
          await new Promise(resolve =>
            setTimeout(resolve, backoff * Math.pow(2, i))
          )
        }
      }
    }

    throw lastError || new Error('Operation failed')
  }

  // Private utility methods
  private getCacheKey(req: NextApiRequest): string {
    return `api:${req.method}:${req.url}:${JSON.stringify(req.body)}`
  }

  private async applyRateLimit(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      limiter(req as any, res as any, (error: any) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }

  private async applyCompression(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      compression(req as any, res as any, (error: any) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }
}

export const apiOptimizer = ApiOptimizer.getInstance()

// Example usage:
// export default apiOptimizer.createOptimizedHandler(
//   async (req, res) => {
//     // Handler implementation
//   },
//   {
//     schema: mySchema,
//     cache: true,
//     rateLimit: true,
//     compress: true
//   }
// )
