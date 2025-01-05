/**
 * WriteCareNotes.com
 * @fileoverview Emergency Incident Actions API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/validation';
import { recordActionSchema } from '@/features/emergency/api/validation';

// GET /api/emergency/incidents/[incidentId]/actions
export async function GET(
  req: Request,
  { params }: { params: { incidentId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const actions = await prisma.emergencyAction.findMany({
      where: { incidentId: params.incidentId },
      orderBy: { performedAt: 'asc' }
    });

    return NextResponse.json(actions);
  } catch (error) {
    console.error('Error fetching actions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/emergency/incidents/[incidentId]/actions
export async function POST(
  req: Request,
  { params }: { params: { incidentId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = validateRequest(recordActionSchema, {
      params,
      body
    });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }

    // Check if incident exists
    const incident = await prisma.emergencyIncident.findUnique({
      where: { id: params.incidentId }
    });

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    // Check if incident is still active
    if (incident.status === 'RESOLVED' || incident.status === 'ARCHIVED') {
      return NextResponse.json(
        { error: 'Cannot add actions to a resolved or archived incident' },
        { status: 400 }
      );
    }

    const action = await prisma.emergencyAction.create({
      data: {
        ...body,
        incidentId: params.incidentId,
        performedAt: new Date()
      }
    });

    // Update incident's lastActionAt
    await prisma.emergencyIncident.update({
      where: { id: params.incidentId },
      data: {
        lastActionAt: new Date(),
        updatedAt: new Date(),
        updatedBy: session.user.id
      }
    });

    return NextResponse.json(action, { status: 201 });
  } catch (error) {
    console.error('Error recording action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 