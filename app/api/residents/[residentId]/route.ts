/**
 * @fileoverview Resident management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { residentService } from '../service';

export async function GET(
  request: Request,
  { params }: { params: { residentId: string } }
) {
  try {
    const { user } = await validateRequest(request);
    const resident = await residentService.getResident(params.residentId);

    if (!resident) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
    }

    return NextResponse.json(resident);
  } catch (error) {
    console.error(`Error in GET /api/residents/${params.residentId}:`, error);
    
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
  { params }: { params: { residentId: string } }
) {
  try {
    const { user, body } = await validateRequest(request);
    const resident = await residentService.updateResident(params.residentId, body);

    return NextResponse.json(resident);
  } catch (error) {
    console.error(`Error in PUT /api/residents/${params.residentId}:`, error);
    
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
  { params }: { params: { residentId: string } }
) {
  try {
    const { user } = await validateRequest(request);
    await residentService.deleteResident(params.residentId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error in DELETE /api/residents/${params.residentId}:`, error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 