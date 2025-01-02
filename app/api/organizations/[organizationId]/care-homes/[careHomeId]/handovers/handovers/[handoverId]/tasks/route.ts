import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

const handoverTaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  assignedToId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.date().optional(),
  category: z.enum(['CARE', 'MEDICATION', 'HOUSEKEEPING', 'ADMINISTRATIVE', 'OTHER']).optional(),
  tags: z.array(z.string()).optional(),
  reminderTime: z.date().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string; careHomeId: string; handoverId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignedToId = searchParams.get('assignedToId');
    const priority = searchParams.get('priority');

    const tasks = await prisma.handoverTask.findMany({
      where: {
        handoverSessionId: params.handoverId,
        ...(status && { status: status as any }),
        ...(assignedToId && { assignedToId }),
        ...(priority && { priority: priority as any }),
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching handover tasks:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; careHomeId: string; handoverId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify handover session exists and is active
    const handover = await prisma.handoverSession.findUnique({
      where: {
        id: params.handoverId,
        status: { in: ['DRAFT', 'IN_PROGRESS'] },
      },
    });

    if (!handover) {
      return new NextResponse('Handover session not found or inactive', { status: 404 });
    }

    const body = await request.json();
    const validatedData = handoverTaskSchema.parse(body);

    // Verify assigned user exists if provided
    if (validatedData.assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: validatedData.assignedToId },
      });
      if (!assignedUser) {
        return new NextResponse('Assigned user not found', { status: 404 });
      }
    }

    const task = await prisma.handoverTask.create({
      data: {
        ...validatedData,
        handoverSessionId: params.handoverId,
        createdById: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('Error creating handover task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; careHomeId: string; handoverId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    if (!taskId) {
      return new NextResponse('Task ID is required', { status: 400 });
    }

    // Verify task exists and user has permission
    const existingTask = await prisma.handoverTask.findUnique({
      where: {
        id: taskId,
        handoverSessionId: params.handoverId,
      },
      include: {
        handoverSession: true,
      },
    });

    if (!existingTask) {
      return new NextResponse('Task not found', { status: 404 });
    }

    // Only allow updates if handover is not completed/verified
    if (existingTask.handoverSession.status === 'COMPLETED' || existingTask.handoverSession.status === 'VERIFIED') {
      return new NextResponse('Cannot update task in a completed handover', { status: 403 });
    }

    // Only allow creator, assigned user, or admin to update
    if (
      existingTask.createdById !== session.user.id &&
      existingTask.assignedToId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return new NextResponse('Not authorized to update this task', { status: 403 });
    }

    const body = await request.json();
    const validatedData = handoverTaskSchema.partial().parse(body);

    // Verify assigned user exists if provided
    if (validatedData.assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: validatedData.assignedToId },
      });
      if (!assignedUser) {
        return new NextResponse('Assigned user not found', { status: 404 });
      }
    }

    const task = await prisma.handoverTask.update({
      where: {
        id: taskId,
        handoverSessionId: params.handoverId,
      },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('Error updating handover task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; careHomeId: string; handoverId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    if (!taskId) {
      return new NextResponse('Task ID is required', { status: 400 });
    }

    // Verify task exists and user has permission
    const existingTask = await prisma.handoverTask.findUnique({
      where: {
        id: taskId,
        handoverSessionId: params.handoverId,
      },
      include: {
        handoverSession: true,
      },
    });

    if (!existingTask) {
      return new NextResponse('Task not found', { status: 404 });
    }

    // Only allow deletion if handover is not completed/verified
    if (existingTask.handoverSession.status === 'COMPLETED' || existingTask.handoverSession.status === 'VERIFIED') {
      return new NextResponse('Cannot delete task from a completed handover', { status: 403 });
    }

    // Only allow creator or admin to delete
    if (existingTask.createdById !== session.user.id && session.user.role !== 'ADMIN') {
      return new NextResponse('Not authorized to delete this task', { status: 403 });
    }

    await prisma.handoverTask.delete({
      where: {
        id: taskId,
        handoverSessionId: params.handoverId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting handover task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
