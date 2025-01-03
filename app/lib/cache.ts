/**
 * @fileoverview Caching Service
 * @version 1.0.0
 * @created 2024-03-21
 */

import Redis from 'ioredis';
import { logger } from './logger';
import { metrics } from './metrics';

interface CacheConfig {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

class CacheService {
  private static instance: CacheService;
  private client: Redis;
  private defaultTTL: number = 3600; // 1 hour

  private constructor() {
    this.client = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 100, 3000);
      }
    });

    this.client.on('error', (error) => {
      logger.error('Redis cache error:', error);
      metrics.increment('cache.error');
    });

    this.client.on('connect', () => {
      logger.info('Redis cache connected');
      metrics.increment('cache.connect');
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private generateKey(key: string, prefix?: string): string {
    const finalPrefix = prefix || 'wcn';
    return `${finalPrefix}:${key}`;
  }

  public async get<T>(key: string, config?: CacheConfig): Promise<T | null> {
    const startTime = Date.now();
    const cacheKey = this.generateKey(key, config?.prefix);

    try {
      const cached = await this.client.get(cacheKey);
      
      metrics.recordTiming('cache.get.duration', Date.now() - startTime);
      
      if (cached) {
        metrics.increment('cache.hit');
        return JSON.parse(cached) as T;
      }
      
      metrics.increment('cache.miss');
      return null;
    } catch (error) {
      logger.error('Cache get error:', { key: cacheKey, error });
      metrics.increment('cache.get.error');
      return null;
    }
  }

  public async set(key: string, value: any, config?: CacheConfig): Promise<void> {
    const startTime = Date.now();
    const cacheKey = this.generateKey(key, config?.prefix);
    const ttl = config?.ttl || this.defaultTTL;

    try {
      await this.client.setex(
        cacheKey,
        ttl,
        JSON.stringify(value)
      );
      
      metrics.recordTiming('cache.set.duration', Date.now() - startTime);
      metrics.increment('cache.set.success');
    } catch (error) {
      logger.error('Cache set error:', { key: cacheKey, error });
      metrics.increment('cache.set.error');
    }
  }

  public async delete(key: string, prefix?: string): Promise<void> {
    const cacheKey = this.generateKey(key, prefix);
    
    try {
      await this.client.del(cacheKey);
      metrics.increment('cache.delete.success');
    } catch (error) {
      logger.error('Cache delete error:', { key: cacheKey, error });
      metrics.increment('cache.delete.error');
    }
  }

  public async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      metrics.increment('cache.invalidate.success');
    } catch (error) {
      logger.error('Cache invalidate error:', { pattern, error });
      metrics.increment('cache.invalidate.error');
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const ping = await this.client.ping();
      return ping === 'PONG';
    } catch (error) {
      logger.error('Cache health check failed:', error);
      return false;
    }
  }
} 
