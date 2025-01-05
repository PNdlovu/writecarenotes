/**
 * @writecarenotes.com
 * @fileoverview Medication Analytics API routes
 * @version 1.0.0
 * @created 2024-01-05
 * @updated 2024-01-05
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API routes for medication analytics including usage trends,
 * compliance reporting, stock analytics, and administration patterns.
 */

import { NextRequest, NextResponse } from 'next/server';
import { medicationAnalytics } from '@/features/medications/services/medicationAnalytics';
import { stockAnalyticsService } from '@/features/medications/services/stockAnalyticsService';
import { getCurrentUser } from '@/lib/auth/session';
import { validateRequest } from '@/lib/api/validation';
import { createAuditLog } from '@/lib/audit';
import { handleApiError } from '@/lib/api/error';
import { z } from 'zod';

const analyticsQuerySchema = z.object({
  organizationId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  type: z.enum(['USAGE', 'COMPLIANCE', 'STOCK', 'ADMINISTRATION']),
  groupBy: z.enum(['DAY', 'WEEK', 'MONTH']).optional(),
  medicationIds: z.array(z.string()).optional(),
  locationIds: z.array(z.string()).optional(),
});

const reportGenerationSchema = z.object({
  organizationId: z.string(),
  reportType: z.enum(['MEDICATION_USAGE', 'COMPLIANCE_SUMMARY', 'STOCK_LEVELS', 'ADMINISTRATION_PATTERNS']),
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  filters: z.object({
    medications: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    residents: z.array(z.string()).optional(),
  }).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const validatedParams = analyticsQuerySchema.parse({
      ...searchParams,
      medicationIds: searchParams.medicationIds?.split(','),
      locationIds: searchParams.locationIds?.split(','),
    });

    let analyticsData;
    switch (validatedParams.type) {
      case 'USAGE':
        analyticsData = await medicationAnalytics.getUsageTrends(validatedParams);
        break;
      case 'COMPLIANCE':
        analyticsData = await medicationAnalytics.getComplianceMetrics(validatedParams);
        break;
      case 'STOCK':
        analyticsData = await stockAnalyticsService.getStockAnalytics(validatedParams);
        break;
      case 'ADMINISTRATION':
        analyticsData = await medicationAnalytics.getAdministrationPatterns(validatedParams);
        break;
    }

    return NextResponse.json(analyticsData);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();
    const validatedData = reportGenerationSchema.parse(data);

    const report = await medicationAnalytics.generateReport({
      ...validatedData,
      generatedBy: user.id,
    });

    await createAuditLog({
      action: 'analytics.report.generate',
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