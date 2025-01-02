/**
 * @fileoverview API route for compliance evidence
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComplianceService } from '@/features/compliance/services/ComplianceService';
import { ComplianceRepository } from '@/features/compliance/repositories/complianceRepository';
import { withAuth } from '@/lib/auth';
import { withRegion } from '@/lib/api';
import { Region } from '@/features/compliance/types/compliance.types';

export const POST = withAuth(withRegion(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const region = req.headers.get('x-region') as Region;
    const service = new ComplianceService(region, new ComplianceRepository());
    const evidence = await service.addEvidence(body);
    return NextResponse.json(evidence);
  } catch (error) {
    console.error('Error adding evidence:', error);
    return NextResponse.json(
      { error: 'Failed to add compliance evidence' },
      { status: 500 }
    );
  }
})); 