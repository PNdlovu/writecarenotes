/**
 * @fileoverview Assessment API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { assessmentService } from './service';

export async function GET(request: Request) {
  try {
    // 1. Validate request & auth
    const { user, query } = await validateRequest(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const residentId = searchParams.get('residentId');
    const assessorId = searchParams.get('assessorId');

    // 2. Fetch assessments using service
    const { assessments, total } = await assessmentService.fetchAssessments({
      residentId,
      assessorId,
      status,
      type,
      page,
      limit
    });

    return NextResponse.json({ assessments, total });
  } catch (error) {
    console.error('Error in GET /api/assessments:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { user, body } = await validateRequest(request);

    const assessment = await assessmentService.createAssessment({
      ...body,
      organizationId: user.organizationId,
      createdById: user.id
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/assessments:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
