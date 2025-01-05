/**
 * @fileoverview Resident Financial API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Logger } from '@/lib/logger';
import {
  createFinancialAssessment,
  performBenefitsCheck,
  createPaymentPlan,
  uploadAssessmentDocument,
  createFinancialReview,
} from '../../../handlers/resident/residentFinancialHandlers';
import { ValidationError } from '../../../utils/errors';

const logger = new Logger('resident-financial-route');

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
      case 'assessment':
        result = await createFinancialAssessment(
          params.organizationId,
          session.user.id,
          data
        );
        break;
      case 'benefits-check':
        result = await performBenefitsCheck(
          params.organizationId,
          session.user.id,
          data.assessmentId,
          data.financialDetails
        );
        break;
      case 'payment-plan':
        result = await createPaymentPlan(
          params.organizationId,
          session.user.id,
          data.assessmentId,
          data
        );
        break;
      case 'document':
        result = await uploadAssessmentDocument(
          params.organizationId,
          session.user.id,
          data.assessmentId,
          data
        );
        break;
      case 'review':
        result = await createFinancialReview(
          params.organizationId,
          session.user.id,
          data.assessmentId,
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
    logger.error('Failed to process resident financial operation', error);

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