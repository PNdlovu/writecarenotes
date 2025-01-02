/**
 * WriteCareNotes.com
 * @fileoverview Emergency Reports API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/validation';
import { createReportSchema } from '@/features/emergency/api/validation';

// GET /api/emergency/reports
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filters = {
      incidentId: searchParams.get('incidentId'),
      type: searchParams.get('type'),
      status: searchParams.get('status'),
      author: searchParams.get('author'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate')
    };

    const reports = await prisma.emergencyReport.findMany({
      where: {
        ...(filters.incidentId && { incidentId: filters.incidentId }),
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.author && { author: filters.author }),
        ...(filters.startDate && filters.endDate && {
          submittedAt: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate)
          }
        })
      },
      include: {
        incident: {
          select: {
            type: true,
            title: true,
            severity: true,
            location: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/emergency/reports
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = validateRequest(createReportSchema, { body });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }

    // Check if incident exists
    const incident = await prisma.emergencyIncident.findUnique({
      where: { id: body.incidentId }
    });

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    // Create report
    const report = await prisma.emergencyReport.create({
      data: {
        ...body,
        submittedAt: new Date(),
        createdBy: session.user.id,
        updatedBy: session.user.id
      },
      include: {
        incident: {
          select: {
            type: true,
            title: true,
            severity: true,
            location: true
          }
        }
      }
    });

    // If this is a final report and it's approved, update incident status
    if (report.type === 'FINAL' && report.status === 'APPROVED') {
      await prisma.emergencyIncident.update({
        where: { id: body.incidentId },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          updatedBy: session.user.id
        }
      });
    }

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 