/**
 * @writecarenotes.com
 * @fileoverview Regional Compliance API routes
 * @version 1.0.0
 * @created 2024-01-05
 * @updated 2024-01-05
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API routes for handling regional compliance requirements including
 * CQC, HIQA, CIW, and RQIA standards for medication management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { RegionalComplianceService } from '@/features/medications/services/RegionalComplianceService';
import { getCurrentUser } from '@/lib/auth/session';
import { validateRequest } from '@/lib/api/validation';
import { createAuditLog } from '@/lib/audit';
import { handleApiError } from '@/lib/api/error';
import { z } from 'zod';

const complianceCheckSchema = z.object({
  region: z.enum(['CQC', 'HIQA', 'CIW', 'RQIA']),
  organizationId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const reportGenerationSchema = z.object({
  region: z.enum(['CQC', 'HIQA', 'CIW', 'RQIA']),
  organizationId: z.string(),
  reportType: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']),
  date: z.string().datetime(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const validatedParams = complianceCheckSchema.parse(searchParams);

    const complianceService = new RegionalComplianceService();
    const compliance = await complianceService.checkCompliance({
      region: validatedParams.region,
      organizationId: validatedParams.organizationId,
      startDate: new Date(validatedParams.startDate),
      endDate: new Date(validatedParams.endDate),
    });

    return NextResponse.json(compliance);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();
    const validatedData = reportGenerationSchema.parse(data);

    const complianceService = new RegionalComplianceService();
    const report = await complianceService.generateReport({
      region: validatedData.region,
      organizationId: validatedData.organizationId,
      reportType: validatedData.reportType,
      date: new Date(validatedData.date),
      generatedBy: user.id,
    });

    await createAuditLog({
      action: 'compliance.report.generate',
      entityType: 'organization',
      entityId: validatedData.organizationId,
      performedBy: user.id,
      details: { ...validatedData, reportId: report.id },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
} 