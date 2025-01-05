/**
 * @writecarenotes.com
 * @fileoverview Individual report management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API endpoints for managing individual domiciliary care reports, including
 * detailed operations, data export, and report customization. Implements
 * comprehensive report management with full regulatory compliance.
 *
 * Features:
 * - Individual report management
 * - Data export
 * - Report customization
 * - Format conversion
 * - Access control
 * - Compliance tracking
 *
 * Mobile-First Considerations:
 * - Optimized response size
 * - Offline data sync
 * - Battery-efficient updates
 * - Compressed data transfer
 *
 * Enterprise Features:
 * - Regulatory compliance
 * - Data encryption
 * - Audit logging
 * - Access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ReportService } from '@/features/domiciliary/services/reportService';
import { rateLimit } from '@/lib/rateLimit';
import { auditLog } from '@/lib/audit';
import { validateReportCompliance } from '@/lib/compliance';
import { handleOfflineSync } from '@/lib/offline';
import { encryptSensitiveData } from '@/lib/encryption';

// Initialize services
const reportService = new ReportService();

// Validation schemas
const reportUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  filters: z.object({
    staffIds: z.array(z.string()).optional(),
    clientIds: z.array(z.string()).optional(),
    areas: z.array(z.string()).optional(),
    services: z.array(z.string()).optional(),
    status: z.array(z.string()).optional(),
  }).optional(),
  customMetrics: z.array(z.object({
    name: z.string(),
    calculation: z.string(),
    format: z.string().optional(),
  })).optional(),
});

const exportRequestSchema = z.object({
  format: z.enum(['PDF', 'EXCEL', 'CSV', 'JSON']),
  sections: z.array(z.string()).optional(),
  includeCharts: z.boolean().optional(),
  password: z.string().optional(),
});

interface RouteParams {
  params: {
    reportId: string;
  };
  searchParams: {
    organizationId: string;
  };
}

/**
 * GET /api/domiciliary/reports/[reportId]
 * Retrieves detailed report information
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
    const rateLimitResult = await rateLimit.check(req, 'report_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { reportId } = params;
    const { organizationId } = searchParams;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get report details
    const report = await reportService.getReportDetails(reportId, organizationId);

    // Handle offline sync
    const offlineData = await handleOfflineSync(req, 'report_details', report);

    // Audit log
    await auditLog.record({
      action: 'report_details_retrieved',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { reportId }
    });

    return NextResponse.json(offlineData || report);
  } catch (error) {
    console.error('Report detail retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/domiciliary/reports/[reportId]/export
 * Exports the report in specified format
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
    const rateLimitResult = await rateLimit.check(req, 'report_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { reportId } = params;
    const { organizationId } = searchParams;

    // Validate request body
    const body = await req.json();
    const data = exportRequestSchema.parse(body);

    // Export report
    const exportedReport = await reportService.exportReport(reportId, {
      organizationId,
      ...data
    });

    // Encrypt sensitive data if needed and password provided
    if (data.password) {
      exportedReport.data = await encryptSensitiveData(
        exportedReport.data,
        ['personalInfo', 'medicalInfo'],
        data.password
      );
    }

    // Audit log
    await auditLog.record({
      action: 'report_exported',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: {
        reportId,
        format: data.format,
        sections: data.sections?.length || 'all'
      }
    });

    return NextResponse.json(exportedReport);
  } catch (error) {
    console.error('Report export error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/domiciliary/reports/[reportId]
 * Updates report configuration
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
    const rateLimitResult = await rateLimit.check(req, 'report_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { reportId } = params;
    const { organizationId } = searchParams;

    // Validate request body
    const body = await req.json();
    const data = reportUpdateSchema.parse(body);

    // Update report
    const updatedReport = await reportService.updateReport(reportId, {
      organizationId,
      ...data
    });

    // Audit log
    await auditLog.record({
      action: 'report_updated',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { reportId, changes: Object.keys(data) }
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('Report update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/domiciliary/reports/[reportId]
 * Archives a report
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
    const rateLimitResult = await rateLimit.check(req, 'report_detail_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { reportId } = params;
    const { organizationId } = searchParams;

    // Archive report
    await reportService.archiveReport(reportId, organizationId);

    // Audit log
    await auditLog.record({
      action: 'report_archived',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { reportId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Report archival error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 