/**
 * @fileoverview Telehealth Report Generation API Route
 * @version 1.0.0
 * @created 2024-12-30
 */

import { NextRequest, NextResponse } from 'next/server';
import { TelehealthAnalytics } from '@/features/telehealth/services/analytics';
import { SecurityService } from '@/features/telehealth/services/security';
import { validateRequestBody } from '@/lib/api';
import { TelehealthServiceError } from '@/features/telehealth/services/enhancedTelehealth';

const analyticsService = new TelehealthAnalytics();
const securityService = new SecurityService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startDate, endDate, period } = validateRequestBody(body, [
      'startDate',
      'endDate',
      'period',
    ]);
    const user = (req as any).user; // TODO: Update with your auth implementation

    await securityService.validateAccess(
      user.id,
      user.role,
      'analytics',
      'read'
    );

    const report = await analyticsService.generateUsageReport(
      startDate,
      endDate,
      period
    );

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error('Telehealth API Error:', error);

    if (error instanceof TelehealthServiceError) {
      return NextResponse.json({
        error: error.message,
        code: error.code,
        details: error.details,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    }, { status: 500 });
  }
} 
