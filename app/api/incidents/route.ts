/**
 * @writecarenotes.com
 * @fileoverview Incident API route handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Next.js API route handlers for incident management endpoints.
 * Implements RESTful API operations for incidents with proper
 * validation, authentication, and error handling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { withValidation } from '@/lib/validation';
import { incidentService } from '@/features/incidents/services';
import { validateIncident } from '@/features/incidents/api/validation';

/**
 * GET /api/incidents
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const filters = {
      status: searchParams.get('status'),
      severity: searchParams.get('severity'),
      type: searchParams.get('type'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    };

    const { incidents, total } = await incidentService.listIncidents(
      filters,
      page,
      limit
    );
    
    return NextResponse.json({
      data: incidents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/incidents
 */
export const POST = withAuth(
  withValidation(validateIncident)(async (req: NextRequest) => {
    try {
      const data = await req.json();
      const incident = await incidentService.createIncident(data);
      return NextResponse.json(incident, { status: 201 });
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
 * OPTIONS /api/incidents
 */
export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}; 