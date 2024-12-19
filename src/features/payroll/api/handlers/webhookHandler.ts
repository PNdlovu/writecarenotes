import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { PayrollStatus } from '../../integrations/types';

export async function webhookHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const provider = req.headers['x-payroll-provider'];
    if (!provider) {
      return res.status(400).json({ error: 'Missing provider header' });
    }

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(req, provider as string);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;
    await handleWebhookEvent(event, provider as string);

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function verifyWebhookSignature(req: NextApiRequest, provider: string): Promise<boolean> {
  const signature = req.headers['x-webhook-signature'];
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
  hmac.update(JSON.stringify(req.body));
  const calculatedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature as string),
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


