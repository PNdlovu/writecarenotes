import { Request, Response, NextFunction } from 'express';
import { TelehealthError } from '../errors/TelehealthError';
import { Redis } from 'ioredis';

interface RateLimitConfig {
  endpoint: string;
  limit: number;
  window: number; // in seconds
}

const rateLimits: RateLimitConfig[] = [
  {
    endpoint: '/consultations',
    limit: 100,
    window: 3600 // 1 hour
  },
  {
    endpoint: '/video-sessions',
    limit: 50,
    window: 3600
  },
  {
    endpoint: '/monitoring/start',
    limit: 20,
    window: 3600
  },
  {
    endpoint: '/documents',
    limit: 200,
    window: 3600
  },
  {
    endpoint: '/reports',
    limit: 50,
    window: 3600
  }
];

export function rateLimitMiddleware(redis: Redis) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) {
        throw new TelehealthError('Organization context required', 400);
      }

      // Find matching rate limit config
      const config = rateLimits.find(limit => 
        req.path.startsWith(limit.endpoint)
      );

      if (!config) {
        // No rate limit for this endpoint
        return next();
      }

      const key = `ratelimit:${organizationId}:${config.endpoint}`;
      const count = await redis.incr(key);

      // Set expiry on first request
      if (count === 1) {
        await redis.expire(key, config.window);
      }

      // Get remaining time window
      const ttl = await redis.ttl(key);

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': config.limit.toString(),
        'X-RateLimit-Remaining': Math.max(0, config.limit - count).toString(),
        'X-RateLimit-Reset': (Date.now() + ttl * 1000).toString()
      });

      if (count > config.limit) {
        throw new TelehealthError('Rate limit exceeded', 429);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Organization quota middleware
export function quotaMiddleware(redis: Redis) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) {
        throw new TelehealthError('Organization context required', 400);
      }

      // Get organization quota
      const quota = await getOrganizationQuota(organizationId);
      
      // Check monthly usage
      const usageKey = `quota:${organizationId}:${new Date().toISOString().slice(0, 7)}`;
      const usage = parseInt(await redis.get(usageKey) || '0');

      if (usage >= quota) {
        throw new TelehealthError('Monthly quota exceeded', 429);
      }

      // Set quota headers
      res.set({
        'X-Organization-Quota-Limit': quota.toString(),
        'X-Organization-Quota-Used': usage.toString(),
        'X-Organization-Quota-Remaining': (quota - usage).toString()
      });

      // Increment usage after successful request
      res.on('finish', () => {
        if (res.statusCode < 400) {
          redis.incr(usageKey);
          redis.expire(usageKey, 60 * 60 * 24 * 31); // 31 days
        }
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}

async function getOrganizationQuota(organizationId: string): Promise<number> {
  // Implementation will depend on your organization management system
  // Example: Return default quota
  return 10000;
} 