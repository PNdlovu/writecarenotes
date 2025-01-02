/**
 * @writecarenotes.com
 * @fileoverview Domiciliary staff management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API endpoints for managing domiciliary care staff, including scheduling,
 * qualifications, availability, and performance tracking. Implements
 * comprehensive staff management with full regulatory compliance.
 *
 * Features:
 * - Staff profile management
 * - Qualification tracking
 * - Availability management
 * - Performance monitoring
 * - Training records
 * - Compliance checks
 *
 * Mobile-First Considerations:
 * - Optimized response size
 * - Offline data sync
 * - Location services
 * - Battery-efficient updates
 *
 * Enterprise Features:
 * - DBS verification
 * - Training compliance
 * - Audit logging
 * - Access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { StaffService } from '@/features/domiciliary/services/staffService';
import { rateLimit } from '@/lib/rateLimit';
import { auditLog } from '@/lib/audit';
import { validateStaffCompliance } from '@/lib/compliance';
import { handleOfflineSync } from '@/lib/offline';
import { encryptSensitiveData } from '@/lib/encryption';

// Initialize services
const staffService = new StaffService();

// Validation schemas
const staffSchema = z.object({
  organizationId: z.string(),
  personalInfo: z.object({
    title: z.string().optional(),
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.string(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
    niNumber: z.string(),
    dbsNumber: z.string(),
    dbsIssueDate: z.string(),
    rightToWork: z.boolean(),
    photo: z.string().optional(),
  }),
  contactInfo: z.object({
    address: z.object({
      line1: z.string(),
      line2: z.string().optional(),
      town: z.string(),
      county: z.string(),
      postcode: z.string(),
    }),
    phone: z.string(),
    mobile: z.string(),
    email: z.string().email(),
    emergencyContact: z.object({
      name: z.string(),
      relationship: z.string(),
      phone: z.string(),
    }),
  }),
  qualifications: z.array(z.object({
    type: z.string(),
    issuer: z.string(),
    issueDate: z.string(),
    expiryDate: z.string().optional(),
    verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']),
    document: z.string().optional(),
  })),
  training: z.array(z.object({
    course: z.string(),
    provider: z.string(),
    completionDate: z.string(),
    expiryDate: z.string().optional(),
    certificate: z.string().optional(),
    mandatory: z.boolean(),
  })),
  availability: z.object({
    workingHours: z.array(z.object({
      dayOfWeek: z.number(),
      startTime: z.string(),
      endTime: z.string(),
    })),
    preferences: z.object({
      maxVisitsPerDay: z.number(),
      maxTravelDistance: z.number(),
      preferredAreas: z.array(z.string()).optional(),
    }),
    exceptions: z.array(z.object({
      date: z.string(),
      type: z.enum(['HOLIDAY', 'SICK', 'TRAINING', 'OTHER']),
      notes: z.string().optional(),
    })).optional(),
  }),
  skills: z.array(z.object({
    category: z.string(),
    level: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'SPECIALIST']),
    verifiedBy: z.string().optional(),
    verificationDate: z.string().optional(),
  })).optional(),
});

const staffUpdateSchema = staffSchema.partial().extend({
  staffId: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ON_LEAVE']).optional(),
});

/**
 * GET /api/domiciliary/staff
 * Retrieves staff based on query parameters
 */
export async function GET(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'staff_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const qualification = searchParams.get('qualification');
    const availability = searchParams.get('availability');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get staff
    const staff = await staffService.getStaff({
      organizationId,
      status,
      search,
      qualification,
      availability,
      page,
      limit
    });

    // Handle offline sync
    const offlineData = await handleOfflineSync(req, 'staff', staff);

    // Audit log
    await auditLog.record({
      action: 'staff_retrieved',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { filters: { status, search, qualification, availability } }
    });

    return NextResponse.json(offlineData || staff);
  } catch (error) {
    console.error('Staff retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/domiciliary/staff
 * Creates a new staff member
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'staff_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Validate request body
    const body = await req.json();
    const data = staffSchema.parse(body);

    // Encrypt sensitive data
    const encryptedData = await encryptSensitiveData(data, ['niNumber', 'dbsNumber']);

    // Validate compliance
    const complianceResult = await validateStaffCompliance({
      organizationId: data.organizationId,
      staffData: encryptedData
    });

    if (!complianceResult.valid) {
      return NextResponse.json(
        { error: 'Compliance validation failed', details: complianceResult.errors },
        { status: 400 }
      );
    }

    // Create staff member
    const staff = await staffService.createStaff(encryptedData);

    // Audit log
    await auditLog.record({
      action: 'staff_created',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId: data.organizationId,
      details: { staffId: staff.id }
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error('Staff creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/domiciliary/staff
 * Updates an existing staff member
 */
export async function PUT(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'staff_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Validate request body
    const body = await req.json();
    const data = staffUpdateSchema.parse(body);

    // Encrypt sensitive data if present
    const encryptedData = await encryptSensitiveData(data, ['niNumber', 'dbsNumber']);

    // Update staff member
    const staff = await staffService.updateStaff(data.staffId, encryptedData);

    // Audit log
    await auditLog.record({
      action: 'staff_updated',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId: data.organizationId,
      details: { staffId: data.staffId, changes: Object.keys(data) }
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Staff update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 