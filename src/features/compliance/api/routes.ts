import { NextRequest } from 'next/server';
import { ComplianceService } from '../services/ComplianceService';
import { ComplianceRepository } from '../repositories/complianceRepository';
import { withAuth } from '@/lib/auth';
import { withRegion } from '@/lib/api';
import { Region } from '../types/compliance.types';
import { z } from 'zod';

const auditSchema = z.object({
  organizationId: z.string(),
  careHomeId: z.string().optional(),
  frameworkId: z.string(),
  findings: z.array(z.object({
    requirementId: z.string(),
    status: z.enum(['COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT']),
    notes: z.string().optional(),
    actionRequired: z.boolean()
  }))
});

async function handleGetFrameworks(req: NextRequest) {
  try {
    const region = req.headers.get('x-region') as Region;
    const service = new ComplianceService(region, new ComplianceRepository());
    const frameworks = await service.getFrameworks();
    return Response.json(frameworks);
  } catch (error) {
    console.error('Error fetching frameworks:', error);
    return Response.json(
      { error: 'Failed to fetch compliance frameworks' },
      { status: 500 }
    );
  }
}

async function handleGetAudits(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const careHomeId = searchParams.get('careHomeId');
    
    if (!organizationId) {
      return Response.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const region = req.headers.get('x-region') as Region;
    const service = new ComplianceService(region, new ComplianceRepository());
    const audits = await service.getAudits(organizationId, careHomeId || undefined);
    return Response.json(audits);
  } catch (error) {
    console.error('Error fetching audits:', error);
    return Response.json(
      { error: 'Failed to fetch compliance audits' },
      { status: 500 }
    );
  }
}

async function handleGetAudit(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json(
        { error: 'Audit ID is required' },
        { status: 400 }
      );
    }

    const region = req.headers.get('x-region') as Region;
    const service = new ComplianceService(region, new ComplianceRepository());
    const audit = await service.getAudit(id);

    if (!audit) {
      return Response.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    return Response.json(audit);
  } catch (error) {
    console.error('Error fetching audit:', error);
    return Response.json(
      { error: 'Failed to fetch compliance audit' },
      { status: 500 }
    );
  }
}

async function handleValidateCompliance(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = auditSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid request data', details: validationResult.error },
        { status: 400 }
      );
    }

    const region = req.headers.get('x-region') as Region;
    const service = new ComplianceService(region, new ComplianceRepository());
    const audit = await service.validateCompliance(
      body.organizationId,
      body.careHomeId,
      body.frameworkId
    );

    return Response.json(audit);
  } catch (error) {
    console.error('Error validating compliance:', error);
    return Response.json(
      { error: 'Failed to validate compliance' },
      { status: 500 }
    );
  }
}

async function handleAddEvidence(req: NextRequest) {
  try {
    const body = await req.json();
    const region = req.headers.get('x-region') as Region;
    const service = new ComplianceService(region, new ComplianceRepository());
    const evidence = await service.addEvidence(body);
    return Response.json(evidence);
  } catch (error) {
    console.error('Error adding evidence:', error);
    return Response.json(
      { error: 'Failed to add compliance evidence' },
      { status: 500 }
    );
  }
}

async function handleGetSchedule(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const careHomeId = searchParams.get('careHomeId');

    if (!organizationId) {
      return Response.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const region = req.headers.get('x-region') as Region;
    const service = new ComplianceService(region, new ComplianceRepository());
    const schedule = await service.getSchedule(organizationId, careHomeId || undefined);
    return Response.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return Response.json(
      { error: 'Failed to fetch compliance schedule' },
      { status: 500 }
    );
  }
}

async function handleUpdateSchedule(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();

    if (!id) {
      return Response.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const region = req.headers.get('x-region') as Region;
    const service = new ComplianceService(region, new ComplianceRepository());
    const schedule = await service.updateSchedule(id, body);
    return Response.json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return Response.json(
      { error: 'Failed to update compliance schedule' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(withRegion(async (req: NextRequest) => {
  const { pathname } = new URL(req.url);
  
  try {
    if (pathname.includes('/api/compliance/frameworks')) {
      return handleGetFrameworks(req);
    }
    if (pathname.includes('/api/compliance/audits')) {
      return handleGetAudits(req);
    }
    if (pathname.includes('/api/compliance/audit')) {
      return handleGetAudit(req);
    }
    if (pathname.includes('/api/compliance/schedule')) {
      return handleGetSchedule(req);
    }
    
    return Response.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Error processing request:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}));

export const POST = withAuth(withRegion(async (req: NextRequest) => {
  const { pathname } = new URL(req.url);
  
  try {
    if (pathname.includes('/api/compliance/validate')) {
      return handleValidateCompliance(req);
    }
    if (pathname.includes('/api/compliance/evidence')) {
      return handleAddEvidence(req);
    }
    
    return Response.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Error processing request:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}));

export const PUT = withAuth(withRegion(async (req: NextRequest) => {
  const { pathname } = new URL(req.url);
  
  try {
    if (pathname.includes('/api/compliance/schedule')) {
      return handleUpdateSchedule(req);
    }
    
    return Response.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Error processing request:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}));


