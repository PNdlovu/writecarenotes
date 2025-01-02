/**
 * @fileoverview API route for compliance schedule
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComplianceService } from '@/features/compliance/services/ComplianceService';
import { ComplianceRepository } from '@/features/compliance/repositories/complianceRepository';
import { withAuth } from '@/lib/auth';
import { withRegion } from '@/lib/api';
import { Region } from '@/features/compliance/types/compliance.types';

export const GET = withAuth(withRegion(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const careHomeId = searchParams.get('careHomeId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const region = req.headers.get('x-region') as Region;
    const service = new ComplianceService(region, new ComplianceRepository());
    const schedule = await service.getSchedule(organizationId, careHomeId || undefined);
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance schedule' },
      { status: 500 }
    );
  }
}));

export const PUT = withAuth(withRegion(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const region = req.headers.get('x-region') as Region;
    const service = new ComplianceService(region, new ComplianceRepository());
    const schedule = await service.updateSchedule(id, body);
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update compliance schedule' },
      { status: 500 }
    );
  }
})); 