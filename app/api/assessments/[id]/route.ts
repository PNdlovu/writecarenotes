import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { validateRequest } from '@/lib/api';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Validate request & auth
    const { user } = await validateRequest(request);

    // 2. Get assessment
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
      include: {
        resident: true,
        assignedTo: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // 3. Format response
    const formattedAssessment = {
      id: assessment.id,
      residentId: assessment.residentId,
      residentName: `${assessment.resident.firstName} ${assessment.resident.lastName}`,
      assessmentType: assessment.type,
      category: assessment.category,
      status: assessment.status,
      completedDate: assessment.completedAt,
      nextDueDate: assessment.nextDueDate,
      assignedToId: assessment.assignedToId,
      assignedTo: `${assessment.assignedTo.firstName} ${assessment.assignedTo.lastName}`,
      score: assessment.score,
      recommendations: assessment.recommendations,
      notes: assessment.notes,
    };

    return NextResponse.json(formattedAssessment);
  } catch (error) {
    console.error('Error in GET /api/assessments/[id]:', error);
    
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

    // 2. Update assessment
    const assessment = await prisma.assessment.update({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
      data: {
        ...body,
        updatedById: user.id,
      },
      include: {
        resident: true,
        assignedTo: true,
      },
    });

    // 3. Format response
    const formattedAssessment = {
      id: assessment.id,
      residentId: assessment.residentId,
      residentName: `${assessment.resident.firstName} ${assessment.resident.lastName}`,
      assessmentType: assessment.type,
      category: assessment.category,
      status: assessment.status,
      completedDate: assessment.completedAt,
      nextDueDate: assessment.nextDueDate,
      assignedToId: assessment.assignedToId,
      assignedTo: `${assessment.assignedTo.firstName} ${assessment.assignedTo.lastName}`,
      score: assessment.score,
      recommendations: assessment.recommendations,
      notes: assessment.notes,
    };

    return NextResponse.json(formattedAssessment);
  } catch (error) {
    console.error('Error in PATCH /api/assessments/[id]:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Assessment not found' },
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

    // 2. Delete assessment
    await prisma.assessment.delete({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/assessments/[id]:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
