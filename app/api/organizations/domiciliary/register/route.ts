import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/lib/auth';

// Validation schema for domiciliary registration
const registrationSchema = z.object({
  // Basic Organization Info
  name: z.string().min(2),
  type: z.literal('DOMICILIARY_CARE'),
  contact: z.object({
    email: z.string().email(),
    phone: z.string(),
    address: z.object({
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      county: z.string(),
      postcode: z.string(),
    }),
  }),

  // Service Configuration
  services: z.array(z.enum([
    'PERSONAL_CARE',
    'MEDICATION_SUPPORT',
    'MEAL_PREPARATION',
    'DOMESTIC_SUPPORT',
    'RESPITE_CARE',
    'LIVE_IN_CARE',
    'SPECIALIST_CARE'
  ])),
  operatingRegions: z.object({
    postcodes: z.array(z.string()),
    localAuthorities: z.array(z.string()),
  }),

  // Compliance Information
  compliance: z.object({
    regulatoryBody: z.enum(['CQC', 'CIW', 'RQIA', 'CI', 'HIQA']),
    registrationNumber: z.string(),
    registrationDate: z.string().transform(val => new Date(val)),
    lastInspection: z.string().transform(val => new Date(val)).optional(),
    rating: z.string().optional(),
  }),

  // Operational Settings
  operationalSettings: z.object({
    visitDurationDefault: z.number().min(15).max(240),
    travelTimeAllowance: z.number().min(5).max(60),
    breakRequirements: z.object({
      minimumBreakDuration: z.number(),
      breakFrequency: z.number(),
      paidBreaks: z.boolean(),
    }),
    onCallArrangements: z.object({
      enabled: z.boolean(),
      coverage: z.array(z.object({
        dayOfWeek: z.number(),
        startTime: z.string(),
        endTime: z.string(),
      })),
    }),
  }),

  // Operating Hours
  operatingHours: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string(),
    type: z.enum(['STANDARD', 'BANK_HOLIDAY', 'EMERGENCY']),
  })),

  // Service Requirements
  serviceRequirements: z.array(z.object({
    serviceType: z.enum([
      'PERSONAL_CARE',
      'MEDICATION_SUPPORT',
      'MEAL_PREPARATION',
      'DOMESTIC_SUPPORT',
      'RESPITE_CARE',
      'LIVE_IN_CARE',
      'SPECIALIST_CARE'
    ]),
    minimumStaff: z.number().min(1),
    requiredQualifications: z.array(z.string()),
    requiredTraining: z.array(z.string()),
  })),
});

export async function POST(req: Request) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const data = registrationSchema.parse(body);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create base organization
      const organization = await tx.organization.create({
        data: {
          name: data.name,
          type: 'DOMICILIARY_CARE',
          email: data.contact.email,
          phone: data.contact.phone,
          address: data.contact.address,
          status: 'PENDING_SETUP',
          createdBy: session.user.id,
          updatedBy: session.user.id,
        },
      });

      // Create domiciliary organization
      const domiciliaryOrg = await tx.domiciliaryOrganization.create({
        data: {
          organizationId: organization.id,
          services: data.services,
          operatingPostcodes: data.operatingRegions.postcodes,
          localAuthorities: data.operatingRegions.localAuthorities,
          regulatoryBody: data.compliance.regulatoryBody,
          registrationNumber: data.compliance.registrationNumber,
          registrationDate: data.compliance.registrationDate,
          lastInspectionDate: data.compliance.lastInspection,
          rating: data.compliance.rating,
          visitDurationDefault: data.operationalSettings.visitDurationDefault,
          travelTimeAllowance: data.operationalSettings.travelTimeAllowance,
          breakRequirements: data.operationalSettings.breakRequirements,
          onCallArrangements: data.operationalSettings.onCallArrangements,
          createdBy: session.user.id,
          updatedBy: session.user.id,
        },
      });

      // Create operating hours
      await tx.operatingHours.createMany({
        data: data.operatingHours.map(hours => ({
          ...hours,
          organizationId: organization.id,
        })),
      });

      // Create service requirements
      await tx.serviceRequirement.createMany({
        data: data.serviceRequirements.map(req => ({
          ...req,
          organizationId: organization.id,
        })),
      });

      return {
        organization,
        domiciliaryOrg,
      };
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: result,
      }),
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({
          error: 'Validation failed',
          details: error.errors,
        }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
} 