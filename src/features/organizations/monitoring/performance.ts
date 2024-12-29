/**
 * @fileoverview Performance monitoring for organization endpoints
 * @version 1.0.0
 * @created 2024-03-21
 */

import { NextRequest, NextResponse } from 'next/server';
import { TenantContext } from '@/lib/tenant';
import { Logger } from '@/lib/logger';
import { Metrics } from '@/lib/metrics';

const logger = new Logger('OrganizationPerformance');
const metrics = new Metrics('organizations');

// Performance thresholds in milliseconds
const THRESHOLDS = {
  LIST: 500,    // List organizations
  GET: 200,     // Get single organization
  CREATE: 1000, // Create organization
  UPDATE: 800,  // Update organization
  DELETE: 500,  // Delete organization
  ANALYTICS: 1000, // Analytics operations
};

/**
 * Performance monitoring middleware
 */
export async function performanceMonitoring(
  request: NextRequest,
  context: TenantContext,
  handler: () => Promise<NextResponse>
) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;

  try {
    // Execute the handler
    const response = await handler();
    
    // Calculate execution time
    const executionTime = performance.now() - startTime;
    
    // Get threshold based on operation
    let threshold = THRESHOLDS.GET;
    if (path.includes('/analytics')) {
      threshold = THRESHOLDS.ANALYTICS;
    } else if (method === 'GET' && !path.includes('/')) {
      threshold = THRESHOLDS.LIST;
    } else if (method === 'POST') {
      threshold = THRESHOLDS.CREATE;
    } else if (method === 'PATCH') {
      threshold = THRESHOLDS.UPDATE;
    } else if (method === 'DELETE') {
      threshold = THRESHOLDS.DELETE;
    }

    // Log and record metrics
    const tags = {
      tenantId: context.tenantId,
      path,
      method,
      status: response.status,
    };

    metrics.recordTiming('request_duration', executionTime, tags);
    metrics.increment('request_count', 1, tags);

    if (executionTime > threshold) {
      logger.warn('Slow organization operation', {
        path,
        method,
        executionTime,
        threshold,
        ...tags,
      });
      metrics.increment('slow_requests', 1, tags);
    }

    // Add performance headers
    response.headers.set('X-Response-Time', executionTime.toFixed(2));
    
    return response;
  } catch (error) {
    // Record error metrics
    metrics.increment('error_count', 1, {
      tenantId: context.tenantId,
      path,
      method,
      error: error.name,
    });

    logger.error('Organization operation failed', {
      path,
      method,
      error,
      executionTime: performance.now() - startTime,
    });

    throw error;
  }
}

/**
 * Get performance metrics for an organization
 */
export async function getOrganizationMetrics(
  organizationId: string,
  context: TenantContext,
  timeRange: { start: Date; end: Date }
) {
  try {
    const tags = { organizationId, tenantId: context.tenantId };
    
    const [
      requestCounts,
      errorCounts,
      timings,
      slowRequests
    ] = await Promise.all([
      metrics.getCount('request_count', tags, timeRange),
      metrics.getCount('error_count', tags, timeRange),
      metrics.getTimings('request_duration', tags, timeRange),
      metrics.getCount('slow_requests', tags, timeRange),
    ]);

    return {
      requests: {
        total: requestCounts.total,
        byMethod: requestCounts.byTag.get('method'),
        byPath: requestCounts.byTag.get('path'),
      },
      errors: {
        total: errorCounts.total,
        byType: errorCounts.byTag.get('error'),
      },
      performance: {
        averageResponseTime: timings.average,
        p95ResponseTime: timings.p95,
        p99ResponseTime: timings.p99,
        slowRequests: slowRequests.total,
      },
      timeRange: {
        start: timeRange.start,
        end: timeRange.end,
      },
    };
  } catch (error) {
    logger.error('Failed to get organization metrics', {
      organizationId,
      error,
    });
    throw error;
  }
}

/**
 * Set custom performance threshold for an organization
 */
export function setCustomThreshold(
  operation: keyof typeof THRESHOLDS,
  threshold: number
) {
  if (threshold < 0) {
    throw new Error('Threshold must be positive');
  }
  THRESHOLDS[operation] = threshold;
} 