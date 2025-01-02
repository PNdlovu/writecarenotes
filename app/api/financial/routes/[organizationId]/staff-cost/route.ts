/**
 * @fileoverview Staff Cost API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Logger } from '@/lib/logger';
import {
  createStaffCostRecord,
  updateAgencyStaffCosts,
  updateStaffingRatios,
  updateQualificationPayRates,
} from '../../../handlers/staffCost/staffCostHandlers';
import { ValidationError } from '../../../utils/errors';

const logger = new Logger('staff-cost-route');

export async function POST(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.organizationId !== params.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    const staffCost = await createStaffCostRecord(
      params.organizationId,
      session.user.id,
      data
    );

    return NextResponse.json(staffCost);
  } catch (error) {
    logger.error('Failed to create staff cost record', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { organizationId: string; staffCostId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.organizationId !== params.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    const { type } = data;

    let result;
    switch (type) {
      case 'agency-costs':
        result = await updateAgencyStaffCosts(
          params.organizationId,
          session.user.id,
          params.staffCostId,
          data
        );
        break;
      case 'staffing-ratios':
        result = await updateStaffingRatios(
          params.organizationId,
          session.user.id,
          params.staffCostId,
          data
        );
        break;
      case 'qualification-pay':
        result = await updateQualificationPayRates(
          params.organizationId,
          session.user.id,
          params.staffCostId,
          data
        );
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid update type' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to update staff cost record', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 