import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { BedManagementService } from '../service';

const bedManagementService = new BedManagementService();

export async function POST(request: NextRequest) {
  try {
    const { user, body } = await validateRequest(request);
    const assessment = await bedManagementService.createRiskAssessment(body, user.organizationId, user.id);
    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error in POST /api/bed-management/risk-assessment:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, body } = await validateRequest(request);
    const { id, ...data } = body;
    const assessment = await bedManagementService.updateRiskAssessment(id, data, user.organizationId);
    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error in PUT /api/bed-management/risk-assessment:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
