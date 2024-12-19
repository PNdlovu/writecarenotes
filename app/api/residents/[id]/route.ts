import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Validate request & auth
    const { user } = await validateRequest(request);

    // 2. Get resident
    const resident = await prisma.resident.findFirst({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
    });

    if (!resident) {
      return NextResponse.json(
        { error: 'Resident not found' },
        { status: 404 }
      );
    }

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

    return NextResponse.json(formattedResident);
  } catch (error) {
    console.error('Error in GET /api/residents/[id]:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Validate request & auth
    const { user, body } = await validateRequest(request);

    // 2. Update resident
    const resident = await prisma.resident.update({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
      data: {
        ...body,
        updatedById: user.id,
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

    return NextResponse.json(formattedResident);
  } catch (error) {
    console.error('Error in PATCH /api/residents/[id]:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Resident not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Validate request & auth
    const { user } = await validateRequest(request);

    // 2. Delete resident
    await prisma.resident.delete({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/residents/[id]:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Resident not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
