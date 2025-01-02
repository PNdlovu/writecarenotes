/**
 * @writecarenotes.com
 * @fileoverview Domiciliary care visit management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API endpoints for managing domiciliary care visits, including scheduling,
 * route optimization, visit logging, and compliance tracking. Supports both
 * real-time and offline operations with comprehensive validation.
 *
 * Features:
 * - Visit scheduling and management
 * - Route optimization
 * - Staff assignment
 * - Visit verification
 * - Compliance tracking
 * - Offline support
 *
 * Mobile-First Considerations:
 * - Optimized payload size
 * - Offline-first architecture
 * - Location services integration
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
import { VisitService } from '@/features/domiciliary/services/visitService';
import { RouteOptimizer } from '@/features/domiciliary/services/routeOptimizer';
import { rateLimit } from '@/lib/rateLimit';
import { auditLog } from '@/lib/audit';
import { validateVisitCompliance } from '@/lib/compliance';
import { handleOfflineSync } from '@/lib/offline';

// Initialize services
const visitService = new VisitService();
const routeOptimizer = new RouteOptimizer();

// Validation schemas
const visitSchema = z.object({
  organizationId: z.string(),
  clientId: z.string(),
  scheduledStart: z.string(),
  duration: z.number(),
  tasks: z.array(z.object({
    type: z.string(),
    description: z.string(),
    duration: z.number(),
    requiresQualification: z.boolean().optional(),
  })),
  staffRequirements: z.object({
    count: z.number(),
    qualifications: z.array(z.string()).optional(),
    gender: z.enum(['MALE', 'FEMALE', 'ANY']).optional(),
    preferredStaff: z.array(z.string()).optional(),
  }),
  location: z.object({
    address: z.string(),
    postcode: z.string(),
    accessNotes: z.string().optional(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
  }),
  recurrence: z.object({
    pattern: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    interval: z.number().optional(),
    endDate: z.string().optional(),
  }).optional(),
});

const visitUpdateSchema = visitSchema.partial().extend({
  visitId: z.string(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'MISSED']).optional(),
  actualStart: z.string().optional(),
  actualEnd: z.string().optional(),
  notes: z.string().optional(),
  staffAssigned: z.array(z.string()).optional(),
});

/**
 * GET /api/domiciliary/visits
 * Retrieves visits based on query parameters
 */
export async function GET(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'visits_api');
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
    const status = searchParams.get('status');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get visits
    const visits = await visitService.getVisits({
      organizationId,
      startDate,
      endDate,
      staffId,
      clientId,
      status
    });

    // Handle offline sync if needed
    const offlineData = await handleOfflineSync(req, 'visits', visits);

    // Audit log
    await auditLog.record({
      action: 'visits_retrieved',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { filters: { startDate, endDate, staffId, clientId, status } }
    });

    return NextResponse.json(offlineData || visits);
  } catch (error) {
    console.error('Visit retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/domiciliary/visits
 * Creates new visits with optional route optimization
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'visits_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Validate request body
    const body = await req.json();
    const data = visitSchema.parse(body);

    // Validate compliance
    const complianceResult = await validateVisitCompliance({
      organizationId: data.organizationId,
      clientId: data.clientId,
      tasks: data.tasks
    });

    if (!complianceResult.valid) {
      return NextResponse.json(
        { error: 'Compliance validation failed', details: complianceResult.errors },
        { status: 400 }
      );
    }

    // Create visit
    const visit = await visitService.createVisit(data);

    // Optimize routes if needed
    if (data.staffRequirements.preferredStaff) {
      await routeOptimizer.optimizeRoutes({
        organizationId: data.organizationId,
        date: data.scheduledStart,
        staffIds: data.staffRequirements.preferredStaff
      });
    }

    // Audit log
    await auditLog.record({
      action: 'visit_created',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId: data.organizationId,
      details: { visitId: visit.id, clientId: data.clientId }
    });

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error('Visit creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/domiciliary/visits
 * Updates existing visits
 */
export async function PUT(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'visits_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Validate request body
    const body = await req.json();
    const data = visitUpdateSchema.parse(body);

    // Update visit
    const visit = await visitService.updateVisit(data.visitId, data);

    // Audit log
    await auditLog.record({
      action: 'visit_updated',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId: data.organizationId,
      details: { visitId: data.visitId, changes: data }
    });

    return NextResponse.json(visit);
  } catch (error) {
    console.error('Visit update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 