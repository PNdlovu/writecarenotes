/**
 * @fileoverview Individual care home management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { careHomeService } from '@/services/care-homes';

export async function GET(
  request: Request,
  { params }: { params: { organizationId: string; careHomeId: string } }
) {
  try {
    const { user } = await validateRequest(request);
    const careHome = await careHomeService.getCareHome(params.organizationId, params.careHomeId);

    if (!careHome) {
      return NextResponse.json({ error: 'Care home not found' }, { status: 404 });
    }

    return NextResponse.json(careHome);
  } catch (error) {
    console.error(`Error in GET /api/organizations/${params.organizationId}/care-homes/${params.careHomeId}:`, error);
    
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
  { params }: { params: { organizationId: string; careHomeId: string } }
) {
  try {
    const { user, body } = await validateRequest(request);
    const careHome = await careHomeService.updateCareHome(params.organizationId, params.careHomeId, body);

    if (!careHome) {
      return NextResponse.json({ error: 'Care home not found' }, { status: 404 });
    }

    return NextResponse.json(careHome);
  } catch (error) {
    console.error(`Error in PUT /api/organizations/${params.organizationId}/care-homes/${params.careHomeId}:`, error);
    
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
  { params }: { params: { organizationId: string; careHomeId: string } }
) {
  try {
    const { user } = await validateRequest(request);
    await careHomeService.deleteCareHome(params.organizationId, params.careHomeId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error in DELETE /api/organizations/${params.organizationId}/care-homes/${params.careHomeId}:`, error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 