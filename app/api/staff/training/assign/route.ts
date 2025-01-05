import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const TrainingAssignmentSchema = z.object({
  staffId: z.string(),
  trainingId: z.string(),
  dueDate: z.string().datetime(),
  notes: z.string().optional()
});

// POST /api/staff/training/assign
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = TrainingAssignmentSchema.parse(body);

    // Check if staff member exists
    const staff = await prisma.staff.findUnique({
      where: { id: data.staffId }
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    // Check if training exists
    const training = await prisma.training.findUnique({
      where: { id: data.trainingId }
    });

    if (!training) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 });
    }

    const assignment = await prisma.trainingAssignment.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
        status: 'ASSIGNED',
        progress: 0
      },
      include: {
        staff: true,
        training: true
      }
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error assigning training:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
