import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PayrollIntegrationService } from '../../services/integrationService';

export async function retryIntegrationHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { integrationId } = req.query;

    // Get integration details
    const integration = await prisma.payrollIntegration.findUnique({
      where: { id: integrationId as string },
      include: {
        payroll: true
      }
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Check retry count
    if (integration.retryCount >= 3) {
      return res.status(400).json({ 
        error: 'Maximum retry attempts reached',
        retryCount: integration.retryCount
      });
    }

    // Attempt retry
    const integrationService = new PayrollIntegrationService();
    await integrationService.initialize(integration.payroll.organizationId);
    const result = await integrationService.submitPayroll(integration.payroll);

    // Update integration record
    await prisma.payrollIntegration.update({
      where: { id: integrationId as string },
      data: {
        status: result.success ? 'SUCCESS' : 'FAILED',
        providerReference: result.providerReference,
        error: result.error,
        retryCount: integration.retryCount + 1,
        lastRetryAt: new Date(),
        details: result.details
      }
    });

    return res.status(200).json({
      success: result.success,
      message: result.success ? 'Retry successful' : 'Retry failed',
      details: result
    });
  } catch (error) {
    console.error('Retry error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


