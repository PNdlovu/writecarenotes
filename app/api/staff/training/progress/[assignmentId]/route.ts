import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const ProgressUpdateSchema = z.object({
  progress: z.number().min(0).max(100)
});

// PATCH /api/staff/training/progress/[assignmentId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assignmentId } = params;
    const body = await request.json();
    const { progress } = ProgressUpdateSchema.parse(body);

    // Get the assignment
    const assignment = await prisma.trainingAssignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Training assignment not found' }, { status: 404 });
    }

    // Update progress and status
    const status = progress === 100 ? 'COMPLETED' : 'IN_PROGRESS';
    const updatedAssignment = await prisma.trainingAssignment.update({
      where: { id: assignmentId },
      data: {
        progress,
        status,
        completedAt: progress === 100 ? new Date() : null
      },
      include: {
        staff: true,
        training: true
      }
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating training progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 