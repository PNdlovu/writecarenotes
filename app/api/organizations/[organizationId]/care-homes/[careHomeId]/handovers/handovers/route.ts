import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

const handoverSessionSchema = z.object({
  shiftId: z.string(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  outgoingStaff: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
  })),
  incomingStaff: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
  })),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED']),
  qualityScore: z.number().optional(),
  complianceStatus: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'NEEDS_REVIEW']),
});

const updateHandoverSchema = z.object({
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED']).optional(),
  qualityScore: z.number().optional(),
  complianceStatus: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'NEEDS_REVIEW']).optional(),
  endTime: z.date().optional(),
  outgoingStaffIds: z.array(z.string()).optional(),
  incomingStaffIds: z.array(z.string()).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string; careHomeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const current = searchParams.get('current');

    if (current) {
      const currentHandover = await prisma.handoverSession.findFirst({
        where: {
          organizationId: params.id,
          careHomeId: params.careHomeId,
          status: { in: ['DRAFT', 'IN_PROGRESS'] },
        },
        orderBy: { startTime: 'desc' },
        include: {
          outgoingStaff: true,
          incomingStaff: true,
          notes: {
            include: {
              author: true,
              attachments: true,
            },
          },
          tasks: {
            include: {
              assignedTo: true,
              createdBy: true,
            },
          },
          attachments: {
            include: {
              uploadedBy: true,
            },
          },
        },
      });

      return NextResponse.json(currentHandover);
    }

    const handovers = await prisma.handoverSession.findMany({
      where: {
        organizationId: params.id,
        careHomeId: params.careHomeId,
      },
      orderBy: { startTime: 'desc' },
      take: 10,
      include: {
        outgoingStaff: true,
        incomingStaff: true,
      },
    });

    return NextResponse.json(handovers);
  } catch (error) {
    console.error('Error fetching handovers:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; careHomeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = handoverSessionSchema.parse(body);

    const handover = await prisma.handoverSession.create({
      data: {
        ...validatedData,
        organizationId: params.id,
        careHomeId: params.careHomeId,
        startTime: new Date(),
        status: 'DRAFT',
      },
      include: {
        outgoingStaff: true,
        incomingStaff: true,
      },
    });

    return NextResponse.json(handover);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('Error creating handover:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; careHomeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const handoverId = searchParams.get('handoverId');
    if (!handoverId) {
      return new NextResponse('Handover ID is required', { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateHandoverSchema.parse(body);

    const handover = await prisma.handoverSession.update({
      where: {
        id: handoverId,
        organizationId: params.id,
        careHomeId: params.careHomeId,
      },
      data: {
        ...validatedData,
        outgoingStaff: validatedData.outgoingStaffIds ? {
          set: validatedData.outgoingStaffIds.map(id => ({ id })),
        } : undefined,
        incomingStaff: validatedData.incomingStaffIds ? {
          set: validatedData.incomingStaffIds.map(id => ({ id })),
        } : undefined,
      },
      include: {
        outgoingStaff: true,
        incomingStaff: true,
      },
    });

    return NextResponse.json(handover);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('Error updating handover:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
