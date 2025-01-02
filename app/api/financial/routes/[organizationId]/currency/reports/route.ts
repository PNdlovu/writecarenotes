/**
 * @fileoverview Currency Reports Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * API routes for detailed currency reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateDetailedReport } from '../../../../handlers/core/currencyReports';
import { generateExport } from '../../../../handlers/core/exportTemplates';
import { Logger } from '@/lib/logger';

const logger = new Logger('currency-reports');

export async function GET(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId === params.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const config = {
      period: searchParams.get('period') || new Date().toISOString().slice(0, 7),
      granularity: (searchParams.get('granularity') || 'day') as 'hour' | 'day' | 'week' | 'month',
      metrics: searchParams.get('metrics')?.split(',') || ['all'],
      format: (searchParams.get('format') || 'json') as 'json' | 'csv' | 'pdf',
      template: searchParams.get('template') || 'default',
      locale: searchParams.get('locale') || 'en-GB',
    };

    const report = await generateDetailedReport(params.organizationId, config);

    // Handle different output formats
    if (config.format === 'json') {
      return NextResponse.json(report);
    }

    const exportData = await generateExport(report, {
      title: 'Currency Operations Report',
      period: config.period,
      organizationId: params.organizationId,
      format: config.format,
      template: config.template,
      locale: config.locale,
    });

    return new NextResponse(exportData, {
      headers: {
        'Content-Type': config.format === 'csv' ? 'text/csv' : 'application/pdf',
        'Content-Disposition': `attachment; filename="currency-report-${config.period}.${config.format}"`,
      },
    });
  } catch (error) {
    logger.error('Failed to generate report', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
} 