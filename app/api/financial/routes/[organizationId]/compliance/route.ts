/**
 * @fileoverview Compliance API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Logger } from '@/lib/logger';
import {
  getComplianceDashboard,
  updateComplianceMetrics,
  createComplianceDeadline,
  createComplianceAction,
  submitComplianceReturn,
} from '../../../handlers/compliance/complianceHandlers';
import { ValidationError, ComplianceError } from '../../../utils/errors';

const logger = new Logger('compliance-route');

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

    const dashboard = await getComplianceDashboard(
      params.organizationId,
      session.user.id
    );

    return NextResponse.json(dashboard);
  } catch (error) {
    logger.error('Failed to get compliance dashboard', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

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
      case 'deadline':
        result = await createComplianceDeadline(
          params.organizationId,
          session.user.id,
          data
        );
        break;
      case 'action':
        result = await createComplianceAction(
          params.organizationId,
          session.user.id,
          data
        );
        break;
      case 'return':
        result = await submitComplianceReturn(
          params.organizationId,
          session.user.id,
          data
        );
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid compliance operation type' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to process compliance operation', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof ComplianceError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 422 }
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
    const metrics = await updateComplianceMetrics(
      params.organizationId,
      session.user.id,
      data
    );

    return NextResponse.json(metrics);
  } catch (error) {
    logger.error('Failed to update compliance metrics', error);

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