import { NextResponse } from 'next/server';
import { validateRequest, createSuccessResponse, createErrorResponse } from '@/lib/api';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // 1. Validate request & auth
    const { user, query } = await validateRequest(request);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const careLevel = searchParams.get('careLevel');

    // 2. Build query filters
    const where = {
      organizationId: user.organizationId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { id: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(careLevel ? { careLevel } : {}),
    };

    // 3. Execute query
    const residents = await prisma.resident.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 4. Format response
    const formattedResidents = residents.map((resident) => ({
      id: resident.id,
      name: resident.name,
      dateOfBirth: resident.dateOfBirth.toISOString(),
      room: resident.room,
      careLevel: resident.careLevel,
      status: resident.status,
      admissionDate: resident.admissionDate.toISOString(),
      medicalHistory: resident.medicalHistory,
      emergencyContact: resident.emergencyContact,
      notes: resident.notes,
    }));

    return createSuccessResponse(formattedResidents);
  } catch (error) {
    console.error('Error in GET /api/residents:', error);
    
    if (error.name === 'UnauthorizedError') {
      return createErrorResponse('Unauthorized', 401);
    }
    
    return createErrorResponse('Internal server error', 500);
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
        organizationId: user.organizationId,
        createdById: user.id,
      },
    });

    // 3. Format response
    const formattedResident = {
      id: resident.id,
      name: resident.name,
      dateOfBirth: resident.dateOfBirth.toISOString(),
      room: resident.room,
      careLevel: resident.careLevel,
      status: resident.status,
      admissionDate: resident.admissionDate.toISOString(),
      medicalHistory: resident.medicalHistory,
      emergencyContact: resident.emergencyContact,
      notes: resident.notes,
    };

    return createSuccessResponse(formattedResident, 201);
  } catch (error) {
    console.error('Error in POST /api/residents:', error);
    
    if (error.name === 'UnauthorizedError') {
      return createErrorResponse('Unauthorized', 401);
    }
    
    return createErrorResponse('Internal server error', 500);
  }
}
