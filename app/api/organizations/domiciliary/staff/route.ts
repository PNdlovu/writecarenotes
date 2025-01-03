/**
 * @writecarenotes.com
 * @fileoverview API routes for domiciliary staff management
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles API endpoints for managing domiciliary care staff including
 * profiles, qualifications, availability, and assignments.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { DomiciliaryStaffManagement } from '@/features/domiciliary/services/staffManagement';

const staffService = new DomiciliaryStaffManagement();

// Validation schemas
const staffProfileSchema = z.object({
  organizationId: z.string(),
  userId: z.string(),
  role: z.string(),
  maxTravelDistance: z.number().optional(),
  preferredAreas: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  drivingLicense: z.boolean().optional(),
  hasVehicle: z.boolean().optional(),
  dbsCheckDate: z.string().transform(val => new Date(val)).optional(),
  dbsNumber: z.string().optional(),
  trainingCompleted: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const qualificationSchema = z.object({
  organizationId: z.string(),
  staffId: z.string(),
  type: z.string(),
  name: z.string(),
  issuedBy: z.string(),
  issueDate: z.string().transform(val => new Date(val)),
  expiryDate: z.string().transform(val => new Date(val)).optional(),
  verificationStatus: z.string(),
  verifiedBy: z.string().optional(),
  verificationDate: z.string().transform(val => new Date(val)).optional(),
  attachmentUrl: z.string().optional(),
  notes: z.string().optional(),
});

const availabilitySchema = z.object({
  organizationId: z.string(),
  staffId: z.string(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  isRecurring: z.boolean(),
  effectiveFrom: z.string().transform(val => new Date(val)),
  effectiveTo: z.string().transform(val => new Date(val)).optional(),
  notes: z.string().optional(),
});

const assignmentSchema = z.object({
  organizationId: z.string(),
  staffId: z.string(),
  clientId: z.string(),
  visitId: z.string(),
  startTime: z.string().transform(val => new Date(val)),
  endTime: z.string().transform(val => new Date(val)),
  status: z.string(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, data } = body;

    switch (type) {
      case 'PROFILE':
        const profileData = staffProfileSchema.parse(data);
        const profile = await staffService.upsertStaffProfile(
          profileData,
          session.user.id
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: profile }),
          { status: 200 }
        );

      case 'QUALIFICATION':
        const qualificationData = qualificationSchema.parse(data);
        const qualification = await staffService.createQualification(
          qualificationData,
          session.user.id
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: qualification }),
          { status: 200 }
        );

      case 'AVAILABILITY':
        const availabilityData = availabilitySchema.parse(data);
        const availability = await staffService.createAvailability(
          availabilityData,
          session.user.id
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: availability }),
          { status: 200 }
        );

      case 'ASSIGNMENT':
        const assignmentData = assignmentSchema.parse(data);
        const assignment = await staffService.createAssignment(
          assignmentData,
          session.user.id
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: assignment }),
          { status: 200 }
        );

      default:
        return new NextResponse(
          JSON.stringify({ error: 'Invalid operation type' }),
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Staff management error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, id, data } = body;

    switch (type) {
      case 'QUALIFICATION':
        const qualificationData = qualificationSchema.partial().parse(data);
        const qualification = await staffService.updateQualification(
          id,
          qualificationData,
          session.user.id
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: qualification }),
          { status: 200 }
        );

      case 'AVAILABILITY':
        const availabilityData = availabilitySchema.partial().parse(data);
        const availability = await staffService.updateAvailability(
          id,
          availabilityData,
          session.user.id
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: availability }),
          { status: 200 }
        );

      case 'ASSIGNMENT':
        const assignmentData = assignmentSchema.partial().parse(data);
        const assignment = await staffService.updateAssignment(
          id,
          assignmentData,
          session.user.id
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: assignment }),
          { status: 200 }
        );

      default:
        return new NextResponse(
          JSON.stringify({ error: 'Invalid operation type' }),
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Staff management error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
} 
