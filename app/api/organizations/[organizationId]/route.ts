/**
 * @fileoverview Organization management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { organizationService } from '../service';

export async function GET(
  request: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { user } = await validateRequest(request);
    const organization = await organizationService.getOrganization(params.organizationId);

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error(`Error in GET /api/organizations/${params.organizationId}:`, error);
    
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
  { params }: { params: { organizationId: string } }
) {
  try {
    const { user, body } = await validateRequest(request);
    const organization = await organizationService.updateOrganization(params.organizationId, body);

    return NextResponse.json(organization);
  } catch (error) {
    console.error(`Error in PUT /api/organizations/${params.organizationId}:`, error);
    
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
  { params }: { params: { organizationId: string } }
) {
  try {
    const { user } = await validateRequest(request);
    await organizationService.deleteOrganization(params.organizationId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error in DELETE /api/organizations/${params.organizationId}:`, error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 