/**
 * @fileoverview Calendar API routes for managing calendar events
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { NextRequest } from 'next/server';
import { validateRequest } from '@/lib/api';
import { rateLimit } from '@/lib/rate-limit';
import { cache } from '@/lib/cache';
import { calendarService } from './service';
import { createEventSchema, updateEventSchema } from './validation';
import { ApiError } from '@/lib/errors';

const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
};

const CACHE_CONFIG = {
  ttl: 5 * 60, // 5 minutes
  staleWhileRevalidate: 60, // 1 minute
};

export const runtime = 'edge';
export const preferredRegion = 'auto';

// API Version Header Check
function checkApiVersion(request: NextRequest) {
  const version = request.headers.get('x-api-version');
  if (!version || version !== '2024-03') {
    throw new ApiError(400, 'Invalid or missing API version. Please use x-api-version: 2024-03');
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check API version
    checkApiVersion(request);

    // Apply rate limiting
    await rateLimit(request, RATE_LIMIT);

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const facilityId = searchParams.get('facilityId');

    // Generate cache key
    const cacheKey = `calendar:${facilityId}:${startDate}:${endDate}`;

    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return Response.json(cachedData);
    }

    // Get fresh data
    const events = await calendarService.getEvents({ startDate, endDate });

    // Cache the result
    await cache.set(cacheKey, events, CACHE_CONFIG);

    return Response.json(events);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check API version
    checkApiVersion(request);

    // Apply rate limiting
    await rateLimit(request, RATE_LIMIT);

    const { user, body } = await validateRequest(request, createEventSchema);
    const event = await calendarService.createEvent(body, user);

    // Invalidate relevant caches
    await cache.invalidatePattern(`calendar:${user.facilityId}:*`);

    return Response.json(event);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check API version
    checkApiVersion(request);

    // Apply rate limiting
    await rateLimit(request, RATE_LIMIT);

    const { user, body } = await validateRequest(request, updateEventSchema);
    const { id } = body;
    const event = await calendarService.updateEvent(id, body, user);

    // Invalidate relevant caches
    await cache.invalidatePattern(`calendar:${user.facilityId}:*`);

    return Response.json(event);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check API version
    checkApiVersion(request);

    // Apply rate limiting
    await rateLimit(request, RATE_LIMIT);

    const { user, body } = await validateRequest(request);
    const { id } = body;
    await calendarService.deleteEvent(id, user);

    // Invalidate relevant caches
    await cache.invalidatePattern(`calendar:${user.facilityId}:*`);

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
