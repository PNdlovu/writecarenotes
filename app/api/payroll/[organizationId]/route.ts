import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { HealthCheckService } from '@/services/payroll/healthCheckService';

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = params;
    const healthService = new HealthCheckService();
    const health = await healthService.checkIntegrationHealth(organizationId);

    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Health Report endpoint
export async function POST(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = params;
    const healthService = new HealthCheckService();
    const report = await healthService.generateHealthReport(organizationId);

    return NextResponse.json(report);
  } catch (error) {
    console.error('Health report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 