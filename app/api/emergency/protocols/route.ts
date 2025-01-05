/**
 * WriteCareNotes.com
 * @fileoverview Emergency Protocols API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/validation';
import { createProtocolSchema } from '@/features/emergency/api/validation';

// GET /api/emergency/protocols
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const careHomeId = searchParams.get('careHomeId');

    const protocols = await prisma.emergencyProtocol.findMany({
      where: {
        ...(type && { type }),
        ...(careHomeId && { careHomeId })
      },
      include: {
        steps: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: {
        type: 'asc'
      }
    });

    return NextResponse.json(protocols);
  } catch (error) {
    console.error('Error fetching protocols:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/emergency/protocols
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create protocols
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = validateRequest(createProtocolSchema, { body });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }

    const { steps, ...protocolData } = body;

    // Create protocol with steps in a transaction
    const protocol = await prisma.$transaction(async (tx) => {
      // Create the protocol
      const createdProtocol = await tx.emergencyProtocol.create({
        data: {
          ...protocolData,
          createdBy: session.user.id,
          updatedBy: session.user.id,
          lastReviewed: new Date(),
          nextReview: new Date(Date.now() + body.reviewFrequency * 24 * 60 * 60 * 1000)
        }
      });

      // Create steps with correct order
      const createdSteps = await Promise.all(
        steps.map((step, index) =>
          tx.emergencyProtocolStep.create({
            data: {
              ...step,
              protocolId: createdProtocol.id,
              order: index + 1
            }
          })
        )
      );

      return {
        ...createdProtocol,
        steps: createdSteps
      };
    });

    return NextResponse.json(protocol, { status: 201 });
  } catch (error) {
    console.error('Error creating protocol:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
