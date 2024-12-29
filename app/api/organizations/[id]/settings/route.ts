import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/features/organizations/services/organizationService';
import { validateRequest } from '@/lib/validation';
import { OrganizationSettings } from '@/features/organizations/types/organization.types';
import { getTenantContext } from '@/lib/tenant';

/**
 * PATCH /api/organizations/[id]/settings
 * Update organization settings
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    await validateRequest<OrganizationSettings>(data);
    
    const context = await getTenantContext(request);
    const organization = await organizationService.updateSettings(params.id, data, context);

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Failed to update organization settings:', error);
    return NextResponse.json(
      { error: 'Failed to update organization settings' },
      { status: 500 }
    );
  }
} 