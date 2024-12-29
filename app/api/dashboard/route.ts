import { NextRequest, NextResponse } from 'next/server';
import { DashboardService } from '@/services/dashboard.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const careHomeId = searchParams.get('careHomeId');
    
    if (!careHomeId) {
      return NextResponse.json(
        { error: 'Care home ID is required' },
        { status: 400 }
      );
    }

    const [
      careHomeData,
      metrics,
      careMetrics,
      complianceDeadlines,
      performanceTrends
    ] = await Promise.all([
      DashboardService.getCareHomeData(careHomeId),
      DashboardService.getDashboardMetrics(careHomeId),
      DashboardService.getCareMetrics(careHomeId),
      DashboardService.getComplianceDeadlines(careHomeId),
      DashboardService.getPerformanceTrends(careHomeId)
    ]);

    return NextResponse.json({
      careHomeData,
      metrics,
      careMetrics,
      complianceDeadlines,
      performanceTrends
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 