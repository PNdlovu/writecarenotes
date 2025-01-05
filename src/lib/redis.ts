/**
 * @fileoverview Redis client configuration with error handling
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

import { Redis } from 'ioredis';
import { Logger } from './logger';

const logger = new Logger({ service: 'redis' });

class RedisClient {
  private static instance: Redis | null = null;
  private static isConnecting = false;
  private static connectionPromise: Promise<Redis> | null = null;

  static async getInstance(): Promise<Redis | null> {
    if (!process.env.REDIS_HOST) {
      logger.warn('Redis host not configured, running without cache');
      return null;
    }

    if (this.instance) {
      return this.instance;
    }

    if (this.isConnecting) {
      return this.connectionPromise;
    }

    try {
      this.isConnecting = true;
      this.connectionPromise = this.connect();
      this.instance = await this.connectionPromise;
      this.isConnecting = false;
      return this.instance;
    } catch (error) {
      logger.error('Failed to connect to Redis', error as Error);
      this.isConnecting = false;
      return null;
    }
  }

  private static async connect(): Promise<Redis> {
    return new Promise((resolve, reject) => {
      const redis = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        retryStrategy(times) {
          if (times > 3) {
            logger.error(`Redis retry limit exceeded after ${times} attempts`);
            return null;
          }
          const delay = Math.min(times * 200, 2000);
          logger.warn(`Retrying Redis connection in ${delay}ms`);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        reconnectOnError(err) {
          logger.error('Redis connection error', err);
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        }
      });

      redis.on('connect', () => {
        logger.info('Redis connected successfully');
        resolve(redis);
      });

      redis.on('error', (error) => {
        logger.error('Redis error', error);
        if (!this.instance) {
          reject(error);
        }
      });

      redis.on('close', () => {
        logger.warn('Redis connection closed');
      });

      redis.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

      // Timeout if connection takes too long
      setTimeout(() => {
        if (!this.instance) {
          reject(new Error('Redis connection timeout'));
        }
      }, 5000);
    });
  }

  static async set(key: string, value: any, ttl?: number): Promise<void> {
    const redis = await this.getInstance();
    if (!redis) return;

    try {
      if (ttl) {
        await redis.setex(key, ttl, JSON.stringify(value));
      } else {
        await redis.set(key, JSON.stringify(value));
      }
    } catch (error) {
      logger.error('Redis set error', error as Error);
    }
  }

  static async get(key: string): Promise<any | null> {
    const redis = await this.getInstance();
    if (!redis) return null;

    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error', error as Error);
      return null;
    }
  }

  static async delete(key: string): Promise<void> {
    const redis = await this.getInstance();
    if (!redis) return;

    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Redis delete error', error as Error);
    }
  }

  static async clearCache(pattern: string): Promise<void> {
    const redis = await this.getInstance();
    if (!redis) return;

    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`Cleared ${keys.length} cache keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error('Redis clear cache error', error as Error);
    }
  }
}

export const redis = RedisClient; 


