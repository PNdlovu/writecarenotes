/**
 * @fileoverview API route for audit statistics
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuditRepository } from '@/prisma/repositories/auditRepository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    const period = (searchParams.get('period') || 'week') as 'day' | 'week' | 'month';

    const summary = await auditRepo.getAuditSummary(params.careHomeId, period);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit statistics' },
      { status: 500 }
    );
  }
} 