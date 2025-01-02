import { NextResponse } from 'next/server';
import { getAnalyticsService } from '../service';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const analyticsService = getAnalyticsService();
    const data = await analyticsService.getPerformanceMetrics();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Performance Metrics API Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
