/**
 * @fileoverview API route for compliance validation
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComplianceService } from '@/features/compliance/services/ComplianceService';
import { ComplianceRepository } from '@/features/compliance/repositories/complianceRepository';
import { withAuth } from '@/lib/auth';
import { withRegion } from '@/lib/api';
import { Region } from '@/features/compliance/types/compliance.types';
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

export const POST = withAuth(withRegion(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validationResult = auditSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
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

    return NextResponse.json(audit);
  } catch (error) {
    console.error('Error validating compliance:', error);
    return NextResponse.json(
      { error: 'Failed to validate compliance' },
      { status: 500 }
    );
  }
})); 