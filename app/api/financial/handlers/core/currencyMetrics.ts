/**
 * @fileoverview Currency Metrics Handler
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Metrics and monitoring handler for currency operations
 */

import { Redis } from '@/lib/redis';
import { Logger } from '@/lib/logger';
import { Metrics } from '@/lib/metrics';
import { SupportedCurrency } from './types';

const logger = new Logger('currency-metrics');
const redis = new Redis();
const metrics = new Metrics('currency_operations');

const METRIC_KEYS = {
  CONVERSION_COUNT: 'currency_conversion_count',
  CONVERSION_AMOUNT: 'currency_conversion_amount',
  CACHE_HIT: 'currency_cache_hit',
  CACHE_MISS: 'currency_cache_miss',
  API_ERROR: 'currency_api_error',
  RATE_LIMIT: 'currency_rate_limit',
  OFFLINE_QUEUE: 'currency_offline_queue',
} as const;

const RATE_LIMIT = {
  WINDOW: 60, // 1 minute
  MAX_REQUESTS: 100, // per window
  BURST: 10, // max burst
} as const;

interface ConversionMetric {
  fromCurrency: SupportedCurrency;
  toCurrency: SupportedCurrency;
  amount: number;
  timestamp: string;
  organizationId: string;
  userId: string;
  duration: number;
  success: boolean;
  error?: string;
}

export async function trackConversion(metric: ConversionMetric): Promise<void> {
  try {
    // Record conversion count
    await metrics.increment(METRIC_KEYS.CONVERSION_COUNT, {
      fromCurrency: metric.fromCurrency,
      toCurrency: metric.toCurrency,
      organizationId: metric.organizationId,
      success: metric.success,
    });

    // Record conversion amount
    await metrics.histogram(METRIC_KEYS.CONVERSION_AMOUNT, metric.amount, {
      fromCurrency: metric.fromCurrency,
      toCurrency: metric.toCurrency,
      organizationId: metric.organizationId,
    });

    // Record operation duration
    await metrics.timing('currency_conversion_duration', metric.duration, {
      fromCurrency: metric.fromCurrency,
      toCurrency: metric.toCurrency,
      organizationId: metric.organizationId,
    });

    // Store detailed metric for analytics
    await storeConversionMetric(metric);

    logger.info('Conversion metric tracked successfully', {
      fromCurrency: metric.fromCurrency,
      toCurrency: metric.toCurrency,
      success: metric.success,
    });
  } catch (error) {
    logger.error('Failed to track conversion metric', error);
  }
}

export async function trackCacheOperation(hit: boolean, context: Record<string, any>): Promise<void> {
  try {
    await metrics.increment(hit ? METRIC_KEYS.CACHE_HIT : METRIC_KEYS.CACHE_MISS, context);
  } catch (error) {
    logger.error('Failed to track cache operation', error);
  }
}

export async function trackApiError(error: Error, context: Record<string, any>): Promise<void> {
  try {
    await metrics.increment(METRIC_KEYS.API_ERROR, {
      ...context,
      errorType: error.name,
      errorMessage: error.message,
    });
  } catch (err) {
    logger.error('Failed to track API error', err);
  }
}

export async function checkRateLimit(key: string): Promise<boolean> {
  const now = Date.now();
  const windowKey = `${key}:${Math.floor(now / (RATE_LIMIT.WINDOW * 1000))}`;

  try {
    const pipeline = redis.pipeline();
    pipeline.incr(windowKey);
    pipeline.expire(windowKey, RATE_LIMIT.WINDOW);
    
    const results = await pipeline.exec();
    const requestCount = results?.[0]?.[1] as number;

    if (requestCount > RATE_LIMIT.MAX_REQUESTS) {
      await metrics.increment(METRIC_KEYS.RATE_LIMIT, { key });
      return false;
    }

    // Check burst rate
    const burstKey = `${key}:burst`;
    const burstCount = await redis.incr(burstKey);
    await redis.expire(burstKey, 1); // 1 second window for burst

    if (burstCount > RATE_LIMIT.BURST) {
      await metrics.increment(METRIC_KEYS.RATE_LIMIT, { key, type: 'burst' });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Rate limit check failed', error);
    return true; // Fail open if rate limiting fails
  }
}

export async function getMetricsSummary(organizationId: string, period: string): Promise<any> {
  try {
    const [
      conversionStats,
      cacheStats,
      errorStats,
      rateLimitStats,
    ] = await Promise.all([
      getConversionStats(organizationId, period),
      getCacheStats(organizationId, period),
      getErrorStats(organizationId, period),
      getRateLimitStats(organizationId, period),
    ]);

    return {
      conversions: conversionStats,
      cache: cacheStats,
      errors: errorStats,
      rateLimit: rateLimitStats,
      period,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Failed to generate metrics summary', error);
    throw error;
  }
}

// Helper functions
async function storeConversionMetric(metric: ConversionMetric): Promise<void> {
  const key = `conversion_metrics:${metric.organizationId}:${new Date().toISOString().slice(0, 7)}`;
  await redis.rpush(key, JSON.stringify(metric));
  await redis.expire(key, 60 * 60 * 24 * 90); // 90 days retention
}

async function getConversionStats(organizationId: string, period: string): Promise<any> {
  const key = `conversion_metrics:${organizationId}:${period}`;
  const metrics = await redis.lrange(key, 0, -1);
  
  return metrics.reduce((acc, metric) => {
    const data = JSON.parse(metric);
    const pair = `${data.fromCurrency}-${data.toCurrency}`;
    
    acc.totalCount = (acc.totalCount || 0) + 1;
    acc.totalAmount = (acc.totalAmount || 0) + data.amount;
    acc.successCount = (acc.successCount || 0) + (data.success ? 1 : 0);
    acc.averageDuration = (acc.averageDuration || 0) + data.duration;
    acc.currencyPairs = {
      ...acc.currencyPairs,
      [pair]: (acc.currencyPairs?.[pair] || 0) + 1,
    };

    return acc;
  }, {});
}

async function getCacheStats(organizationId: string, period: string): Promise<any> {
  return {
    hits: await metrics.getCount(METRIC_KEYS.CACHE_HIT, { organizationId, period }),
    misses: await metrics.getCount(METRIC_KEYS.CACHE_MISS, { organizationId, period }),
  };
}

async function getErrorStats(organizationId: string, period: string): Promise<any> {
  return {
    total: await metrics.getCount(METRIC_KEYS.API_ERROR, { organizationId, period }),
    byType: await metrics.getGroupedCount(METRIC_KEYS.API_ERROR, 'errorType', { organizationId, period }),
  };
}

async function getRateLimitStats(organizationId: string, period: string): Promise<any> {
  return {
    total: await metrics.getCount(METRIC_KEYS.RATE_LIMIT, { organizationId, period }),
    byType: await metrics.getGroupedCount(METRIC_KEYS.RATE_LIMIT, 'type', { organizationId, period }),
  };
} 