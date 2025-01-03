/**
 * @writecarenotes.com
 * @fileoverview Domiciliary care reports API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API endpoints for generating and managing domiciliary care reports,
 * including performance analytics, compliance tracking, and business
 * intelligence. Implements comprehensive reporting with full regulatory
 * compliance.
 *
 * Features:
 * - Performance reporting
 * - Compliance tracking
 * - Visit analytics
 * - Staff metrics
 * - Client satisfaction
 * - Financial reporting
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
const reportRequestSchema = z.object({
  organizationId: z.string(),
  reportType: z.enum([
    'PERFORMANCE',
    'COMPLIANCE',
    'VISITS',
    'STAFF',
    'CLIENTS',
    'FINANCIAL',
    'CUSTOM'
  ]),
  period: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  filters: z.object({
    staffIds: z.array(z.string()).optional(),
    clientIds: z.array(z.string()).optional(),
    areas: z.array(z.string()).optional(),
    services: z.array(z.string()).optional(),
    status: z.array(z.string()).optional(),
  }).optional(),
  format: z.enum(['PDF', 'EXCEL', 'CSV', 'JSON']),
  customMetrics: z.array(z.object({
    name: z.string(),
    calculation: z.string(),
    format: z.string().optional(),
  })).optional(),
});

const scheduledReportSchema = z.object({
  organizationId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  schedule: z.object({
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']),
    dayOfWeek: z.number().optional(),
    dayOfMonth: z.number().optional(),
    time: z.string(),
    timezone: z.string(),
  }),
  recipients: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    role: z.string().optional(),
  })),
  reportConfig: reportRequestSchema,
});

/**
 * GET /api/domiciliary/reports
 * Retrieves available reports and report templates
 */
export async function GET(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'reports_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get reports
    const reports = await reportService.getReports({
      organizationId,
      type,
      status
    });

    // Handle offline sync
    const offlineData = await handleOfflineSync(req, 'reports', reports);

    // Audit log
    await auditLog.record({
      action: 'reports_retrieved',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { filters: { type, status } }
    });

    return NextResponse.json(offlineData || reports);
  } catch (error) {
    console.error('Reports retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/domiciliary/reports
 * Generates a new report
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'reports_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Validate request body
    const body = await req.json();
    const data = reportRequestSchema.parse(body);

    // Validate compliance
    const complianceResult = await validateReportCompliance({
      organizationId: data.organizationId,
      reportType: data.reportType,
      period: data.period
    });

    if (!complianceResult.valid) {
      return NextResponse.json(
        { error: 'Compliance validation failed', details: complianceResult.errors },
        { status: 400 }
      );
    }

    // Generate report
    const report = await reportService.generateReport(data);

    // Encrypt sensitive data if needed
    if (report.containsSensitiveData) {
      report.data = await encryptSensitiveData(report.data, ['personalInfo', 'medicalInfo']);
    }

    // Audit log
    await auditLog.record({
      action: 'report_generated',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId: data.organizationId,
      details: {
        reportType: data.reportType,
        period: data.period,
        format: data.format
      }
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/domiciliary/reports/schedule
 * Creates or updates a scheduled report
 */
export async function PUT(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'reports_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Validate request body
    const body = await req.json();
    const data = scheduledReportSchema.parse(body);

    // Schedule report
    const scheduledReport = await reportService.scheduleReport(data);

    // Audit log
    await auditLog.record({
      action: 'report_scheduled',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId: data.organizationId,
      details: {
        reportName: data.name,
        schedule: data.schedule,
        recipientCount: data.recipients.length
      }
    });

    return NextResponse.json(scheduledReport);
  } catch (error) {
    console.error('Report scheduling error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 
