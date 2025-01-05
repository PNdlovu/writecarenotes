/**
 * @fileoverview Care homes management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextResponse, NextRequest } from 'next/server';
import { validateRequest } from '../../../../../src/lib/api';
import { CareHomeService } from '../../../../../src/lib/services/carehome';

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    await validateRequest(request);
    const careHomes = await CareHomeService.getCareHomes(params.organizationId);

    return NextResponse.json(careHomes);
  } catch (error) {
    console.error(`Error in GET /api/organizations/${params.organizationId}/care-homes:`, error);
    
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
  { params }: { params: { organizationId: string } }
) {
  try {
    await validateRequest(request);
    const body = await request.json();
    const careHome = await CareHomeService.createCareHome(params.organizationId, body);

    return NextResponse.json(careHome, { status: 201 });
  } catch (error) {
    console.error(`Error in POST /api/organizations/${params.organizationId}/care-homes:`, error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 