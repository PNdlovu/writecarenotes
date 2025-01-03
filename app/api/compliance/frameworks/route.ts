/**
 * @fileoverview API route for compliance frameworks
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComplianceService } from '@/features/compliance/services/ComplianceService';
import { ComplianceRepository } from '@/features/compliance/repositories/complianceRepository';
import { withAuth } from '@/lib/auth';
import { withRegion } from '@/lib/api';
import { Region } from '@/features/compliance/types/compliance.types';

export const GET = withAuth(withRegion(async (req: NextRequest) => {
  try {
    const region = req.headers.get('x-region') as Region;
    const service = new ComplianceService(region, new ComplianceRepository());
    const frameworks = await service.getFrameworks();
    return NextResponse.json(frameworks);
  } catch (error) {
    console.error('Error fetching frameworks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance frameworks' },
      { status: 500 }
    );
  }
})); 
