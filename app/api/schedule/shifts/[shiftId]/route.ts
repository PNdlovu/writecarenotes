import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/schedule/shifts/[shiftId]/eligible-swaps
export async function GET(
  request: NextRequest,
  { params }: { params: { shiftId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shiftId } = params;
    const { searchParams } = new URL(request.url);
    const targetStaffId = searchParams.get('targetStaffId');

    if (!targetStaffId) {
      return NextResponse.json({ error: 'Target staff ID is required' }, { status: 400 });
    }

    // Get the original shift
    const originalShift = await prisma.scheduleShift.findUnique({
      where: { id: shiftId }
    });

    if (!originalShift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    // Find eligible shifts for swap
    const eligibleShifts = await prisma.scheduleShift.findMany({
      where: {
        staffId: targetStaffId,
        startTime: {
          gte: new Date(new Date(originalShift.startTime).setHours(0, 0, 0, 0)),
          lte: new Date(new Date(originalShift.startTime).setHours(23, 59, 59, 999))
        }
      },
      include: {
        staff: true
      }
    });

    return NextResponse.json(eligibleShifts);
  } catch (error) {
    console.error('Error fetching eligible swap shifts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/schedule/shifts/[shiftId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { shiftId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shiftId } = params;

    await prisma.scheduleShift.delete({
      where: { id: shiftId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting shift:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 