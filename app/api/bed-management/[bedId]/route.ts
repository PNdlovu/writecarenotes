/**
 * @fileoverview Individual bed management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { bedManagementService } from '../service';

export async function GET(
  request: Request,
  { params }: { params: { bedId: string } }
) {
  try {
    const { user } = await validateRequest(request);
    const bed = await bedManagementService.getBed(params.bedId);

    if (!bed) {
      return NextResponse.json({ error: 'Bed not found' }, { status: 404 });
    }

    return NextResponse.json(bed);
  } catch (error) {
    console.error(`Error in GET /api/bed-management/${params.bedId}:`, error);
    
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
  { params }: { params: { bedId: string } }
) {
  try {
    const { user, body } = await validateRequest(request);
    const bed = await bedManagementService.updateBed(params.bedId, body);

    return NextResponse.json(bed);
  } catch (error) {
    console.error(`Error in PUT /api/bed-management/${params.bedId}:`, error);
    
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
  { params }: { params: { bedId: string } }
) {
  try {
    const { user } = await validateRequest(request);
    await bedManagementService.deleteBed(params.bedId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error in DELETE /api/bed-management/${params.bedId}:`, error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 