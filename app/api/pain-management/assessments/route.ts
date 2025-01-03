/**
 * @fileoverview Pain Assessment API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { NextRequest, NextResponse } from 'next/server';
import { PainAssessmentService } from '@/features/pain-management/services';
import { PainAssessmentSchema } from '@/features/pain-management/schemas';
import { withTenantContext } from '@/lib/middleware';
import { validateRequest } from '@/lib/validation';

export const POST = withTenantContext(async (
  req: NextRequest,
  { tenantContext }
) => {
  try {
    const body = await req.json();
    const validatedData = await validateRequest(PainAssessmentSchema, body);

    const service = new PainAssessmentService(tenantContext);
    const assessment = await service.createPainAssessment(validatedData);

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
});

export const GET = withTenantContext(async (
  req: NextRequest,
  { tenantContext }
) => {
  try {
    const { searchParams } = new URL(req.url);
    const residentId = searchParams.get('residentId');

    if (!residentId) {
      return NextResponse.json(
        { error: 'Resident ID is required' },
        { status: 400 }
      );
    }

    const service = new PainAssessmentService(tenantContext);
    const assessments = await service.getResidentAssessments(residentId);

    return NextResponse.json(assessments);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}); 
