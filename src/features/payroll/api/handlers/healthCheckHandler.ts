import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { HealthCheckService } from '../../services/healthCheckService';

export async function healthCheckHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { organizationId } = req.query;
    const healthService = new HealthCheckService();
    const health = await healthService.checkIntegrationHealth(organizationId as string);

    return res.status(200).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function healthReportHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { organizationId } = req.query;
    const healthService = new HealthCheckService();
    const report = await healthService.generateHealthReport(organizationId as string);

    return res.status(200).json(report);
  } catch (error) {
    console.error('Health report error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


