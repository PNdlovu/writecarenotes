/**
 * @writecarenotes.com
 * @fileoverview API route for retrieving qualifications due for renewal
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles API endpoint for retrieving domiciliary care staff qualifications
 * that are due for renewal within a specified timeframe.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DomiciliaryStaffManagement } from '@/features/domiciliary/services/staffManagement';

const staffService = new DomiciliaryStaffManagement();

interface SearchParams {
  organizationId: string;
  daysThreshold?: string;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const daysThreshold = searchParams.get('daysThreshold');

    if (!organizationId) {
      return new NextResponse(
        JSON.stringify({
          error: 'Missing required parameter',
          message: 'organizationId is required',
        }),
        { status: 400 }
      );
    }

    const qualifications = await staffService.getQualificationsDueForRenewal(
      organizationId,
      daysThreshold ? parseInt(daysThreshold) : undefined
    );

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: qualifications,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Qualification retrieval error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
} 