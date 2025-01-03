/**
 * @writecarenotes.com
 * @fileoverview API routes for domiciliary staff management
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { StaffManagement } from '@/features/staff/services/staffManagement';
import { authOptions } from '@/lib/auth';

// Validation schemas
const vehicleDetailsSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  registration: z.string().optional(),
  insurance: z.object({
    provider: z.string(),
    policyNumber: z.string(),
    expiryDate: z.string().transform(str => new Date(str)),
    businessUseIncluded: z.boolean()
  }).optional()
});

const clientPreferencesSchema = z.object({
  genderPreference: z.string().optional(),
  languageRequirements: z.array(z.string()).optional(),
  specialNeeds: z.array(z.string()).optional(),
  culturalRequirements: z.array(z.string()).optional()
});

const updateDomiciliaryDetailsSchema = z.object({
  staffId: z.string(),
  maxTravelDistance: z.number().optional(),
  preferredAreas: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  drivingLicense: z.boolean().optional(),
  hasVehicle: z.boolean().optional(),
  vehicleDetails: vehicleDetailsSchema.optional(),
  clientPreferences: clientPreferencesSchema.optional()
});

const availabilityQuerySchema = z.object({
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)),
  area: z.string().optional(),
  maxTravelDistance: z.number().optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  genderPreference: z.string().optional(),
  culturalRequirements: z.array(z.string()).optional()
});

const staffService = new StaffManagement();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'available': {
        const query = availabilityQuerySchema.parse({
          startTime: searchParams.get('startTime'),
          endTime: searchParams.get('endTime'),
          area: searchParams.get('area'),
          maxTravelDistance: searchParams.get('maxTravelDistance') ? 
            parseInt(searchParams.get('maxTravelDistance')!) : undefined,
          specialties: searchParams.getAll('specialties'),
          languages: searchParams.getAll('languages'),
          genderPreference: searchParams.get('genderPreference'),
          culturalRequirements: searchParams.getAll('culturalRequirements')
        });

        const staff = await staffService.getAvailableStaff(
          session.user.organizationId,
          query.startTime,
          query.endTime,
          query.area,
          {
            maxTravelDistance: query.maxTravelDistance,
            specialties: query.specialties,
            languages: query.languages,
            genderPreference: query.genderPreference,
            culturalRequirements: query.culturalRequirements
          }
        );

        return Response.json(staff);
      }

      case 'expiring-vehicle-docs': {
        const daysThreshold = searchParams.get('daysThreshold') ? 
          parseInt(searchParams.get('daysThreshold')!) : 30;

        const staff = await staffService.getStaffWithExpiringVehicleDocuments(
          session.user.organizationId,
          daysThreshold
        );

        return Response.json(staff);
      }

      default:
        return new Response('Invalid query type', { status: 400 });
    }
  } catch (error) {
    console.error('Error in domiciliary staff GET:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const data = updateDomiciliaryDetailsSchema.parse(body);

    const staff = await staffService.upsertStaffProfile(
      {
        organizationId: session.user.organizationId,
        userId: data.staffId,
        ...data
      },
      session.user.id
    );

    return Response.json(staff);
  } catch (error) {
    console.error('Error in domiciliary staff PUT:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 
