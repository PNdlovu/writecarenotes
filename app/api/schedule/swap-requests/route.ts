import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const SwapRequestSchema = z.object({
  requestingShiftId: z.string(),
  targetShiftId: z.string().optional(),
  targetStaffId: z.string().optional(),
  notes: z.string()
});

// GET /api/schedule/swap-requests?staffId=xxx&status=xxx
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staffId');
    const status = searchParams.get('status');

    if (!staffId) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }

    const where: any = {
      OR: [
        { requestingStaffId: staffId },
        { targetStaffId: staffId }
      ]
    };

    if (status) {
      where.status = status;
    }

    const requests = await prisma.swapRequest.findMany({
      where,
      include: {
        requestingShift: {
          include: { staff: true }
        },
        targetShift: {
          include: { staff: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching swap requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/schedule/swap-requests
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = SwapRequestSchema.parse(body);

    // Get the requesting shift to get the staff ID
    const requestingShift = await prisma.scheduleShift.findUnique({
      where: { id: data.requestingShiftId }
    });

    if (!requestingShift) {
      return NextResponse.json({ error: 'Requesting shift not found' }, { status: 404 });
    }

    const swapRequest = await prisma.swapRequest.create({
      data: {
        ...data,
        requestingStaffId: requestingShift.staffId,
        status: 'PENDING'
      },
      include: {
        requestingShift: {
          include: { staff: true }
        },
        targetShift: {
          include: { staff: true }
        }
      }
    });

    return NextResponse.json(swapRequest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating swap request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
