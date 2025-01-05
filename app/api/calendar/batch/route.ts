/**
 * @fileoverview Batch operations for calendar events
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { NextRequest } from 'next/server';
import { validateRequest } from '@/lib/api';
import { rateLimit } from '@/lib/rate-limit';
import { cache } from '@/lib/cache';
import { calendarService } from '../service';
import { createEventSchema, updateEventSchema } from '../validation';
import { ApiError } from '@/lib/errors';
import { z } from 'zod';

const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 batch requests per windowMs
};

const batchCreateSchema = z.object({
  events: z.array(createEventSchema).max(100),
});

const batchUpdateSchema = z.object({
  events: z.array(updateEventSchema).max(100),
});

const batchDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).max(100),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    await rateLimit(request, RATE_LIMIT);

    const { user, body } = await validateRequest(request, batchCreateSchema);
    const { events } = body;

    // Process events in parallel with conflict checking
    const results = await Promise.allSettled(
      events.map(async (eventData) => {
        try {
          return await calendarService.createEvent(eventData, user);
        } catch (error) {
          return {
            error: true,
            data: eventData,
            message: error instanceof ApiError ? error.message : 'Failed to create event',
          };
        }
      })
    );

    // Invalidate relevant caches
    await cache.invalidatePattern(`calendar:${user.facilityId}:*`);

    // Format response
    const response = {
      successful: [] as any[],
      failed: [] as any[],
    };

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if ('error' in result.value) {
          response.failed.push(result.value);
        } else {
          response.successful.push(result.value);
        }
      } else {
        response.failed.push({
          error: true,
          data: events[index],
          message: result.reason?.message || 'Unknown error',
        });
      }
    });

    return Response.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Apply rate limiting
    await rateLimit(request, RATE_LIMIT);

    const { user, body } = await validateRequest(request, batchUpdateSchema);
    const { events } = body;

    // Process updates in parallel
    const results = await Promise.allSettled(
      events.map(async (eventData) => {
        try {
          return await calendarService.updateEvent(eventData.id, eventData, user);
        } catch (error) {
          return {
            error: true,
            data: eventData,
            message: error instanceof ApiError ? error.message : 'Failed to update event',
          };
        }
      })
    );

    // Invalidate relevant caches
    await cache.invalidatePattern(`calendar:${user.facilityId}:*`);

    // Format response
    const response = {
      successful: [] as any[],
      failed: [] as any[],
    };

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if ('error' in result.value) {
          response.failed.push(result.value);
        } else {
          response.successful.push(result.value);
        }
      } else {
        response.failed.push({
          error: true,
          data: events[index],
          message: result.reason?.message || 'Unknown error',
        });
      }
    });

    return Response.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Apply rate limiting
    await rateLimit(request, RATE_LIMIT);

    const { user, body } = await validateRequest(request, batchDeleteSchema);
    const { ids } = body;

    // Process deletions in parallel
    const results = await Promise.allSettled(
      ids.map(async (id) => {
        try {
          await calendarService.deleteEvent(id, user);
          return { id };
        } catch (error) {
          return {
            error: true,
            id,
            message: error instanceof ApiError ? error.message : 'Failed to delete event',
          };
        }
      })
    );

    // Invalidate relevant caches
    await cache.invalidatePattern(`calendar:${user.facilityId}:*`);

    // Format response
    const response = {
      successful: [] as string[],
      failed: [] as any[],
    };

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        if ('error' in result.value) {
          response.failed.push(result.value);
        } else {
          response.successful.push(result.value.id);
        }
      } else {
        response.failed.push({
          error: true,
          message: result.reason?.message || 'Unknown error',
        });
      }
    });

    return Response.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
