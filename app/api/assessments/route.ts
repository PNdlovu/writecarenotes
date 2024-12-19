import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { validateRequest } from '@/lib/api';

export async function GET(request: Request) {
  try {
    // 1. Validate request & auth
    const { user, query } = await validateRequest(request);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    // 2. Build query filters
    const where = {
      organizationId: user.organizationId,
      ...(search
        ? {
            OR: [
              { residentName: { contains: search, mode: 'insensitive' } },
              { assessmentType: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(category && category !== 'All Categories'
        ? { category: category }
        : {}),
    };

    // 3. Execute query with pagination
    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        resident: true,
        assignedTo: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20,
    });

    // 4. Format response
    const formattedAssessments = assessments.map((assessment) => ({
      id: assessment.id,
      residentName: `${assessment.resident.firstName} ${assessment.resident.lastName}`,
      assessmentType: assessment.type,
      category: assessment.category,
      status: assessment.status,
      completedDate: assessment.completedAt,
      nextDueDate: assessment.nextDueDate,
      assignedTo: `${assessment.assignedTo.firstName} ${assessment.assignedTo.lastName}`,
      score: assessment.score,
      recommendations: assessment.recommendations,
    }));

    // 5. Return success response
    return NextResponse.json(formattedAssessments);
  } catch (error) {
    console.error('Error in GET /api/assessments:', error);
    
    // 6. Return appropriate error response
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

    // 2. Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        ...body,
        organizationId: user.organizationId,
        createdById: user.id,
      },
      include: {
        resident: true,
        assignedTo: true,
      },
    });

    // 3. Format response
    const formattedAssessment = {
      id: assessment.id,
      residentName: `${assessment.resident.firstName} ${assessment.resident.lastName}`,
      assessmentType: assessment.type,
      category: assessment.category,
      status: assessment.status,
      completedDate: assessment.completedAt,
      nextDueDate: assessment.nextDueDate,
      assignedTo: `${assessment.assignedTo.firstName} ${assessment.assignedTo.lastName}`,
      score: assessment.score,
      recommendations: assessment.recommendations,
    };

    // 4. Return success response
    return NextResponse.json(formattedAssessment, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/assessments:', error);
    
    // 5. Return appropriate error response
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
