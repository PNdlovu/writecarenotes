/**
 * @fileoverview Pain Management API Routes
 */
import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { PainAssessmentService } from '@/features/pain-management/services/painAssessmentService';

export async function POST(req: Request) {
  const { user, data } = await validateRequest(req);
  const service = new PainAssessmentService(user.tenantContext);
  const assessment = await service.createAssessment(data);
  return NextResponse.json(assessment);
}

export async function GET(req: Request) {
  const { user, query } = await validateRequest(req);
  const service = new PainAssessmentService(user.tenantContext);
  const assessments = await service.getResidentAssessments(query.residentId);
  return NextResponse.json(assessments);
} 
