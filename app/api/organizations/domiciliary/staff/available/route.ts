/**
 * @writecarenotes.com
 * @fileoverview API route for retrieving available staff
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles API endpoint for retrieving available domiciliary care staff
 * for a given time slot and area.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DomiciliaryStaffManagement } from '@/features/domiciliary/services/staffManagement';

const staffService = new DomiciliaryStaffManagement();

interface SearchParams {
  organizationId: string;
  startTime: string;
  endTime: string;
  area?: string;
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
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const area = searchParams.get('area') || undefined;

    if (!organizationId || !startTime || !endTime) {
      return new NextResponse(
        JSON.stringify({
          error: 'Missing required parameters',
          message: 'organizationId, startTime, and endTime are required',
        }),
        { status: 400 }
      );
    }

    const availableStaff = await staffService.getAvailableStaff(
      organizationId,
      new Date(startTime),
      new Date(endTime),
      area
    );

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: availableStaff,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Staff availability error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
} 