import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { BedManagementService } from '../service';

const bedManagementService = new BedManagementService();

export async function POST(request: NextRequest) {
  try {
    const { user, body } = await validateRequest(request);
    const audit = await bedManagementService.createAudit(body, user.organizationId, user.id);
    return NextResponse.json(audit);
  } catch (error) {
    console.error('Error in POST /api/bed-management/audit:', error);
    
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
    const audit = await bedManagementService.updateAudit(id, data, user.organizationId);
    return NextResponse.json(audit);
  } catch (error) {
    console.error('Error in PUT /api/bed-management/audit:', error);
    
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