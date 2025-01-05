/**
 * WriteCareNotes.com
 * @fileoverview Emergency Protocol API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/validation';
import { updateProtocolSchema } from '@/features/emergency/api/validation';

// GET /api/emergency/protocols/[protocolId]
export async function GET(
  req: Request,
  { params }: { params: { protocolId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const protocol = await prisma.emergencyProtocol.findUnique({
      where: { id: params.protocolId },
      include: {
        steps: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!protocol) {
      return NextResponse.json(
        { error: 'Protocol not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(protocol);
  } catch (error) {
    console.error('Error fetching protocol:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/emergency/protocols/[protocolId]
export async function PATCH(
  req: Request,
  { params }: { params: { protocolId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to update protocols
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = validateRequest(updateProtocolSchema, {
      params,
      body
    });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }

    const { steps, ...protocolData } = body;

    // Update protocol and steps in a transaction
    const protocol = await prisma.$transaction(async (tx) => {
      // Update the protocol
      const updatedProtocol = await tx.emergencyProtocol.update({
        where: { id: params.protocolId },
        data: {
          ...protocolData,
          updatedBy: session.user.id,
          updatedAt: new Date()
        }
      });

      // If steps are provided, update them
      if (steps) {
        // Delete existing steps
        await tx.emergencyProtocolStep.deleteMany({
          where: { protocolId: params.protocolId }
        });

        // Create new steps with correct order
        const updatedSteps = await Promise.all(
          steps.map((step, index) =>
            tx.emergencyProtocolStep.create({
              data: {
                ...step,
                protocolId: params.protocolId,
                order: index + 1
              }
            })
          )
        );

        return {
          ...updatedProtocol,
          steps: updatedSteps
        };
      }

      return updatedProtocol;
    });

    return NextResponse.json(protocol);
  } catch (error) {
    console.error('Error updating protocol:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/emergency/protocols/[protocolId]
export async function DELETE(
  req: Request,
  { params }: { params: { protocolId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to delete protocols
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Delete protocol and its steps in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete steps first (due to foreign key constraint)
      await tx.emergencyProtocolStep.deleteMany({
        where: { protocolId: params.protocolId }
      });

      // Delete the protocol
      await tx.emergencyProtocol.delete({
        where: { id: params.protocolId }
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting protocol:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 