import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/features/organizations/services/organizationService';
import { validateRequest } from '@/lib/validation';
import { getTenantContext } from '@/lib/tenant';

/**
 * POST /api/organizations/[id]/care-homes
 * Add a care home to an organization
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { careHomeId } = await request.json();
    if (!careHomeId) {
      return NextResponse.json(
        { error: 'Care home ID is required' },
        { status: 400 }
      );
    }
    
    const context = await getTenantContext(request);
    const organization = await organizationService.addCareHome(params.id, careHomeId, context);

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Failed to add care home:', error);
    return NextResponse.json(
      { error: 'Failed to add care home' },
      { status: 500 }
    );
  }
} 