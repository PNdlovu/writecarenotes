/**
 * @fileoverview API Middleware for Accounting Routes
 * @version 1.0.0
 * @created 2024-03-21
 */

import { NextResponse } from 'next/server';
import { metrics } from '@/lib/metrics';
import { rateLimit } from '@/lib/rate-limit';
import { validateToken } from '@/lib/auth';
import { logger } from '@/lib/logger';

export interface ApiContext {
  organizationId: string;
  userId: string;
  permissions: string[];
}

export async function withApiMiddleware(
  request: Request,
  handler: (context: ApiContext) => Promise<NextResponse>
) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Rate limiting
    const rateLimitResult = await rateLimit.check(request);
    if (!rateLimitResult.success) {
      metrics.increment('api.rate_limit.exceeded');
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      metrics.increment('api.auth.missing_token');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const authResult = await validateToken(token);
    if (!authResult.valid) {
      metrics.increment('api.auth.invalid_token');
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Context validation
    const organizationId = request.headers.get('x-organization-id');
    if (!organizationId) {
      metrics.increment('api.context.missing_org');
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      );
    }

    // Create API context
    const context: ApiContext = {
      organizationId,
      userId: authResult.userId,
      permissions: authResult.permissions
    };

    // Execute handler
    const response = await handler(context);

    // Log request
    logger.info('API Request', {
      requestId,
      method: request.method,
      path: new URL(request.url).pathname,
      statusCode: response.status,
      duration: Date.now() - startTime,
      userId: context.userId,
      organizationId: context.organizationId
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-Request-ID', requestId);

    // Record metrics
    metrics.recordTiming('api.request.duration', Date.now() - startTime, {
      path: new URL(request.url).pathname,
      method: request.method,
      status: response.status.toString()
    });

    return response;
  } catch (error) {
    // Log error
    logger.error('API Error', {
      requestId,
      error,
      method: request.method,
      path: new URL(request.url).pathname,
      duration: Date.now() - startTime
    });

    // Record error metric
    metrics.increment('api.error', 1, {
      path: new URL(request.url).pathname,
      method: request.method,
      type: error.name
    });

    // Return error response
    return NextResponse.json(
      { error: 'Internal server error', requestId },
      { status: 500 }
    );
  }
} 