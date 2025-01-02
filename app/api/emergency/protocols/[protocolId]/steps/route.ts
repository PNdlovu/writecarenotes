/**
 * WriteCareNotes.com
 * @fileoverview Emergency Protocol Steps API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/validation';
import { createStepSchema } from '@/features/emergency/api/validation';

// GET /api/emergency/protocols/[protocolId]/steps
export async function GET(
  req: Request,
  { params }: { params: { protocolId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const steps = await prisma.emergencyProtocolStep.findMany({
      where: { protocolId: params.protocolId },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(steps);
  } catch (error) {
    console.error('Error fetching protocol steps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/emergency/protocols/[protocolId]/steps
export async function POST(
  req: Request,
  { params }: { params: { protocolId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to manage protocols
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = validateRequest(createStepSchema, {
      params,
      body
    });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }

    // Get the current highest order
    const lastStep = await prisma.emergencyProtocolStep.findFirst({
      where: { protocolId: params.protocolId },
      orderBy: { order: 'desc' }
    });

    const newOrder = lastStep ? lastStep.order + 1 : 1;

    // Create the new step
    const step = await prisma.emergencyProtocolStep.create({
      data: {
        ...body,
        protocolId: params.protocolId,
        order: newOrder
      }
    });

    return NextResponse.json(step, { status: 201 });
  } catch (error) {
    console.error('Error creating protocol step:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/emergency/protocols/[protocolId]/steps/reorder
export async function PATCH(
  req: Request,
  { params }: { params: { protocolId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to manage protocols
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!Array.isArray(body.stepIds)) {
      return NextResponse.json(
        { error: 'Invalid request data: stepIds must be an array' },
        { status: 400 }
      );
    }

    // Reorder steps in a transaction
    await prisma.$transaction(
      body.stepIds.map((stepId: string, index: number) =>
        prisma.emergencyProtocolStep.update({
          where: { id: stepId },
          data: { order: index + 1 }
        })
      )
    );

    const updatedSteps = await prisma.emergencyProtocolStep.findMany({
      where: { protocolId: params.protocolId },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(updatedSteps);
  } catch (error) {
    console.error('Error reordering protocol steps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 