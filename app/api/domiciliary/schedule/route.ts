/**
 * @writecarenotes.com
 * @fileoverview Domiciliary schedule management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API endpoints for managing domiciliary care schedules, including staff
 * scheduling, visit assignments, and route optimization. Implements
 * comprehensive schedule management with full compliance tracking.
 *
 * Features:
 * - Schedule management
 * - Visit assignments
 * - Route optimization
 * - Staff availability
 * - Client preferences
 * - Compliance tracking
 *
 * Mobile-First Considerations:
 * - Optimized response size
 * - Offline data sync
 * - Location services
 * - Battery-efficient updates
 *
 * Enterprise Features:
 * - Regulatory compliance
 * - Audit logging
 * - Error tracking
 * - Performance monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ScheduleService } from '@/features/domiciliary/services/scheduleService';
import { RouteOptimizer } from '@/features/domiciliary/services/routeOptimizer';
import { rateLimit } from '@/lib/rateLimit';
import { auditLog } from '@/lib/audit';
import { validateScheduleCompliance } from '@/lib/compliance';
import { handleOfflineSync } from '@/lib/offline';

// Initialize services
const scheduleService = new ScheduleService();
const routeOptimizer = new RouteOptimizer();

// Validation schemas
const scheduleSchema = z.object({
  organizationId: z.string(),
  period: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  staffAssignments: z.array(z.object({
    staffId: z.string(),
    visits: z.array(z.object({
      visitId: z.string(),
      scheduledStart: z.string(),
      scheduledEnd: z.string(),
      clientId: z.string(),
      location: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }),
    })),
  })),
  optimizationPreferences: z.object({
    prioritizeClientPreferences: z.boolean(),
    maxTravelTime: z.number(),
    balanceWorkload: z.boolean(),
    considerQualifications: z.boolean(),
  }).optional(),
});

const scheduleUpdateSchema = z.object({
  organizationId: z.string(),
  changes: z.array(z.object({
    visitId: z.string(),
    staffId: z.string().optional(),
    scheduledStart: z.string().optional(),
    scheduledEnd: z.string().optional(),
    reason: z.string(),
  })),
});

/**
 * GET /api/domiciliary/schedule
 * Retrieves schedule based on query parameters
 */
export async function GET(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'schedule_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const staffId = searchParams.get('staffId');
    const clientId = searchParams.get('clientId');
    const area = searchParams.get('area');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get schedule
    const schedule = await scheduleService.getSchedule({
      organizationId,
      startDate,
      endDate,
      staffId,
      clientId,
      area
    });

    // Handle offline sync
    const offlineData = await handleOfflineSync(req, 'schedule', schedule);

    // Audit log
    await auditLog.record({
      action: 'schedule_retrieved',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { filters: { startDate, endDate, staffId, clientId, area } }
    });

    return NextResponse.json(offlineData || schedule);
  } catch (error) {
    console.error('Schedule retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/domiciliary/schedule
 * Creates a new schedule with route optimization
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'schedule_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Validate request body
    const body = await req.json();
    const data = scheduleSchema.parse(body);

    // Validate compliance
    const complianceResult = await validateScheduleCompliance({
      organizationId: data.organizationId,
      scheduleData: data
    });

    if (!complianceResult.valid) {
      return NextResponse.json(
        { error: 'Compliance validation failed', details: complianceResult.errors },
        { status: 400 }
      );
    }

    // Optimize routes if preferences provided
    let optimizedSchedule = data;
    if (data.optimizationPreferences) {
      optimizedSchedule = await routeOptimizer.optimizeSchedule(data);
    }

    // Create schedule
    const schedule = await scheduleService.createSchedule(optimizedSchedule);

    // Audit log
    await auditLog.record({
      action: 'schedule_created',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId: data.organizationId,
      details: { period: data.period, staffCount: data.staffAssignments.length }
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Schedule creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/domiciliary/schedule
 * Updates existing schedule
 */
export async function PUT(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'schedule_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Validate request body
    const body = await req.json();
    const data = scheduleUpdateSchema.parse(body);

    // Update schedule
    const schedule = await scheduleService.updateSchedule(data);

    // Audit log
    await auditLog.record({
      action: 'schedule_updated',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId: data.organizationId,
      details: { changes: data.changes.length }
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Schedule update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 
