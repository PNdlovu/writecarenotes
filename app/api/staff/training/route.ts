import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const TrainingSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.string(),
  duration: z.number(),
  requiredQualifications: z.array(z.string()).optional(),
  validityPeriod: z.number().optional(), // in months
  materials: z.array(z.string()).optional()
});

const TrainingAssignmentSchema = z.object({
  staffId: z.string(),
  trainingId: z.string(),
  dueDate: z.string().datetime(),
  notes: z.string().optional()
});

// GET /api/staff/training
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trainings = await prisma.training.findMany({
      include: {
        requiredQualifications: true
      }
    });

    return NextResponse.json(trainings);
  } catch (error) {
    console.error('Error fetching trainings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/staff/training
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = TrainingSchema.parse(body);

    const training = await prisma.training.create({
      data: {
        ...data,
        requiredQualifications: {
          connect: data.requiredQualifications?.map(id => ({ id })) || []
        }
      },
      include: {
        requiredQualifications: true
      }
    });

    return NextResponse.json(training, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating training:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 