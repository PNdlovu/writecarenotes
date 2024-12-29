/**
 * @fileoverview Rate limiting middleware for organization endpoints
 * @version 1.0.0
 * @created 2024-03-21
 */

import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { TenantContext } from '@/lib/tenant';

// Create Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create rate limiter instances for different endpoints
const rateLimiters = {
  // General API endpoints: 100 requests per minute
  default: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'ratelimit:org:default',
  }),

  // Create/Update operations: 20 requests per minute
  write: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
    prefix: 'ratelimit:org:write',
  }),

  // Analytics endpoints: 30 requests per minute
  analytics: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'ratelimit:org:analytics',
  }),
};

/**
 * Rate limiting middleware for organization endpoints
 */
export async function organizationRateLimiting(
  request: NextRequest,
  context: TenantContext
) {
  try {
    const identifier = `${context.tenantId}:${context.userId}`;
    const path = request.nextUrl.pathname;
    const method = request.method;

    // Select appropriate rate limiter based on endpoint
    let rateLimiter = rateLimiters.default;

    if (path.includes('/analytics')) {
      rateLimiter = rateLimiters.analytics;
    } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      rateLimiter = rateLimiters.write;
    }

    // Check rate limit
    const { success, limit, reset, remaining } = await rateLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit,
          reset,
          remaining,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());

    return response;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Allow request to proceed if rate limiting fails
    return NextResponse.next();
  }
}

/**
 * Get current rate limit status for a tenant/user
 */
export async function getRateLimitStatus(context: TenantContext) {
  const identifier = `${context.tenantId}:${context.userId}`;
  const status = {
    default: await rateLimiters.default.pending(identifier),
    write: await rateLimiters.write.pending(identifier),
    analytics: await rateLimiters.analytics.pending(identifier),
  };

  return {
    default: {
      remaining: status.default.remaining,
      reset: status.default.reset,
      limit: status.default.limit,
    },
    write: {
      remaining: status.write.remaining,
      reset: status.write.reset,
      limit: status.write.limit,
    },
    analytics: {
      remaining: status.analytics.remaining,
      reset: status.analytics.reset,
      limit: status.analytics.limit,
    },
  };
} 