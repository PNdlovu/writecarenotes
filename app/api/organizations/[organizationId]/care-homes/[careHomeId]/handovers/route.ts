/**
 * @fileoverview Care home handovers management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextResponse, NextRequest } from 'next/server';
import { validateRequest } from '../../../../../../../src/lib/api';
import { handoverService } from '../../../../../../../src/lib/services/handover';

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string; careHomeId: string } }
) {
  try {
    await validateRequest(request);
    const handovers = await handoverService.getHandovers(params.organizationId, params.careHomeId);

    return NextResponse.json(handovers);
  } catch (error) {
    console.error(`Error in GET /api/organizations/${params.organizationId}/care-homes/${params.careHomeId}/handovers:`, error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { organizationId: string; careHomeId: string } }
) {
  try {
    await validateRequest(request);
    const body = await request.json();
    const handover = await handoverService.createHandover({
      ...body,
      organizationId: params.organizationId,
      careHomeId: params.careHomeId
    });

    return NextResponse.json(handover, { status: 201 });
  } catch (error) {
    console.error(`Error in POST /api/organizations/${params.organizationId}/care-homes/${params.careHomeId}/handovers:`, error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 