/**
 * @writecarenotes.com
 * @fileoverview Individual visit management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API endpoints for managing individual domiciliary care visits, including
 * detailed operations, status updates, and evidence collection. Supports
 * both online and offline operations with full compliance tracking.
 *
 * Features:
 * - Individual visit management
 * - Status updates and tracking
 * - Evidence collection
 * - Task completion logging
 * - Location verification
 * - Compliance monitoring
 *
 * Mobile-First Considerations:
 * - Optimized response size
 * - Offline data sync
 * - Battery-efficient location checks
 * - Compressed media handling
 *
 * Enterprise Features:
 * - Compliance validation
 * - Evidence verification
 * - Audit logging
 * - Error tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { VisitService } from '@/features/domiciliary/services/visitService';
import { rateLimit } from '@/lib/rateLimit';
import { auditLog } from '@/lib/audit';
import { validateVisitCompliance } from '@/lib/compliance';
import { handleOfflineSync } from '@/lib/offline';
import { verifyLocation } from '@/lib/location';

// Initialize services
const visitService = new VisitService();

// Validation schemas
const visitUpdateSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'MISSED']),
  actualStart: z.string().optional(),
  actualEnd: z.string().optional(),
  notes: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number(),
  }).optional(),
  tasks: z.array(z.object({
    id: z.string(),
    status: z.enum(['COMPLETED', 'NOT_REQUIRED', 'UNABLE_TO_COMPLETE']),
    notes: z.string().optional(),
    completedAt: z.string().optional(),
  })).optional(),
  evidence: z.array(z.object({
    type: z.enum(['PHOTO', 'SIGNATURE', 'DOCUMENT']),
    data: z.string(),
    metadata: z.record(z.any()).optional(),
  })).optional(),
});

interface RouteParams {
  params: {
    visitId: string;
  };
  searchParams: {
    organizationId: string;
  };
}

/**
 * GET /api/domiciliary/visits/[visitId]
 * Retrieves detailed visit information
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
    const rateLimitResult = await rateLimit.check(req, 'visit_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { visitId } = params;
    const { organizationId } = searchParams;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get visit details
    const visit = await visitService.getVisitDetails(visitId, organizationId);

    // Handle offline sync
    const offlineData = await handleOfflineSync(req, 'visit_details', visit);

    // Audit log
    await auditLog.record({
      action: 'visit_details_retrieved',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { visitId }
    });

    return NextResponse.json(offlineData || visit);
  } catch (error) {
    console.error('Visit detail retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/domiciliary/visits/[visitId]
 * Updates visit status and details
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
    const rateLimitResult = await rateLimit.check(req, 'visit_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { visitId } = params;
    const { organizationId } = searchParams;

    // Validate request body
    const body = await req.json();
    const data = visitUpdateSchema.parse(body);

    // Verify location if provided
    if (data.location) {
      const locationValid = await verifyLocation({
        visitId,
        ...data.location
      });

      if (!locationValid) {
        return NextResponse.json(
          { error: 'Location verification failed' },
          { status: 400 }
        );
      }
    }

    // Update visit
    const visit = await visitService.updateVisitStatus(visitId, {
      organizationId,
      ...data
    });

    // Audit log
    await auditLog.record({
      action: 'visit_status_updated',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { visitId, status: data.status }
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

/**
 * DELETE /api/domiciliary/visits/[visitId]
 * Cancels a scheduled visit
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
    const rateLimitResult = await rateLimit.check(req, 'visit_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { visitId } = params;
    const { organizationId } = searchParams;

    // Cancel visit
    await visitService.cancelVisit(visitId, organizationId);

    // Audit log
    await auditLog.record({
      action: 'visit_cancelled',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { visitId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Visit cancellation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 