import { NextResponse } from 'next/server';
import { organizationService } from '@/features/organizations/services/organizationService';
import { OrganizationAnalyticsService } from '@/features/organizations/services/analyticsService';
import { auth } from '@/lib/auth';

const analyticsService = new OrganizationAnalyticsService();

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    if (id) {
      const organization = await organizationService.getOrganization(id);
      if (!organization) {
        return new NextResponse('Organization not found', { status: 404 });
      }
      return NextResponse.json(organization);
    }

    const organizations = await organizationService.listOrganizations({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error in GET /api/organizations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const organization = await organizationService.createOrganization(body);
    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error in POST /api/organizations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return new NextResponse('Organization ID is required', { status: 400 });
    }

    const body = await req.json();
    const organization = await organizationService.updateOrganization(id, body);
    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error in PUT /api/organizations:', error);
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
    const id = searchParams.get('id');
    if (!id) {
      return new NextResponse('Organization ID is required', { status: 400 });
    }

    await organizationService.deleteOrganization(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/organizations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 