/**
 * @fileoverview Local Authority API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Logger } from '@/lib/logger';
import {
  createLocalAuthorityContract,
  processLocalAuthorityPayment,
  processHSEPayment,
  processTrustPayment,
  generateFundingGapAnalysis,
} from '../../../handlers/localAuthority/localAuthorityHandlers';
import { ValidationError } from '../../../utils/errors';

const logger = new Logger('local-authority-route');

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
    const { type } = data;

    let result;
    switch (type) {
      case 'contract':
        result = await createLocalAuthorityContract(
          params.organizationId,
          session.user.id,
          data
        );
        break;
      case 'payment':
        result = await processLocalAuthorityPayment(
          params.organizationId,
          session.user.id,
          data
        );
        break;
      case 'hse-payment':
        result = await processHSEPayment(
          params.organizationId,
          session.user.id,
          data
        );
        break;
      case 'trust-payment':
        result = await processTrustPayment(
          params.organizationId,
          session.user.id,
          data
        );
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid operation type' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to process local authority operation', error);

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

export async function GET(
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

    const { searchParams } = new URL(req.url);
    const period = {
      from: new Date(searchParams.get('from') || ''),
      to: new Date(searchParams.get('to') || '')
    };

    if (isNaN(period.from.getTime()) || isNaN(period.to.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date range' },
        { status: 400 }
      );
    }

    const analysis = await generateFundingGapAnalysis(
      params.organizationId,
      session.user.id,
      period
    );

    return NextResponse.json(analysis);
  } catch (error) {
    logger.error('Failed to generate funding gap analysis', error);

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