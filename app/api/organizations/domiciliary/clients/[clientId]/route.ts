/**
 * @writecarenotes.com
 * @fileoverview API routes for retrieving domiciliary client data
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles API endpoints for retrieving domiciliary care client data including
 * profiles, assessments, home environment, and emergency contacts.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DomiciliaryClientManagement } from '@/features/domiciliary/services/clientManagement';

const clientService = new DomiciliaryClientManagement();

interface RouteParams {
  params: {
    clientId: string;
  };
  searchParams: {
    organizationId: string;
    assessmentType?: string;
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

    const { clientId } = params;
    const { organizationId, assessmentType } = searchParams;

    // If assessment type is provided, return assessments of that type
    if (assessmentType) {
      const assessments = await clientService.getAssessmentsByType(
        organizationId,
        clientId,
        assessmentType
      );
      return new NextResponse(
        JSON.stringify({ success: true, data: assessments }),
        { status: 200 }
      );
    }

    // Otherwise return full client profile
    const profile = await clientService.getClientFullProfile(
      organizationId,
      clientId
    );
    return new NextResponse(
      JSON.stringify({ success: true, data: profile }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Client data retrieval error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
} 