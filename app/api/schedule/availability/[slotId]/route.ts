import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// DELETE /api/schedule/availability/[slotId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slotId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slotId } = params;

    await prisma.staffAvailability.delete({
      where: { id: slotId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting availability slot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 