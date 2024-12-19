import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // 1. Validate request & auth
    const { user, query } = await validateRequest(request);

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 2. Build query filters
    const where = {
      organizationId: user.organizationId,
      ...(startDate && endDate
        ? {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        : {}),
    };

    // 3. Get events
    const events = await prisma.event.findMany({
      where,
      include: {
        resident: {
          select: {
            id: true,
            name: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // 4. Format response
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date.toISOString(),
      type: event.type,
      description: event.description,
      residentId: event.residentId,
      residentName: event.resident?.name,
      staffId: event.staffId,
      staffName: event.staff?.name,
      status: event.status,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('Error in GET /api/calendar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Validate request & auth
    const { user } = await validateRequest(request);
    const body = await request.json();

    // 2. Create event
    const event = await prisma.event.create({
      data: {
        organizationId: user.organizationId,
        title: body.title,
        date: new Date(body.date),
        type: body.type,
        description: body.description,
        residentId: body.residentId,
        staffId: body.staffId,
        status: 'scheduled',
      },
      include: {
        resident: {
          select: {
            id: true,
            name: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 3. Format response
    const formattedEvent = {
      id: event.id,
      title: event.title,
      date: event.date.toISOString(),
      type: event.type,
      description: event.description,
      residentId: event.residentId,
      residentName: event.resident?.name,
      staffId: event.staffId,
      staffName: event.staff?.name,
      status: event.status,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedEvent, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/calendar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
