/**
 * WriteCareNotes.com
 * @fileoverview Emergency Incident API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/validation';
import { updateIncidentSchema } from '@/features/emergency/api/validation';

// GET /api/emergency/incidents/[incidentId]
export async function GET(
  req: Request,
  { params }: { params: { incidentId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const incident = await prisma.emergencyIncident.findUnique({
      where: { id: params.incidentId },
      include: {
        careHome: true,
        protocol: true,
        residents: true,
        staff: true,
        timeline: true
      }
    });

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/emergency/incidents/[incidentId]
export async function PATCH(
  req: Request,
  { params }: { params: { incidentId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = validateRequest(updateIncidentSchema, {
      params,
      body
    });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }

    const incident = await prisma.emergencyIncident.update({
      where: { id: params.incidentId },
      data: {
        ...body,
        updatedBy: session.user.id,
        updatedAt: new Date()
      },
      include: {
        careHome: true,
        protocol: true,
        residents: true,
        staff: true,
        timeline: true
      }
    });

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/emergency/incidents/[incidentId]
export async function DELETE(
  req: Request,
  { params }: { params: { incidentId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to delete incidents
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await prisma.emergencyIncident.delete({
      where: { id: params.incidentId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}