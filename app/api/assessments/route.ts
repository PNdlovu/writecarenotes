/**
 * @fileoverview Assessment API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

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

    return NextResponse.json(formattedAssessments);
  } catch (error) {
    console.error('Error in GET /api/assessments:', error);
    
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
    // Implementation moved from src/features/assessments/api/assessments.ts
    const { user, body } = await validateRequest(request);

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

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/assessments:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
