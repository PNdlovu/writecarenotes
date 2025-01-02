/**
 * @fileoverview Financial API Handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Handlers for financial management API operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Logger } from '@/lib/logger';

const logger = new Logger('financial-api');

export async function handleGetFinancialSummary(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await prisma.financialSummary.findFirst({
      where: { organizationId: session.user.organizationId }
    });

    return NextResponse.json(summary);
  } catch (error) {
    logger.error('Failed to get financial summary', error);
    return handleError(error);
  }
}

export async function handleGetResidentFinancial(
  req: NextRequest,
  { params }: { params: { residentId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const financial = await prisma.residentFinancial.findFirst({
      where: {
        residentId: params.residentId,
        organizationId: session.user.organizationId
      }
    });

    if (!financial) {
      return NextResponse.json(
        { error: 'Resident financial record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(financial);
  } catch (error) {
    logger.error('Failed to get resident financial', error);
    return handleError(error);
  }
}

export async function handleUpdateResidentFinancial(
  req: NextRequest,
  { params }: { params: { residentId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const updated = await prisma.residentFinancial.upsert({
      where: {
        residentId_organizationId: {
          residentId: params.residentId,
          organizationId: session.user.organizationId
        }
      },
      create: {
        ...data,
        residentId: params.residentId,
        organizationId: session.user.organizationId
      },
      update: data
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error('Failed to update resident financial', error);
    return handleError(error);
  }
}

function handleError(error: any) {
  if (error.code === 'P2002') {
    return NextResponse.json(
      { error: 'Record already exists' },
      { status: 409 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
} 