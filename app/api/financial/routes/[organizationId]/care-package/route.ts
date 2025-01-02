/**
 * @fileoverview Care Package API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Logger } from '@/lib/logger';
import {
  createCarePackage,
  updateCarePackage,
  calculateRate,
  createFundingAssessment,
  createTopUpAgreement,
  createFeeChange,
} from '../../../handlers/carePackage/carePackageHandlers';
import { ValidationError, ComplianceError } from '../../../utils/errors';

const logger = new Logger('care-package-route');

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
    const carePackage = await createCarePackage(
      params.organizationId,
      session.user.id,
      data
    );

    return NextResponse.json(carePackage);
  } catch (error) {
    logger.error('Failed to create care package', error);

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
  { params }: { params: { organizationId: string; carePackageId: string } }
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
    const carePackage = await updateCarePackage(
      params.organizationId,
      session.user.id,
      params.carePackageId,
      data
    );

    return NextResponse.json(carePackage);
  } catch (error) {
    logger.error('Failed to update care package', error);

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