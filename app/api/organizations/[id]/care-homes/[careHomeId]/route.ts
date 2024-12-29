import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/features/organizations/services/organizationService';
import { getTenantContext } from '@/lib/tenant';

/**
 * DELETE /api/organizations/[id]/care-homes/[careHomeId]
 * Remove a care home from an organization
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; careHomeId: string } }
) {
  try {
    const context = await getTenantContext(request);
    const organization = await organizationService.removeCareHome(params.id, params.careHomeId, context);

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Failed to remove care home:', error);
    return NextResponse.json(
      { error: 'Failed to remove care home' },
      { status: 500 }
    );
  }
} 