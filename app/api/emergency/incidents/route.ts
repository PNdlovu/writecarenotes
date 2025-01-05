/**
 * WriteCareNotes.com
 * @fileoverview Emergency Incidents API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/validation';
import { createIncidentSchema } from '@/features/emergency/api/validation';
import { 
  determineEmergencyType,
  determineSeverity
} from '@/features/emergency/utils/emergencyUtils';
import { NotificationService } from '@/features/notifications/services/NotificationService';

// GET /api/emergency/incidents
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filters = {
      careHomeId: searchParams.get('careHomeId'),
      type: searchParams.get('type'),
      status: searchParams.get('status'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      auditorId: searchParams.get('auditorId'),
      complianceLevel: searchParams.get('complianceLevel')
    };

    const incidents = await prisma.emergencyIncident.findMany({
      where: {
        ...(filters.careHomeId && { careHomeId: filters.careHomeId }),
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && filters.endDate && {
          startedAt: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate)
          }
        })
      },
      include: {
        careHome: true,
        protocol: true,
        residents: true,
        staff: true,
        timeline: true
      }
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/emergency/incidents
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = validateRequest(createIncidentSchema, { body });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }

    const incidentData = {
      ...body,
      type: determineEmergencyType(body.description),
      severity: determineSeverity(body),
      startedAt: new Date(),
      status: 'ACTIVE',
      createdBy: session.user.id,
      updatedBy: session.user.id
    };

    const incident = await prisma.emergencyIncident.create({
      data: incidentData,
      include: {
        careHome: true,
        protocol: true,
        residents: true,
        staff: true
      }
    });

    // Notify emergency team
    const notificationService = NotificationService.getInstance();
    await Promise.all(incident.responders.map(responder =>
      notificationService.send({
        id: crypto.randomUUID(),
        incidentId: incident.id,
        type: 'SYSTEM',
        recipient: responder,
        message: `Emergency: ${incident.type} incident reported at ${incident.location}. Severity: ${incident.severity}`,
        priority: incident.severity === 'CRITICAL' ? 'URGENT' : 'HIGH',
        status: 'PENDING'
      })
    ));

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
