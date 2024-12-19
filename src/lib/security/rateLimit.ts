import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || '',
  token: process.env.UPSTASH_REDIS_TOKEN || '',
});

interface RateLimitConfig {
  windowMs: number;    // Time window in milliseconds
  maxRequests: number; // Maximum number of requests allowed in the window
}

const defaultLimits: Record<string, RateLimitConfig> = {
  DEFAULT: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100,         // 100 requests per minute
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,           // 5 login attempts
  },
  API: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 50,          // 50 API requests per minute
  },
};

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = defaultLimits.DEFAULT
) {
  try {
    const ip = request.ip || 'unknown';
    const path = request.nextUrl.pathname;
    
    // Determine which rate limit to apply
    let limitConfig = defaultLimits.DEFAULT;
    if (path.startsWith('/api/auth')) {
      limitConfig = defaultLimits.AUTH;
    } else if (path.startsWith('/api/')) {
      limitConfig = defaultLimits.API;
    }

    // Create a unique key for this IP and endpoint type
    const key = `ratelimit:${ip}:${path.split('/')[1]}`;

    // Get the current window data
    const now = Date.now();
    const windowStart = now - limitConfig.windowMs;

    // Get the current request count
    const requests = await redis.zcount(key, windowStart, now);

    if (requests >= limitConfig.maxRequests) {
      return {
        success: false,
        remaining: 0,
        reset: windowStart + limitConfig.windowMs,
      };
    }

    // Add this request to the sorted set with score as current timestamp
    await redis.zadd(key, { score: now, member: now.toString() });
    
    // Remove old entries
    await redis.zremrangebyscore(key, 0, windowStart);
    
    // Set expiry on the key
    await redis.expire(key, Math.floor(limitConfig.windowMs / 1000));

    return {
      success: true,
      remaining: limitConfig.maxRequests - requests - 1,
      reset: windowStart + limitConfig.windowMs,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // On error, allow the request through but log the error
    return {
      success: true,
      remaining: 0,
      reset: Date.now(),
    };
  }
}


