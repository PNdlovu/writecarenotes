/**
 * WriteCareNotes.com
 * @fileoverview Emergency Protocol Step API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/validation';
import { updateStepSchema } from '@/features/emergency/api/validation';

// GET /api/emergency/protocols/[protocolId]/steps/[stepId]
export async function GET(
  req: Request,
  { params }: { params: { protocolId: string; stepId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const step = await prisma.emergencyProtocolStep.findUnique({
      where: {
        id: params.stepId,
        protocolId: params.protocolId
      }
    });

    if (!step) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(step);
  } catch (error) {
    console.error('Error fetching protocol step:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/emergency/protocols/[protocolId]/steps/[stepId]
export async function PATCH(
  req: Request,
  { params }: { params: { protocolId: string; stepId: string } }
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
    const validation = validateRequest(updateStepSchema, {
      params,
      body
    });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }

    const step = await prisma.emergencyProtocolStep.update({
      where: {
        id: params.stepId,
        protocolId: params.protocolId
      },
      data: body
    });

    return NextResponse.json(step);
  } catch (error) {
    console.error('Error updating protocol step:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/emergency/protocols/[protocolId]/steps/[stepId]
export async function DELETE(
  req: Request,
  { params }: { params: { protocolId: string; stepId: string } }
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

    // Delete step and reorder remaining steps in a transaction
    await prisma.$transaction(async (tx) => {
      // Get the step to be deleted
      const stepToDelete = await tx.emergencyProtocolStep.findUnique({
        where: {
          id: params.stepId,
          protocolId: params.protocolId
        }
      });

      if (!stepToDelete) {
        throw new Error('Step not found');
      }

      // Delete the step
      await tx.emergencyProtocolStep.delete({
        where: {
          id: params.stepId,
          protocolId: params.protocolId
        }
      });

      // Reorder remaining steps
      await tx.emergencyProtocolStep.updateMany({
        where: {
          protocolId: params.protocolId,
          order: {
            gt: stepToDelete.order
          }
        },
        data: {
          order: {
            decrement: 1
          }
        }
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting protocol step:', error);
    if (error.message === 'Step not found') {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 