/**
 * @fileoverview Organizations API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/features/organizations/services/organizationService';
import { validateRequest } from '@/lib/validation';
import { CreateOrganizationInput } from '@/features/organizations/types/organization.types';
import { getTenantContext } from '@/lib/tenant';

/**
 * GET /api/organizations
 * List organizations with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const region = searchParams.get('region');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';

    const context = await getTenantContext(request);
    const result = await organizationService.listOrganizations({
      page,
      limit,
      status,
      region,
      type,
      search,
      sortBy,
      sortOrder
    }, context);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations
 * Create a new organization
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    await validateRequest<CreateOrganizationInput>(data);
    
    const context = await getTenantContext(request);
    const organization = await organizationService.createOrganization(data, context);

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error('Failed to create organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
} 
