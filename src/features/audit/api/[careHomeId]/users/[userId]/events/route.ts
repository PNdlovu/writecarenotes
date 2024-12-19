/**
 * @fileoverview API route for user-specific audit events
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
  { params }: { params: { careHomeId: string; userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Users can only view their own audit events unless they are admin
    if (session.user.id !== params.userId && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Cannot view other user events' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters: AuditFilters = {
      careHomeId: params.careHomeId,
      userId: params.userId,
      eventType: searchParams.get('eventType') || undefined,
      entityType: searchParams.get('entityType') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined
    };

    const events = await auditRepo.getEventsByUser(params.userId, filters);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching user audit events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user audit events' },
      { status: 500 }
    );
  }
}

