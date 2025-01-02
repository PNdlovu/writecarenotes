import { Redis } from 'ioredis'
import { LRUCache } from 'lru-cache'

// Redis client for distributed caching
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  }
})

// In-memory LRU cache for frequent reads
const memoryCache = new LRUCache<string, any>({
  max: 1000, // Maximum number of items
  ttl: 1000 * 60 * 5, // 5 minutes
  updateAgeOnGet: true,
  updateAgeOnHas: true
})

interface CacheOptions {
  ttl?: number // Time to live in seconds
  useLocalCache?: boolean // Whether to use memory cache
}

export class CacheManager {
  private static instance: CacheManager

  private constructor() {}

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  // Get data from cache
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      // Check memory cache first if enabled
      if (options?.useLocalCache) {
        const localData = memoryCache.get(key)
        if (localData) return localData as T
      }

      // Check Redis
      const data = await redis.get(key)
      if (!data) return null

      const parsed = JSON.parse(data)

      // Update memory cache if enabled
      if (options?.useLocalCache) {
        memoryCache.set(key, parsed)
      }

      return parsed as T
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  // Set data in cache
  async set(
    key: string,
    value: any,
    options?: CacheOptions
  ): Promise<void> {
    try {
      const serialized = JSON.stringify(value)

      // Set in Redis
      if (options?.ttl) {
        await redis.setex(key, options.ttl, serialized)
      } else {
        await redis.set(key, serialized)
      }

      // Update memory cache if enabled
      if (options?.useLocalCache) {
        memoryCache.set(key, value)
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  // Delete from cache
  async delete(key: string): Promise<void> {
    try {
      await redis.del(key)
      memoryCache.delete(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  // Clear entire cache
  async clear(): Promise<void> {
    try {
      await redis.flushall()
      memoryCache.clear()
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }

  // Get multiple keys
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await redis.mget(keys)
      return values.map(v => v ? JSON.parse(v) : null)
    } catch (error) {
      console.error('Cache mget error:', error)
      return keys.map(() => null)
    }
  }

  // Set multiple key-value pairs
  async mset(
    items: { key: string; value: any; ttl?: number }[]
  ): Promise<void> {
    try {
      const pipeline = redis.pipeline()

      items.forEach(item => {
        const serialized = JSON.stringify(item.value)
        if (item.ttl) {
          pipeline.setex(item.key, item.ttl, serialized)
        } else {
          pipeline.set(item.key, serialized)
        }
      })

      await pipeline.exec()
    } catch (error) {
      console.error('Cache mset error:', error)
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const exists = await redis.exists(key)
      return exists === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  // Increment a counter
  async increment(key: string): Promise<number> {
    try {
      return await redis.incr(key)
    } catch (error) {
      console.error('Cache increment error:', error)
      return 0
    }
  }

  // Set expiration on existing key
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await redis.expire(key, seconds)
    } catch (error) {
      console.error('Cache expire error:', error)
    }
  }

  // Get cache stats
  async getStats(): Promise<{
    memoryUsage: number
    keyCount: number
    hitRate: number
  }> {
    try {
      const info = await redis.info()
      const memory = parseInt(
        info
          .split('\n')
          .find(line => line.startsWith('used_memory:'))
          ?.split(':')[1] || '0'
      )
      const keys = parseInt(
        info
          .split('\n')
          .find(line => line.startsWith('db0:keys='))
          ?.split('=')[1]
          .split(',')[0] || '0'
      )
      const hits = parseInt(
        info
          .split('\n')
          .find(line => line.startsWith('keyspace_hits:'))
          ?.split(':')[1] || '0'
      )
      const misses = parseInt(
        info
          .split('\n')
          .find(line => line.startsWith('keyspace_misses:'))
          ?.split(':')[1] || '0'
      )
      const hitRate = hits / (hits + misses)

      return {
        memoryUsage: memory,
        keyCount: keys,
        hitRate
      }
    } catch (error) {
      console.error('Cache stats error:', error)
      return {
        memoryUsage: 0,
        keyCount: 0,
        hitRate: 0
      }
    }
  }
}

export const cacheManager = CacheManager.getInstance()
