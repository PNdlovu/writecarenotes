import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const StaffUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']).optional(),
  qualifications: z.array(z.string()).optional(),
  notes: z.string().optional()
});

// GET /api/staff/[staffId]
export async function GET(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { staffId } = params;
    const staffMember = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        qualifications: true,
        department: true
      }
    });

    if (!staffMember) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json(staffMember);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/staff/[staffId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { staffId } = params;
    const body = await request.json();
    const data = StaffUpdateSchema.parse(body);

    const staffMember = await prisma.staff.update({
      where: { id: staffId },
      data: {
        ...data,
        qualifications: data.qualifications ? {
          set: data.qualifications.map(id => ({ id }))
        } : undefined
      },
      include: {
        qualifications: true,
        department: true
      }
    });

    return NextResponse.json(staffMember);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating staff member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/staff/[staffId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { staffId } = params;
    await prisma.staff.delete({
      where: { id: staffId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 