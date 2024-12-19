/**
 * @fileoverview API route for individual audit events
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuditRepository } from '@/prisma/repositories/auditRepository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const auditRepo = new AuditRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: { careHomeId: string; eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = await auditRepo.getEvent(params.eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Audit event not found' },
        { status: 404 }
      );
    }

    if (event.careHomeId !== params.careHomeId) {
      return NextResponse.json(
        { error: 'Audit event not found in this care home' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching audit event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { careHomeId: string; eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin users to delete audit events
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const filters = {
      careHomeId: params.careHomeId,
      entityId: params.eventId
    };

    const deletedCount = await auditRepo.deleteEvents(filters);
    if (deletedCount === 0) {
      return NextResponse.json(
        { error: 'Audit event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting audit event:', error);
    return NextResponse.json(
      { error: 'Failed to delete audit event' },
      { status: 500 }
    );
  }
}

