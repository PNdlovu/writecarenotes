/**
 * @writecarenotes.com
 * @fileoverview Incident investigation API route handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Next.js API route handlers for incident investigation operations.
 * Implements endpoints for creating and managing investigations
 * for specific incidents.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { withValidation } from '@/lib/validation';
import { incidentService } from '@/features/incidents/services';
import { validateInvestigation } from '@/features/incidents/api/validation';

/**
 * POST /api/incidents/[incidentId]/investigation
 */
export const POST = withAuth(
  withValidation(validateInvestigation)(async (
    req: NextRequest,
    { params }: { params: { incidentId: string } }
  ) => {
    try {
      const data = await req.json();
      const investigation = await incidentService.createInvestigation(
        params.incidentId,
        data
      );
      return NextResponse.json(investigation, { status: 201 });
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })
);

/**
 * OPTIONS /api/incidents/[incidentId]/investigation
 */
export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'POST',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}; 