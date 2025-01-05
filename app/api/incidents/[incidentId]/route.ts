/**
 * @writecarenotes.com
 * @fileoverview Individual incident API route handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Next.js API route handlers for individual incident operations.
 * Implements RESTful API endpoints for getting, updating, and
 * deleting specific incidents by ID.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { withValidation } from '@/lib/validation';
import { incidentService } from '@/features/incidents/services';
import { validateIncident } from '@/features/incidents/api/validation';

/**
 * GET /api/incidents/[incidentId]
 */
export const GET = withAuth(async (
  req: NextRequest,
  { params }: { params: { incidentId: string } }
) => {
  try {
    const incident = await incidentService.getIncident(params.incidentId);
    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(incident);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/incidents/[incidentId]
 */
export const PATCH = withAuth(
  withValidation(validateIncident)(async (
    req: NextRequest,
    { params }: { params: { incidentId: string } }
  ) => {
    try {
      const data = await req.json();
      const incident = await incidentService.updateIncident(
        params.incidentId,
        data
      );
      return NextResponse.json(incident);
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
 * DELETE /api/incidents/[incidentId]
 */
export const DELETE = withAuth(async (
  req: NextRequest,
  { params }: { params: { incidentId: string } }
) => {
  try {
    await incidentService.deleteIncident(params.incidentId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * OPTIONS /api/incidents/[incidentId]
 */
export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, PATCH, DELETE',
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}; 