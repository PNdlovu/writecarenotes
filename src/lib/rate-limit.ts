import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './cache'

// Rate limit configurations
export const RATE_LIMITS = {
  DEFAULT: {
    requests: 100,
    duration: '1 m'
  },
  HIGH_FREQUENCY: {
    requests: 300,
    duration: '1 m'
  },
  LOW_FREQUENCY: {
    requests: 50,
    duration: '1 m'
  }
} as const;

// Create rate limiters
export const rateLimiters = {
  default: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.DEFAULT.requests, RATE_LIMITS.DEFAULT.duration),
    analytics: true,
    prefix: 'ratelimit:default'
  }),
  highFrequency: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.HIGH_FREQUENCY.requests, RATE_LIMITS.HIGH_FREQUENCY.duration),
    analytics: true,
    prefix: 'ratelimit:high'
  }),
  lowFrequency: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.LOW_FREQUENCY.requests, RATE_LIMITS.LOW_FREQUENCY.duration),
    analytics: true,
    prefix: 'ratelimit:low'
  })
};

/**
 * Rate limiting middleware for API routes
 */
export async function withRateLimit(
  identifier: string,
  limiter: keyof typeof rateLimiters = 'default'
) {
  const { success, limit, reset, remaining } = await rateLimiters[limiter].limit(identifier);

  return {
    success,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString()
    }
  };
} 


