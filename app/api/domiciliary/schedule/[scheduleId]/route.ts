/**
 * @writecarenotes.com
 * @fileoverview Individual schedule management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API endpoints for managing individual domiciliary care schedules, including
 * detailed operations, visit management, and route adjustments. Implements
 * comprehensive schedule management with full compliance tracking.
 *
 * Features:
 * - Individual schedule management
 * - Visit reassignment
 * - Route adjustment
 * - Staff availability check
 * - Client preference validation
 * - Compliance monitoring
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
const visitReassignmentSchema = z.object({
  visitId: z.string(),
  newStaffId: z.string(),
  reason: z.string(),
  adjustAdjacentVisits: z.boolean().optional(),
});

const routeAdjustmentSchema = z.object({
  staffId: z.string(),
  date: z.string(),
  optimizationPreferences: z.object({
    prioritizeClientPreferences: z.boolean(),
    maxTravelTime: z.number(),
    considerQualifications: z.boolean(),
  }),
});

const scheduleExceptionSchema = z.object({
  type: z.enum(['STAFF_UNAVAILABLE', 'CLIENT_CANCELLATION', 'EMERGENCY', 'OTHER']),
  startDate: z.string(),
  endDate: z.string().optional(),
  affectedVisits: z.array(z.string()),
  reason: z.string(),
  resolution: z.enum(['REASSIGN', 'CANCEL', 'RESCHEDULE']),
  notes: z.string().optional(),
});

interface RouteParams {
  params: {
    scheduleId: string;
  };
  searchParams: {
    organizationId: string;
  };
}

/**
 * GET /api/domiciliary/schedule/[scheduleId]
 * Retrieves detailed schedule information
 */
export async function GET(
  req: NextRequest,
  { params, searchParams }: RouteParams
) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'schedule_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { scheduleId } = params;
    const { organizationId } = searchParams;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get schedule details
    const schedule = await scheduleService.getScheduleDetails(scheduleId, organizationId);

    // Handle offline sync
    const offlineData = await handleOfflineSync(req, 'schedule_details', schedule);

    // Audit log
    await auditLog.record({
      action: 'schedule_details_retrieved',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { scheduleId }
    });

    return NextResponse.json(offlineData || schedule);
  } catch (error) {
    console.error('Schedule detail retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/domiciliary/schedule/[scheduleId]/reassign
 * Reassigns a visit to a different staff member
 */
export async function POST(
  req: NextRequest,
  { params, searchParams }: RouteParams
) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'schedule_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { scheduleId } = params;
    const { organizationId } = searchParams;

    // Validate request body
    const body = await req.json();
    const data = visitReassignmentSchema.parse(body);

    // Validate staff availability and qualifications
    const validationResult = await scheduleService.validateReassignment({
      scheduleId,
      organizationId,
      ...data
    });

    if (!validationResult.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.errors },
        { status: 400 }
      );
    }

    // Reassign visit
    const updatedSchedule = await scheduleService.reassignVisit({
      scheduleId,
      organizationId,
      ...data
    });

    // Optimize route if needed
    if (data.adjustAdjacentVisits) {
      await routeOptimizer.optimizeStaffRoute({
        scheduleId,
        staffId: data.newStaffId,
        date: updatedSchedule.date
      });
    }

    // Audit log
    await auditLog.record({
      action: 'visit_reassigned',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: {
        scheduleId,
        visitId: data.visitId,
        newStaffId: data.newStaffId,
        reason: data.reason
      }
    });

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('Visit reassignment error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/domiciliary/schedule/[scheduleId]/route
 * Adjusts route for a specific staff member
 */
export async function PUT(
  req: NextRequest,
  { params, searchParams }: RouteParams
) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'schedule_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { scheduleId } = params;
    const { organizationId } = searchParams;

    // Validate request body
    const body = await req.json();
    const data = routeAdjustmentSchema.parse(body);

    // Optimize route
    const optimizedRoute = await routeOptimizer.optimizeStaffRoute({
      scheduleId,
      organizationId,
      ...data
    });

    // Update schedule with optimized route
    const updatedSchedule = await scheduleService.updateRoute({
      scheduleId,
      organizationId,
      staffId: data.staffId,
      route: optimizedRoute
    });

    // Audit log
    await auditLog.record({
      action: 'route_adjusted',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { scheduleId, staffId: data.staffId, date: data.date }
    });

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('Route adjustment error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/domiciliary/schedule/[scheduleId]
 * Handles schedule exceptions (cancellations, emergencies)
 */
export async function DELETE(
  req: NextRequest,
  { params, searchParams }: RouteParams
) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'schedule_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { scheduleId } = params;
    const { organizationId } = searchParams;

    // Validate request body
    const body = await req.json();
    const data = scheduleExceptionSchema.parse(body);

    // Handle schedule exception
    const result = await scheduleService.handleException({
      scheduleId,
      organizationId,
      ...data
    });

    // Audit log
    await auditLog.record({
      action: 'schedule_exception_handled',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: {
        scheduleId,
        type: data.type,
        resolution: data.resolution,
        affectedVisits: data.affectedVisits.length
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Schedule exception handling error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 