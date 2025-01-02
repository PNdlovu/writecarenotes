/**
 * @fileoverview Organization analytics API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { analyticsService } from '@/services/analytics';

export async function GET(
  request: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { user } = await validateRequest(request);
    const analytics = await analyticsService.getOrganizationAnalytics(params.organizationId);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error(`Error in GET /api/organizations/${params.organizationId}/analytics:`, error);
    
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
  request: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { user, body } = await validateRequest(request);
    const result = await analyticsService.generateReport(params.organizationId, body);

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error in POST /api/organizations/${params.organizationId}/analytics:`, error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 