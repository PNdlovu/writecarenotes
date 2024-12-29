import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { uploadToStorage, deleteFromStorage } from '@/lib/storage';
import { z } from 'zod';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_FILE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'audio/mpeg',
  'audio/wav',
]);

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'DOCUMENT' | 'IMAGE' | 'VOICE' | 'OTHER';
    const noteId = formData.get('noteId') as string | null;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new NextResponse('File size exceeds limit (20MB)', { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      return new NextResponse('File type not allowed', { status: 400 });
    }

    // If noteId is provided, verify it exists
    if (noteId) {
      const note = await prisma.handoverNote.findUnique({
        where: {
          id: noteId,
          handoverSessionId: params.handoverId,
        },
      });
      if (!note) {
        return new NextResponse('Note not found', { status: 404 });
      }
    }

    // Upload file to storage
    const { url, key } = await uploadToStorage(file, {
      organization: params.id,
      careHome: params.careHomeId,
      handover: params.handoverId,
      type,
    });

    // Create attachment record
    const attachment = await prisma.handoverAttachment.create({
      data: {
        handoverSessionId: params.handoverId,
        noteId,
        name: file.name,
        type,
        url,
        storageKey: key,
        size: file.size,
        mimeType: file.type,
        uploadedById: session.user.id,
        uploadedAt: new Date(),
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error('Error uploading attachment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

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
    const type = searchParams.get('type') as 'DOCUMENT' | 'IMAGE' | 'VOICE' | 'OTHER' | null;
    const noteId = searchParams.get('noteId');

    const attachments = await prisma.handoverAttachment.findMany({
      where: {
        handoverSessionId: params.handoverId,
        ...(type && { type }),
        ...(noteId && { noteId }),
      },
      orderBy: [
        { type: 'asc' },
        { uploadedAt: 'desc' },
      ],
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(attachments);
  } catch (error) {
    console.error('Error fetching attachments:', error);
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
    const attachmentId = searchParams.get('attachmentId');
    if (!attachmentId) {
      return new NextResponse('Attachment ID is required', { status: 400 });
    }

    // Verify attachment exists and user has permission
    const attachment = await prisma.handoverAttachment.findUnique({
      where: {
        id: attachmentId,
        handoverSessionId: params.handoverId,
      },
      include: {
        handoverSession: true,
      },
    });

    if (!attachment) {
      return new NextResponse('Attachment not found', { status: 404 });
    }

    // Only allow deletion if handover is not completed/verified
    if (attachment.handoverSession.status === 'COMPLETED' || attachment.handoverSession.status === 'VERIFIED') {
      return new NextResponse('Cannot delete attachment from a completed handover', { status: 403 });
    }

    // Only allow uploader or admin to delete
    if (attachment.uploadedById !== session.user.id && session.user.role !== 'ADMIN') {
      return new NextResponse('Not authorized to delete this attachment', { status: 403 });
    }

    // Delete from storage
    if (attachment.storageKey) {
      await deleteFromStorage(attachment.storageKey);
    }

    // Delete from database
    await prisma.handoverAttachment.delete({
      where: { id: attachmentId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
