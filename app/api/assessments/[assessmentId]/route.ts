/**
 * @fileoverview Assessment management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { assessmentService } from '../service';

export async function GET(
  request: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { user } = await validateRequest(request);
    const assessment = await assessmentService.getAssessment(params.assessmentId);

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error(`Error in GET /api/assessments/${params.assessmentId}:`, error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { user, body } = await validateRequest(request);
    const assessment = await assessmentService.updateAssessment(params.assessmentId, body);

    return NextResponse.json(assessment);
  } catch (error) {
    console.error(`Error in PUT /api/assessments/${params.assessmentId}:`, error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { user } = await validateRequest(request);
    await assessmentService.deleteAssessment(params.assessmentId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error in DELETE /api/assessments/${params.assessmentId}:`, error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 