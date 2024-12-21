import { NextResponse } from 'next/server';
import { organizationService } from '@/features/organizations/services/organizationService';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    if (!organizationId) {
      return new NextResponse('Organization ID is required', { status: 400 });
    }

    const { careHomeId } = await req.json();
    if (!careHomeId) {
      return new NextResponse('Care Home ID is required', { status: 400 });
    }

    const organization = await organizationService.addCareHome(organizationId, careHomeId);
    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error in POST /api/organizations/care-homes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const careHomeId = searchParams.get('careHomeId');
    
    if (!organizationId || !careHomeId) {
      return new NextResponse('Organization ID and Care Home ID are required', { status: 400 });
    }

    const organization = await organizationService.removeCareHome(organizationId, careHomeId);
    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error in DELETE /api/organizations/care-homes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 