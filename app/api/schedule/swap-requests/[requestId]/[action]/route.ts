import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/schedule/swap-requests/[requestId]/[action]
export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string; action: 'accept' | 'reject' } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId, action } = params;

    // Get the swap request
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: requestId },
      include: {
        requestingShift: true,
        targetShift: true
      }
    });

    if (!swapRequest) {
      return NextResponse.json({ error: 'Swap request not found' }, { status: 404 });
    }

    if (swapRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Swap request is no longer pending' }, { status: 400 });
    }

    if (action === 'accept') {
      // Perform the swap
      await prisma.$transaction([
        // Update the requesting shift
        prisma.scheduleShift.update({
          where: { id: swapRequest.requestingShiftId },
          data: {
            staffId: swapRequest.targetShift?.staffId || swapRequest.targetStaffId as string
          }
        }),
        // Update the target shift if it exists
        ...(swapRequest.targetShiftId ? [
          prisma.scheduleShift.update({
            where: { id: swapRequest.targetShiftId },
            data: {
              staffId: swapRequest.requestingStaffId
            }
          })
        ] : []),
        // Update the swap request status
        prisma.swapRequest.update({
          where: { id: requestId },
          data: { status: 'ACCEPTED' }
        })
      ]);
    } else {
      // Reject the request
      await prisma.swapRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' }
      });
    }

    const updatedRequest = await prisma.swapRequest.findUnique({
      where: { id: requestId },
      include: {
        requestingShift: {
          include: { staff: true }
        },
        targetShift: {
          include: { staff: true }
        }
      }
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error processing swap request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 