import { NextResponse } from 'next/server'
import { OrganizationService } from '../services/organizationService'
import { OrganizationAnalyticsService } from '../services/analyticsService'
import { auth } from '@/lib/auth'

const organizationService = new OrganizationService()
const analyticsService = new OrganizationAnalyticsService()

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')

    if (id) {
      const organization = await organizationService.getOrganization(id)
      if (!organization) {
        return new NextResponse('Organization not found', { status: 404 })
      }
      return NextResponse.json(organization)
    }

    const organizations = await organizationService.listOrganizations({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json(organizations)
  } catch (error) {
    console.error('Error in GET /api/organizations:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const organization = await organizationService.createOrganization(body)
    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error in POST /api/organizations:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return new NextResponse('Organization ID is required', { status: 400 })
    }

    const body = await req.json()
    const organization = await organizationService.updateOrganization(id, body)
    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error in PUT /api/organizations:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return new NextResponse('Organization ID is required', { status: 400 })
    }

    await organizationService.deleteOrganization(id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error in DELETE /api/organizations:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Analytics endpoints
export async function GET_ANALYTICS(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return new NextResponse('Organization ID is required', { status: 400 })
    }

    const report = await analyticsService.generateAnalyticsReport(id)
    return NextResponse.json(report)
  } catch (error) {
    console.error('Error in GET /api/organizations/analytics:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Care Home management endpoints
export async function POST_CARE_HOME(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get('organizationId')
    if (!organizationId) {
      return new NextResponse('Organization ID is required', { status: 400 })
    }

    const { careHomeId } = await req.json()
    if (!careHomeId) {
      return new NextResponse('Care Home ID is required', { status: 400 })
    }

    const organization = await organizationService.addCareHome(organizationId, careHomeId)
    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error in POST /api/organizations/care-home:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE_CARE_HOME(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get('organizationId')
    const careHomeId = searchParams.get('careHomeId')
    
    if (!organizationId || !careHomeId) {
      return new NextResponse('Organization ID and Care Home ID are required', { status: 400 })
    }

    const organization = await organizationService.removeCareHome(organizationId, careHomeId)
    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error in DELETE /api/organizations/care-home:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}


