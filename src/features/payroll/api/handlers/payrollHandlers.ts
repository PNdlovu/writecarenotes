import { NextApiRequest, NextApiResponse } from 'next';
import { PayrollRepository } from '../../repositories/payrollRepository';
import { PayrollCalculationService } from '../../services/calculationService';
import { PayrollSchema, PayrollCalculationSchema, PayrollStatus, TaxRegion } from '../../types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { TaxConfigService } from '../../services/taxConfigService';
import { PrismaClient } from '@prisma/client';
import { PayrollIntegrationService } from '../../services/integrationService';

const prisma = new PrismaClient();
const payrollRepo = new PayrollRepository();
const calculationService = new PayrollCalculationService();

export async function calculatePayrollHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const calculation = PayrollCalculationSchema.parse(req.body);
    const result = calculationService.calculateNetPay(calculation);
    
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createPayrollHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payrollData = PayrollSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).parse(req.body);

    const payroll = await payrollRepo.create(payrollData);
    return res.status(201).json(payroll);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updatePayrollStatusHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;
    const { status } = PayrollSchema.pick({ status: true }).parse(req.body);

    const payroll = await payrollRepo.updateStatus(
      id as string,
      status as PayrollStatus,
      session.user.id
    );
    return res.status(200).json(payroll);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPayrollByIdHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;
    const payroll = await payrollRepo.getById(id as string);
    
    if (!payroll) {
      return res.status(404).json({ error: 'Payroll not found' });
    }
    
    return res.status(200).json(payroll);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAvailableTaxRegionsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const taxConfigService = new TaxConfigService();
    const configs = taxConfigService.getAllConfigs();
    const regions = [...new Set(configs.map(config => config.region))];

    return res.status(200).json(regions);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTaxConfigHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { region, taxYear } = req.query;
    const taxConfigService = new TaxConfigService();
    
    if (!region) {
      return res.status(400).json({ error: 'Region is required' });
    }

    const config = taxConfigService.getConfig(
      region as TaxRegion,
      (taxYear as string) || taxConfigService.getCurrentTaxYear()
    );

    if (!config) {
      return res.status(404).json({ error: 'Tax configuration not found' });
    }

    return res.status(200).json(config);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function configurePayrollProviderHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { organizationId } = req.query;
    const config = req.body;

    // Store provider configuration
    await prisma.organizationSettings.upsert({
      where: {
        organizationId_module: {
          organizationId: organizationId as string,
          module: 'payroll'
        }
      },
      update: {
        settings: config
      },
      create: {
        organizationId: organizationId as string,
        module: 'payroll',
        settings: config
      }
    });

    // Test the connection
    const integrationService = new PayrollIntegrationService();
    await integrationService.initialize(organizationId as string);

    return res.status(200).json({ message: 'Payroll provider configured successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function syncEmployeesHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { organizationId } = req.query;
    const integrationService = new PayrollIntegrationService();
    await integrationService.initialize(organizationId as string);

    const result = await integrationService.syncEmployees(organizationId as string);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}


