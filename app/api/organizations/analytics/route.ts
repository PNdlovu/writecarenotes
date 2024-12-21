import { NextResponse } from 'next/server';
import { OrganizationAnalyticsService } from '@/features/organizations/services/analyticsService';
import { auth } from '@/lib/auth';

const analyticsService = new OrganizationAnalyticsService();

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return new NextResponse('Organization ID is required', { status: 400 });
    }

    const report = await analyticsService.generateAnalyticsReport(id);
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error in GET /api/organizations/analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 