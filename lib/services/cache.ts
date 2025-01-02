/**
 * @writecarenotes.com
 * @fileoverview Caching service
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Redis-based caching service with support for different cache strategies.
 */

import Redis from 'ioredis';
import { logger } from './logger';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface CacheOptions {
  ttl?: number;
  prefix?: string;
  invalidateOn?: string[];
}

class Cache {
  private static instance: Cache;
  private defaultTTL: number = 5 * 60; // 5 minutes

  private constructor() {
    // Initialize Redis error handling
    redis.on('error', (error) => {
      logger.error('Redis connection error', { error });
    });
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  private getKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  async get<T>(key: string, prefix?: string): Promise<T | null> {
    try {
      const fullKey = this.getKey(key, prefix);
      const value = await redis.get(fullKey);
      
      if (!value) return null;
      
      return JSON.parse(value);
    } catch (error) {
      logger.error('Cache get error', { error, key, prefix });
      return null;
    }
  }

  async set(
    key: string,
    value: any,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const fullKey = this.getKey(key, options.prefix);
      const ttl = options.ttl || this.defaultTTL;
      
      await redis.setex(
        fullKey,
        ttl,
        JSON.stringify(value)
      );

      // Set invalidation triggers if specified
      if (options.invalidateOn?.length) {
        await Promise.all(
          options.invalidateOn.map(trigger =>
            redis.sadd(`invalidate:${trigger}`, fullKey)
          )
        );
      }
    } catch (error) {
      logger.error('Cache set error', { error, key, options });
    }
  }

  async delete(key: string, prefix?: string): Promise<void> {
    try {
      const fullKey = this.getKey(key, prefix);
      await redis.del(fullKey);
    } catch (error) {
      logger.error('Cache delete error', { error, key, prefix });
    }
  }

  async invalidate(trigger: string): Promise<void> {
    try {
      const keys = await redis.smembers(`invalidate:${trigger}`);
      if (keys.length) {
        await Promise.all([
          redis.del(...keys),
          redis.del(`invalidate:${trigger}`)
        ]);
      }
    } catch (error) {
      logger.error('Cache invalidation error', { error, trigger });
    }
  }

  async remember<T>(
    key: string,
    ttl: number,
    callback: () => Promise<T>,
    options: Omit<CacheOptions, 'ttl'> = {}
  ): Promise<T> {
    const cached = await this.get<T>(key, options.prefix);
    
    if (cached !== null) {
      return cached;
    }

    const fresh = await callback();
    await this.set(key, fresh, { ...options, ttl });
    
    return fresh;
  }

  async tags(tags: string[]): Promise<{
    get: <T>(key: string) => Promise<T | null>;
    set: (key: string, value: any, ttl?: number) => Promise<void>;
    delete: (key: string) => Promise<void>;
  }> {
    const prefix = tags.sort().join(':');
    
    return {
      get: <T>(key: string) => this.get<T>(key, prefix),
      set: (key: string, value: any, ttl?: number) => 
        this.set(key, value, { prefix, ttl }),
      delete: (key: string) => this.delete(key, prefix)
    };
  }

  async flush(): Promise<void> {
    try {
      await redis.flushdb();
    } catch (error) {
      logger.error('Cache flush error', { error });
    }
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await redis.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis ping error', { error });
      return false;
    }
  }
}

export const cache = Cache.getInstance();

// Cache decorators
export function Cached(
  keyPrefix: string,
  ttl?: number,
  invalidateOn?: string[]
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = `${keyPrefix}:${JSON.stringify(args)}`;
      
      return cache.remember(
        key,
        ttl || 300,
        () => originalMethod.apply(this, args),
        { prefix: target.constructor.name, invalidateOn }
      );
    };

    return descriptor;
  };
}

export function InvalidateCache(triggers: string[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      await Promise.all(
        triggers.map(trigger => cache.invalidate(trigger))
      );
      
      return result;
    };

    return descriptor;
  };
} 