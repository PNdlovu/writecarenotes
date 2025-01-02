/**
 * @writecarenotes.com
 * @fileoverview API route for retrieving assessments due for review
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles API endpoint for retrieving domiciliary care assessments that are
 * due for review within a specified timeframe.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DomiciliaryClientManagement } from '@/features/domiciliary/services/clientManagement';

const clientService = new DomiciliaryClientManagement();

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
        JSON.stringify({ error: 'Organization ID is required' }),
        { status: 400 }
      );
    }

    const assessments = await clientService.getAssessmentsDueForReview(
      organizationId,
      daysThreshold ? parseInt(daysThreshold) : undefined
    );

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: assessments,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Assessment retrieval error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
} 