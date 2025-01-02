/**
 * @writecarenotes.com
 * @fileoverview API routes for retrieving domiciliary staff data
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles API endpoints for retrieving domiciliary care staff data including
 * profiles, qualifications, availability, and assignments.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DomiciliaryStaffManagement } from '@/features/domiciliary/services/staffManagement';

const staffService = new DomiciliaryStaffManagement();

interface RouteParams {
  params: {
    staffId: string;
  };
  searchParams: {
    organizationId: string;
  };
}

export async function GET(req: Request, { params, searchParams }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const { staffId } = params;
    const { organizationId } = searchParams;

    const profile = await staffService.getStaffFullProfile(
      organizationId,
      staffId
    );

    return new NextResponse(
      JSON.stringify({ success: true, data: profile }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Staff data retrieval error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
} 