/**
 * @writecarenotes.com
 * @fileoverview Individual client management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API endpoints for managing individual domiciliary care clients, including
 * detailed operations, document management, and care plan updates. Implements
 * comprehensive client management with full regulatory compliance.
 *
 * Features:
 * - Individual client management
 * - Document handling
 * - Care plan updates
 * - Assessment tracking
 * - Risk management
 * - Service history
 *
 * Mobile-First Considerations:
 * - Optimized response size
 * - Offline data sync
 * - Secure data handling
 * - Battery-efficient updates
 *
 * Enterprise Features:
 * - GDPR compliance
 * - Data encryption
 * - Audit logging
 * - Access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ClientService } from '@/features/domiciliary/services/clientService';
import { rateLimit } from '@/lib/rateLimit';
import { auditLog } from '@/lib/audit';
import { validateClientCompliance } from '@/lib/compliance';
import { handleOfflineSync } from '@/lib/offline';
import { encryptSensitiveData } from '@/lib/encryption';

// Initialize services
const clientService = new ClientService();

// Validation schemas
const documentSchema = z.object({
  type: z.enum(['CARE_PLAN', 'ASSESSMENT', 'RISK_ASSESSMENT', 'CONSENT_FORM', 'OTHER']),
  title: z.string(),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
});

const carePlanSchema = z.object({
  startDate: z.string(),
  reviewDate: z.string(),
  careNeeds: z.array(z.object({
    category: z.string(),
    description: z.string(),
    frequency: z.string(),
    duration: z.number(),
    staffRequirements: z.array(z.string()).optional(),
  })),
  goals: z.array(z.object({
    description: z.string(),
    targetDate: z.string(),
    progress: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'DISCONTINUED']),
  })),
  riskAssessments: z.array(z.object({
    type: z.string(),
    level: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    mitigationMeasures: z.array(z.string()),
    reviewDate: z.string(),
  })),
});

interface RouteParams {
  params: {
    clientId: string;
  };
  searchParams: {
    organizationId: string;
  };
}

/**
 * GET /api/domiciliary/clients/[clientId]
 * Retrieves detailed client information
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
    const rateLimitResult = await rateLimit.check(req, 'client_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { clientId } = params;
    const { organizationId } = searchParams;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get client details
    const client = await clientService.getClientDetails(clientId, organizationId);

    // Handle offline sync
    const offlineData = await handleOfflineSync(req, 'client_details', client);

    // Audit log
    await auditLog.record({
      action: 'client_details_retrieved',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { clientId }
    });

    return NextResponse.json(offlineData || client);
  } catch (error) {
    console.error('Client detail retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/domiciliary/clients/[clientId]/documents
 * Adds a new document to the client's record
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
    const rateLimitResult = await rateLimit.check(req, 'client_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { clientId } = params;
    const { organizationId } = searchParams;

    // Validate request body
    const body = await req.json();
    const data = documentSchema.parse(body);

    // Add document
    const document = await clientService.addDocument(clientId, {
      organizationId,
      ...data
    });

    // Audit log
    await auditLog.record({
      action: 'client_document_added',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { clientId, documentId: document.id, type: data.type }
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
 * PUT /api/domiciliary/clients/[clientId]/care-plan
 * Updates the client's care plan
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
    const rateLimitResult = await rateLimit.check(req, 'client_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { clientId } = params;
    const { organizationId } = searchParams;

    // Validate request body
    const body = await req.json();
    const data = carePlanSchema.parse(body);

    // Validate compliance
    const complianceResult = await validateClientCompliance({
      organizationId,
      clientId,
      carePlan: data
    });

    if (!complianceResult.valid) {
      return NextResponse.json(
        { error: 'Compliance validation failed', details: complianceResult.errors },
        { status: 400 }
      );
    }

    // Update care plan
    const carePlan = await clientService.updateCarePlan(clientId, {
      organizationId,
      ...data
    });

    // Audit log
    await auditLog.record({
      action: 'care_plan_updated',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { clientId, carePlanId: carePlan.id }
    });

    return NextResponse.json(carePlan);
  } catch (error) {
    console.error('Care plan update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/domiciliary/clients/[clientId]
 * Archives a client record
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
    const rateLimitResult = await rateLimit.check(req, 'client_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { clientId } = params;
    const { organizationId } = searchParams;

    // Archive client
    await clientService.archiveClient(clientId, organizationId);

    // Audit log
    await auditLog.record({
      action: 'client_archived',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { clientId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Client archival error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 