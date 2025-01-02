import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PayrollIntegrationService } from '@/services/payroll/integrationService';

export async function POST(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integrationId');

    if (!integrationId) {
      return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
    }

    // Get integration details
    const integration = await prisma.payrollIntegration.findUnique({
      where: { id: integrationId },
      include: {
        payroll: true
      }
    });

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Check retry count
    if (integration.retryCount >= 3) {
      return NextResponse.json({ 
        error: 'Maximum retry attempts reached',
        retryCount: integration.retryCount
      }, { status: 400 });
    }

    // Attempt retry
    const integrationService = new PayrollIntegrationService();
    await integrationService.initialize(integration.payroll.organizationId);
    const result = await integrationService.submitPayroll(integration.payroll);

    // Update integration record
    await prisma.payrollIntegration.update({
      where: { id: integrationId },
      data: {
        status: result.success ? 'SUCCESS' : 'FAILED',
        providerReference: result.providerReference,
        error: result.error,
        retryCount: integration.retryCount + 1,
        lastRetryAt: new Date(),
        details: result.details
      }
    });

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Retry successful' : 'Retry failed',
      details: result
    });
  } catch (error) {
    console.error('Retry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 