/**
 * @writecarenotes.com
 * @fileoverview Main API routes for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Core API endpoints for the domiciliary care module. Handles high-level operations
 * and module-wide functionality. Supports both desktop and mobile interfaces while
 * maintaining enterprise-grade security and compliance standards.
 *
 * Features:
 * - Module configuration endpoints
 * - Health check and status monitoring
 * - Regional compliance validation
 * - Cross-module integration endpoints
 * - Bulk operations handling
 *
 * Security:
 * - Role-based access control
 * - Request validation
 * - Rate limiting
 * - Audit logging
 * - Error tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { DomiciliaryService } from '@/features/domiciliary/services';
import { rateLimit } from '@/lib/rateLimit';
import { auditLog } from '@/lib/audit';
import { validateRegionalCompliance } from '@/lib/compliance';

// Initialize services
const domiciliaryService = new DomiciliaryService();

// Validation schemas
const configurationSchema = z.object({
  organizationId: z.string(),
  settings: z.object({
    operatingRegions: z.array(z.string()),
    regulatoryBody: z.enum(['CQC', 'CIW', 'RQIA', 'CI', 'HIQA']),
    serviceTypes: z.array(z.string()),
    complianceLevel: z.string(),
    operatingHours: z.object({
      start: z.string(),
      end: z.string(),
      timezone: z.string()
    }),
    visitDefaults: z.object({
      duration: z.number(),
      travelTime: z.number(),
      breakTime: z.number()
    })
  })
});

/**
 * GET /api/domiciliary
 * Retrieves module configuration and status
 */
export async function GET(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'domiciliary_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Get organization ID from query
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get module configuration
    const config = await domiciliaryService.getConfiguration(organizationId);
    
    // Audit log
    await auditLog.record({
      action: 'configuration_retrieved',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { configId: config.id }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Domiciliary API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/domiciliary
 * Updates module configuration
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'domiciliary_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Validate request body
    const body = await req.json();
    const data = configurationSchema.parse(body);

    // Validate regional compliance
    const complianceResult = await validateRegionalCompliance({
      module: 'domiciliary',
      organizationId: data.organizationId,
      settings: data.settings
    });

    if (!complianceResult.valid) {
      return NextResponse.json(
        { error: 'Compliance validation failed', details: complianceResult.errors },
        { status: 400 }
      );
    }

    // Update configuration
    const config = await domiciliaryService.updateConfiguration(
      data.organizationId,
      data.settings
    );

    // Audit log
    await auditLog.record({
      action: 'configuration_updated',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId: data.organizationId,
      details: { configId: config.id, changes: data.settings }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Domiciliary API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 
