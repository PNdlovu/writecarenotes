/**
 * @fileoverview Bed transfer API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { bedManagementService } from '../../service';

export async function POST(
  request: Request,
  { params }: { params: { bedId: string } }
) {
  try {
    const { user, body } = await validateRequest(request);
    const transfer = await bedManagementService.transferBed({
      ...body,
      sourceBedId: params.bedId,
      organizationId: user.organizationId,
      createdById: user.id
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error(`Error in POST /api/bed-management/${params.bedId}/transfer:`, error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 