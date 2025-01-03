/**
 * @writecarenotes.com
 * @fileoverview Rate limiter middleware
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Redis-based rate limiter middleware for API endpoints.
 */

import { NextResponse } from 'next/server';
import { Redis } from 'ioredis';
import { logger } from '../services/logger';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  keyPrefix?: string;
  handler?: (req: Request) => Response;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
}

export function createRateLimiter(options: RateLimitOptions = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    keyPrefix = 'rate-limit:',
    skipFailedRequests = false,
    skipSuccessfulRequests = false,
    handler = (req: Request) => 
      NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      )
  } = options;

  return async function rateLimit(
    request: Request,
    response?: NextResponse
  ): Promise<NextResponse | undefined> {
    try {
      // Get client IP
      const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') ||
                'unknown';

      // Get current window
      const now = Date.now();
      const windowStart = now - (now % windowMs);
      
      const key = `${keyPrefix}${ip}:${windowStart}`;

      // Increment counter
      const counter = await redis.incr(key);
      
      // Set expiry on first request
      if (counter === 1) {
        await redis.pexpire(key, windowMs);
      }

      // Check if limit exceeded
      if (counter > max) {
        logger.warn('Rate limit exceeded', {
          ip,
          counter,
          limit: max,
          window: windowMs
        });
        
        return handler(request);
      }

      // Skip counting based on response status if needed
      if (response) {
        const status = response.status;
        if (
          (skipFailedRequests && status >= 400) ||
          (skipSuccessfulRequests && status < 400)
        ) {
          await redis.decr(key);
        }
      }

      // Add rate limit headers
      const headers = new Headers(response?.headers || {});
      headers.set('X-RateLimit-Limit', max.toString());
      headers.set('X-RateLimit-Remaining', Math.max(0, max - counter).toString());
      headers.set('X-RateLimit-Reset', (windowStart + windowMs).toString());

      if (response) {
        return NextResponse.json(
          await response.json(),
          { 
            status: response.status,
            headers
          }
        );
      }

      return undefined;
    } catch (error) {
      logger.error('Rate limiter error', { error });
      return undefined;
    }
  };
}

// Predefined rate limiters
export const defaultRateLimiter = createRateLimiter();

export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30 // 30 requests per minute
});

export const searchRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 searches per minute
  keyPrefix: 'rate-limit:search:'
});

export const adminRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute
  keyPrefix: 'rate-limit:admin:'
}); 
