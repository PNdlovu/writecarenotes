/**
 * @fileoverview Database Utilities
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Initialize Redis Client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Custom error class for database operations
export class DatabaseError extends Error {
  constructor(message: string, public code?: string, public cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Cache wrapper for database operations
export async function withCache<T>(
  key: string,
  operation: () => Promise<T>,
  ttl: number = 300 // 5 minutes default
): Promise<T> {
  try {
    // Try to get from cache first
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // If not in cache, execute operation
    const result = await operation();

    // Store in cache
    await redis.setex(key, ttl, JSON.stringify(result));

    return result;
  } catch (error) {
    throw new DatabaseError(
      'Cache operation failed',
      'CACHE_ERROR',
      error as Error
    );
  }
}

// Batch operation handler
export async function batch<T>(
  operations: (() => Promise<T>)[],
  options: { maxConcurrent?: number; continueOnError?: boolean } = {}
): Promise<T[]> {
  const { maxConcurrent = 5, continueOnError = false } = options;
  const results: T[] = [];
  const errors: Error[] = [];

  // Process operations in batches
  for (let i = 0; i < operations.length; i += maxConcurrent) {
    const batch = operations.slice(i, i + maxConcurrent);
    const batchPromises = batch.map(async (operation) => {
      try {
        return await operation();
      } catch (error) {
        if (!continueOnError) {
          throw error;
        }
        errors.push(error as Error);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter((r): r is T => r !== null));
  }

  if (errors.length > 0 && !continueOnError) {
    throw new DatabaseError(
      'Batch operation failed',
      'BATCH_ERROR',
      new AggregateError(errors)
    );
  }

  return results;
}

// Database transaction wrapper
export async function transaction<T>(
  operations: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(operations);
  } catch (error) {
    throw new DatabaseError(
      'Transaction failed',
      'TRANSACTION_ERROR',
      error as Error
    );
  }
}

// Cache invalidation helper
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    throw new DatabaseError(
      'Cache invalidation failed',
      'CACHE_INVALIDATION_ERROR',
      error as Error
    );
  }
}

// Export database instance with common operations
export const db = {
  ...prisma,
  withCache,
  batch,
  transaction,
  invalidateCache,
}; 


