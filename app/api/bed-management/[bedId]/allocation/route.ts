/**
 * @fileoverview Bed allocation API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateRequest } from '@/lib/api';
import { bedManagementService } from '../../service';

export async function POST(
  request: NextRequest,
  { params }: { params: { bedId: string } }
) {
  try {
    const { user } = await validateRequest(request);
    const body = await request.json();

    const allocation = await bedManagementService.allocateBed({
      ...body,
      bedId: params.bedId,
      organizationId: user.organizationId,
      createdById: user.id
    });

    return NextResponse.json(allocation, { status: 201 });
  } catch (error) {
    console.error(`Error in POST /api/bed-management/${params.bedId}/allocation:`, error);
    
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
  request: NextRequest,
  { params }: { params: { bedId: string } }
) {
  try {
    const { user } = await validateRequest(request);
    const body = await request.json();

    // Update bed status to AVAILABLE and remove current occupant
    await bedManagementService.updateBed(params.bedId, {
      status: 'AVAILABLE',
      currentOccupantId: null
    }, user.organizationId);

    // End the current allocation
    await prisma.bedAllocation.updateMany({
      where: {
        bedId: params.bedId,
        organizationId: user.organizationId,
        endDate: null
      },
      data: {
        endDate: new Date(),
        notes: body.notes || 'Bed deallocated'
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error in DELETE /api/bed-management/${params.bedId}/allocation:`, error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 