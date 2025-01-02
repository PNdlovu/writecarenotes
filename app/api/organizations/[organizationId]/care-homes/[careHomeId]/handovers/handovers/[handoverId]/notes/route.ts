import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

const handoverNoteSchema = z.object({
  content: z.string(),
  category: z.enum(['GENERAL', 'URGENT', 'FOLLOWUP', 'TASK']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.enum(['DOCUMENT', 'IMAGE', 'VOICE', 'OTHER']),
  })).optional(),
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

    const notes = await prisma.handoverNote.findMany({
      where: {
        handoverSessionId: params.handoverId,
      },
      orderBy: [
        { priority: 'desc' },
        { timestamp: 'desc' },
      ],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching handover notes:', error);
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
    const validatedData = handoverNoteSchema.parse(body);

    const note = await prisma.handoverNote.create({
      data: {
        ...validatedData,
        handoverSessionId: params.handoverId,
        authorId: session.user.id,
        timestamp: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        attachments: true,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('Error creating handover note:', error);
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
    const noteId = searchParams.get('noteId');
    if (!noteId) {
      return new NextResponse('Note ID is required', { status: 400 });
    }

    // Verify note exists and user has permission
    const existingNote = await prisma.handoverNote.findUnique({
      where: {
        id: noteId,
        handoverSessionId: params.handoverId,
      },
      include: {
        handoverSession: true,
      },
    });

    if (!existingNote) {
      return new NextResponse('Note not found', { status: 404 });
    }

    // Only allow updates if handover is not completed/verified
    if (existingNote.handoverSession.status === 'COMPLETED' || existingNote.handoverSession.status === 'VERIFIED') {
      return new NextResponse('Cannot update note in a completed handover', { status: 403 });
    }

    // Only allow author or admin to update
    if (existingNote.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return new NextResponse('Not authorized to update this note', { status: 403 });
    }

    const body = await request.json();
    const validatedData = handoverNoteSchema.partial().parse(body);

    const note = await prisma.handoverNote.update({
      where: {
        id: noteId,
        handoverSessionId: params.handoverId,
      },
      data: validatedData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        attachments: true,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('Error updating handover note:', error);
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
    const noteId = searchParams.get('noteId');
    if (!noteId) {
      return new NextResponse('Note ID is required', { status: 400 });
    }

    // Verify note exists and user has permission
    const existingNote = await prisma.handoverNote.findUnique({
      where: {
        id: noteId,
        handoverSessionId: params.handoverId,
      },
      include: {
        handoverSession: true,
      },
    });

    if (!existingNote) {
      return new NextResponse('Note not found', { status: 404 });
    }

    // Only allow deletion if handover is not completed/verified
    if (existingNote.handoverSession.status === 'COMPLETED' || existingNote.handoverSession.status === 'VERIFIED') {
      return new NextResponse('Cannot delete note from a completed handover', { status: 403 });
    }

    // Only allow author or admin to delete
    if (existingNote.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return new NextResponse('Not authorized to delete this note', { status: 403 });
    }

    await prisma.handoverNote.delete({
      where: {
        id: noteId,
        handoverSessionId: params.handoverId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting handover note:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
