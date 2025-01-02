import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { validateRequest } from '@/lib/auth';
import { handleOfflineSync } from '@/lib/offline';
import { validateRegionalCompliance } from '@/lib/compliance';
import { createAuditLog } from '@/lib/audit';

const StaffSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: z.string(),
  department: z.string(),
  startDate: z.string().datetime(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']),
  qualifications: z.array(z.string()).optional(),
  notes: z.string().optional()
});

// GET /api/staff
export async function GET(request: NextRequest) {
  try {
    // Validate request and get user context
    const { user, organization } = await validateRequest(request);
    
    // Handle offline sync request
    const isOfflineSync = request.headers.get('x-offline-sync');
    if (isOfflineSync) {
      return handleOfflineSync(request, user, 'staff');
    }

    // Get query parameters with regional context
    const searchParams = new URL(request.url).searchParams;
    const query = {
      region: searchParams.get('region') || organization.region,
      language: searchParams.get('language') || 'en',
      includeOfflineData: searchParams.get('includeOfflineData') === 'true'
    };

    // Fetch staff with proper tenant isolation
    const staffMembers = await prisma.staff.findMany({
      where: {
        orgId: organization.id,
        // Add regional filtering if specified
        ...(query.region && { region: query.region })
      },
      include: {
        department: true,
        qualifications: true,
        // Include offline data if requested
        ...(query.includeOfflineData && {
          offlineData: true,
          lastSyncedAt: true
        })
      }
    });

    // Create audit log
    await createAuditLog({
      action: 'STAFF_LIST_VIEWED',
      userId: user.id,
      orgId: organization.id,
      details: { query }
    });

    return NextResponse.json({ data: staffMembers });
  } catch (error) {
    console.error('Staff GET error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/staff
export async function POST(request: NextRequest) {
  try {
    // Validate request and get user context
    const { user, organization } = await validateRequest(request);
    
    // Parse request body
    const body = await request.json();

    // Validate regional compliance
    const complianceResult = await validateRegionalCompliance({
      type: 'STAFF_CREATE',
      data: body,
      region: organization.region
    });

    if (!complianceResult.valid) {
      return NextResponse.json(
        { error: 'Compliance validation failed', details: complianceResult.errors },
        { status: 422 }
      );
    }

    // Create staff member with compliance status
    const staffMember = await prisma.staff.create({
      data: {
        ...body,
        orgId: organization.id,
        complianceStatus: complianceResult.status,
        // Set initial sync status
        syncStatus: 'SYNCED',
        version: 1
      }
    });

    // Create audit log
    await createAuditLog({
      action: 'STAFF_CREATED',
      userId: user.id,
      orgId: organization.id,
      details: { staffId: staffMember.id }
    });

    return NextResponse.json({ data: staffMember }, { status: 201 });
  } catch (error) {
    console.error('Staff POST error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 