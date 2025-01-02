import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const ShiftSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  staffId: z.string(),
  notes: z.string().optional()
});

// GET /api/schedule/shifts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    const shifts = await prisma.scheduleShift.findMany({
      where: {
        startTime: {
          gte: new Date(startDate)
        },
        endTime: {
          lte: new Date(endDate)
        }
      },
      include: {
        staff: true
      }
    });

    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/schedule/shifts
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const shiftData = ShiftSchema.parse(body);

    const shift = await prisma.scheduleShift.create({
      data: {
        ...shiftData,
        startTime: new Date(shiftData.startTime),
        endTime: new Date(shiftData.endTime)
      }
    });

    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating shift:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 