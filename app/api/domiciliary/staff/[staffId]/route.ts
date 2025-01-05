/**
 * @writecarenotes.com
 * @fileoverview Individual staff management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API endpoints for managing individual domiciliary care staff members,
 * including detailed operations, document management, and performance
 * tracking. Implements comprehensive staff management with full compliance.
 *
 * Features:
 * - Individual staff management
 * - Document handling
 * - Performance tracking
 * - Training management
 * - Schedule management
 * - Compliance monitoring
 *
 * Mobile-First Considerations:
 * - Optimized response size
 * - Offline data sync
 * - Location services
 * - Battery-efficient updates
 *
 * Enterprise Features:
 * - DBS verification
 * - Training compliance
 * - Audit logging
 * - Access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { StaffService } from '@/features/domiciliary/services/staffService';
import { rateLimit } from '@/lib/rateLimit';
import { auditLog } from '@/lib/audit';
import { validateStaffCompliance } from '@/lib/compliance';
import { handleOfflineSync } from '@/lib/offline';
import { encryptSensitiveData } from '@/lib/encryption';

// Initialize services
const staffService = new StaffService();

// Validation schemas
const documentSchema = z.object({
  type: z.enum(['QUALIFICATION', 'TRAINING', 'DBS', 'RIGHT_TO_WORK', 'OTHER']),
  title: z.string(),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
  expiryDate: z.string().optional(),
});

const performanceSchema = z.object({
  period: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  metrics: z.object({
    visitsCompleted: z.number(),
    onTimePercentage: z.number(),
    clientFeedback: z.number(),
    incidentCount: z.number(),
    complaintCount: z.number(),
  }),
  feedback: z.array(z.object({
    source: z.enum(['CLIENT', 'SUPERVISOR', 'PEER']),
    rating: z.number(),
    comments: z.string().optional(),
    date: z.string(),
  })),
  goals: z.array(z.object({
    description: z.string(),
    targetDate: z.string(),
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    notes: z.string().optional(),
  })),
});

interface RouteParams {
  params: {
    staffId: string;
  };
  searchParams: {
    organizationId: string;
  };
}

/**
 * GET /api/domiciliary/staff/[staffId]
 * Retrieves detailed staff information
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
    const rateLimitResult = await rateLimit.check(req, 'staff_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { staffId } = params;
    const { organizationId } = searchParams;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get staff details
    const staff = await staffService.getStaffDetails(staffId, organizationId);

    // Handle offline sync
    const offlineData = await handleOfflineSync(req, 'staff_details', staff);

    // Audit log
    await auditLog.record({
      action: 'staff_details_retrieved',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { staffId }
    });

    return NextResponse.json(offlineData || staff);
  } catch (error) {
    console.error('Staff detail retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/domiciliary/staff/[staffId]/documents
 * Adds a new document to the staff member's record
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
    const rateLimitResult = await rateLimit.check(req, 'staff_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { staffId } = params;
    const { organizationId } = searchParams;

    // Validate request body
    const body = await req.json();
    const data = documentSchema.parse(body);

    // Add document
    const document = await staffService.addDocument(staffId, {
      organizationId,
      ...data
    });

    // Audit log
    await auditLog.record({
      action: 'staff_document_added',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { staffId, documentId: document.id, type: data.type }
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Document addition error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/domiciliary/staff/[staffId]/performance
 * Updates staff performance records
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
    const rateLimitResult = await rateLimit.check(req, 'staff_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { staffId } = params;
    const { organizationId } = searchParams;

    // Validate request body
    const body = await req.json();
    const data = performanceSchema.parse(body);

    // Update performance records
    const performance = await staffService.updatePerformance(staffId, {
      organizationId,
      ...data
    });

    // Audit log
    await auditLog.record({
      action: 'staff_performance_updated',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { staffId, period: data.period }
    });

    return NextResponse.json(performance);
  } catch (error) {
    console.error('Performance update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/domiciliary/staff/[staffId]
 * Archives a staff member record
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
    const rateLimitResult = await rateLimit.check(req, 'staff_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { staffId } = params;
    const { organizationId } = searchParams;

    // Archive staff member
    await staffService.archiveStaff(staffId, organizationId);

    // Audit log
    await auditLog.record({
      action: 'staff_archived',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { staffId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Staff archival error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 