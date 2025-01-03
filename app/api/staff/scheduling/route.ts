import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const ScheduleSchema = z.object({
  staffId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  shiftType: z.string(),
  notes: z.string().optional()
});

// GET /api/staff/scheduling?start=xxx&end=xxx
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    const schedules = await prisma.staffSchedule.findMany({
      where: {
        startDate: {
          gte: new Date(startDate)
        },
        endDate: {
          lte: new Date(endDate)
        }
      },
      include: {
        staff: true
      }
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/staff/scheduling
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = ScheduleSchema.parse(body);

    // Check if staff member exists
    const staff = await prisma.staff.findUnique({
      where: { id: data.staffId }
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const schedule = await prisma.staffSchedule.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
      },
      include: {
        staff: true
      }
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
