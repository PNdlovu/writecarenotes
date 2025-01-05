import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { PayrollStatus } from '@/features/payroll/integrations/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const provider = request.headers.get('x-payroll-provider');
    if (!provider) {
      return NextResponse.json({ error: 'Missing provider header' }, { status: 400 });
    }

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(request, provider);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const event = await request.json();
    await handleWebhookEvent(event, provider);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function verifyWebhookSignature(req: NextRequest, provider: string): Promise<boolean> {
  const signature = req.headers.get('x-webhook-signature');
  if (!signature) return false;

  // Get provider webhook secret from settings
  const providerConfig = await prisma.organizationSettings.findFirst({
    where: {
      module: 'payroll',
      'settings.provider': provider
    }
  });

  if (!providerConfig?.settings?.webhookSecret) return false;

  const hmac = crypto.createHmac('sha256', providerConfig.settings.webhookSecret);
  const body = await req.json();
  hmac.update(JSON.stringify(body));
  const calculatedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

async function handleWebhookEvent(event: any, provider: string): Promise<void> {
  switch (event.type) {
    case 'payroll.processed':
      await handlePayrollProcessed(event, provider);
      break;
    case 'payroll.failed':
      await handlePayrollFailed(event, provider);
      break;
    case 'payslip.generated':
      await handlePayslipGenerated(event, provider);
      break;
    case 'tax.filed':
      await handleTaxFiled(event, provider);
      break;
    default:
      console.warn(`Unhandled webhook event type: ${event.type}`);
  }
}

async function handlePayrollProcessed(event: any, provider: string): Promise<void> {
  const integration = await prisma.payrollIntegration.findFirst({
    where: {
      provider,
      providerReference: event.payrollId
    }
  });

  if (!integration) return;

  await prisma.$transaction([
    // Update integration status
    prisma.payrollIntegration.update({
      where: { id: integration.id },
      data: {
        status: 'SUCCESS',
        processedAt: new Date(),
        details: event.details
      }
    }),
    // Update payroll status
    prisma.payroll.update({
      where: { id: integration.payrollId },
      data: {
        status: PayrollStatus.COMPLETED,
        processedAt: new Date()
      }
    }),
    // Create notification
    prisma.notification.create({
      data: {
        organizationId: integration.organizationId,
        type: 'PAYROLL_PROCESSED',
        title: 'Payroll Processing Complete',
        message: `Payroll for period ${event.details.period} has been processed successfully.`,
        severity: 'INFO',
        metadata: {
          payrollId: integration.payrollId,
          period: event.details.period
        }
      }
    })
  ]);
}

async function handlePayrollFailed(event: any, provider: string): Promise<void> {
  const integration = await prisma.payrollIntegration.findFirst({
    where: {
      provider,
      providerReference: event.payrollId
    }
  });

  if (!integration) return;

  await prisma.$transaction([
    prisma.payrollIntegration.update({
      where: { id: integration.id },
      data: {
        status: 'FAILED',
        error: event.error,
        details: event.details
      }
    }),
    prisma.notification.create({
      data: {
        organizationId: integration.organizationId,
        type: 'PAYROLL_FAILED',
        title: 'Payroll Processing Failed',
        message: `Payroll processing failed: ${event.error}`,
        severity: 'HIGH',
        metadata: {
          payrollId: integration.payrollId,
          error: event.error
        }
      }
    })
  ]);
}

async function handlePayslipGenerated(event: any, provider: string): Promise<void> {
  await prisma.payslip.create({
    data: {
      payrollId: event.payrollId,
      employeeId: event.employeeId,
      providerReference: event.payslipId,
      url: event.payslipUrl,
      generatedAt: new Date(),
      metadata: event.details
    }
  });
}

async function handleTaxFiled(event: any, provider: string): Promise<void> {
  await prisma.taxFiling.create({
    data: {
      organizationId: event.organizationId,
      period: event.period,
      provider,
      providerReference: event.filingId,
      status: event.status,
      filedAt: new Date(),
      details: event.details
    }
  });
} 