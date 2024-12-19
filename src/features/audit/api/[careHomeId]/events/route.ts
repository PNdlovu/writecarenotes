/**
 * @fileoverview API route for audit events
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuditRepository } from '@/prisma/repositories/auditRepository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { AuditFilters } from '@/features/audit/types/audit.types';

const auditRepo = new AuditRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: { careHomeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters: AuditFilters = {
      careHomeId: params.careHomeId,
      eventType: searchParams.get('eventType') || undefined,
      userId: searchParams.get('userId') || undefined,
      entityType: searchParams.get('entityType') || undefined,
      entityId: searchParams.get('entityId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      searchTerm: searchParams.get('searchTerm') || undefined,
    };

    const events = await auditRepo.getEvents(filters);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching audit events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit events' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { careHomeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const event = await auditRepo.createEvent({
      ...data,
      careHomeId: params.careHomeId,
      userId: session.user.id
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating audit event:', error);
    return NextResponse.json(
      { error: 'Failed to create audit event' },
      { status: 500 }
    );
  }
}

