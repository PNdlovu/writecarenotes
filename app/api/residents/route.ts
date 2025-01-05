import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // 1. Validate request & auth
    const { user } = await validateRequest(request);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const careHomeId = user.careHomeId;

    // 2. Build query filters
    const where = {
      careHomeId,
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { nhsNumber: { contains: search } },
              { roomNumber: { contains: search } },
            ],
          }
        : {}),
    };

    // 3. Execute query
    const residents = await prisma.resident.findMany({
      where,
      orderBy: {
        lastName: 'asc',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        nhsNumber: true,
        roomNumber: true,
        admissionDate: true,
      },
    });

    // 4. Format response
    const formattedResidents = residents.map((resident) => ({
      ...resident,
      dateOfBirth: resident.dateOfBirth.toISOString(),
      admissionDate: resident.admissionDate.toISOString(),
    }));

    return NextResponse.json(formattedResidents);
  } catch (error) {
    console.error('Error in GET /api/residents:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Validate request & auth
    const { user, body } = await validateRequest(request);

    // 2. Create resident
    const resident = await prisma.resident.create({
      data: {
        ...body,
        careHomeId: user.careHomeId,
        createdById: user.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        nhsNumber: true,
        roomNumber: true,
        admissionDate: true,
      },
    });

    // 3. Format response
    const formattedResident = {
      ...resident,
      dateOfBirth: resident.dateOfBirth.toISOString(),
      admissionDate: resident.admissionDate.toISOString(),
    };

    return NextResponse.json(formattedResident, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/residents:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
