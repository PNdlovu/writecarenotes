/**
 * WriteCareNotes.com
 * @fileoverview Emergency Report Status API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/validation';
import { updateReportStatusSchema } from '@/features/emergency/api/validation';

// PATCH /api/emergency/reports/[reportId]/status
export async function PATCH(
  req: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to update report status
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = validateRequest(updateReportStatusSchema, {
      params,
      body
    });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }

    // Get current report
    const currentReport = await prisma.emergencyReport.findUnique({
      where: { id: params.reportId },
      include: {
        incident: true
      }
    });

    if (!currentReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'DRAFT': ['SUBMITTED'],
      'SUBMITTED': ['REVIEWED', 'DRAFT'],
      'REVIEWED': ['APPROVED', 'DRAFT'],
      'APPROVED': []
    };

    if (!validTransitions[currentReport.status].includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${currentReport.status} to ${body.status}` },
        { status: 400 }
      );
    }

    // Update report status
    const report = await prisma.emergencyReport.update({
      where: { id: params.reportId },
      data: {
        status: body.status,
        reviewedAt: body.status === 'REVIEWED' ? new Date() : undefined,
        reviewedBy: body.reviewedBy || session.user.id,
        updatedAt: new Date(),
        updatedBy: session.user.id
      },
      include: {
        incident: {
          select: {
            id: true,
            type: true,
            title: true,
            severity: true,
            status: true
          }
        }
      }
    });

    // If this is a final report and it's approved, update incident status
    if (report.type === 'FINAL' && report.status === 'APPROVED') {
      await prisma.emergencyIncident.update({
        where: { id: report.incident.id },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          updatedAt: new Date(),
          updatedBy: session.user.id
        }
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error updating report status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}