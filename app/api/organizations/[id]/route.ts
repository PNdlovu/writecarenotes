import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/features/organizations/services/organizationService';
import { validateRequest } from '@/lib/validation';
import { UpdateOrganizationInput } from '@/features/organizations/types/organization.types';
import { getTenantContext } from '@/lib/tenant';

/**
 * GET /api/organizations/[id]
 * Get a single organization by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await getTenantContext(request);
    const organization = await organizationService.getOrganization(params.id, context);

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Failed to fetch organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/organizations/[id]
 * Update an organization
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    await validateRequest<UpdateOrganizationInput>(data);
    
    const context = await getTenantContext(request);
    const organization = await organizationService.updateOrganization(params.id, data, context);

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Failed to update organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/[id]
 * Delete an organization
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await getTenantContext(request);
    await organizationService.deleteOrganization(params.id, context);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete organization:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
} 