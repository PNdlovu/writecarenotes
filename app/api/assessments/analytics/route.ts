import { NextResponse } from 'next/server';
import { getAnalyticsService } from './service';
import { auth } from '@/auth';
import { z } from 'zod';

const timeRangeSchema = z.enum(['24h', '7d', '30d']);

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange');

    if (!timeRange || !timeRangeSchema.safeParse(timeRange).success) {
      return new NextResponse('Invalid time range', { status: 400 });
    }

    const analyticsService = getAnalyticsService();
    const data = await analyticsService.getAnalytics(timeRange);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Analytics API Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const analyticsService = getAnalyticsService();
    await analyticsService.trackEvent({
      ...body,
      userId: session.user.id,
      timestamp: Date.now()
    });

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
