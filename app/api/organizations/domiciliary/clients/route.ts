/**
 * @writecarenotes.com
 * @fileoverview API routes for domiciliary client management
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles API endpoints for managing domiciliary care clients including
 * profiles, assessments, home environment, and emergency contacts.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { DomiciliaryClientManagement } from '@/features/domiciliary/services/clientManagement';

const clientService = new DomiciliaryClientManagement();

// Validation schemas
const clientProfileSchema = z.object({
  organizationId: z.string(),
  clientId: z.string(),
  preferredTitle: z.string().optional(),
  preferredName: z.string().optional(),
  preferredLanguage: z.string().optional(),
  communicationNeeds: z.array(z.string()).optional(),
  culturalPreferences: z.array(z.string()).optional(),
  dietaryRequirements: z.array(z.string()).optional(),
  mobilityNeeds: z.array(z.string()).optional(),
});

const homeEnvironmentSchema = z.object({
  organizationId: z.string(),
  clientId: z.string(),
  address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    county: z.string(),
    postcode: z.string(),
  }),
  accessInstructions: z.string().optional(),
  keySafeCode: z.string().optional(),
  keySafeLocation: z.string().optional(),
  parkingInformation: z.string().optional(),
  nearestBusStop: z.string().optional(),
  propertyType: z.string().optional(),
  floorLevel: z.string().optional(),
  hasLift: z.boolean().optional(),
  hasStairs: z.boolean().optional(),
  numberOfSteps: z.number().optional(),
  hasRamp: z.boolean().optional(),
  utilities: z.object({
    heating: z.string().optional(),
    water: z.string().optional(),
    electricity: z.string().optional(),
    gas: z.string().optional(),
  }).optional(),
  equipmentAvailable: z.array(z.string()).optional(),
  hazards: z.array(z.string()).optional(),
  petInformation: z.string().optional(),
});

const emergencyContactSchema = z.object({
  organizationId: z.string(),
  clientId: z.string(),
  name: z.string(),
  relationship: z.string(),
  phone: z.string(),
  alternativePhone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    county: z.string(),
    postcode: z.string(),
  }).optional(),
  hasKeyAccess: z.boolean().optional(),
  isNextOfKin: z.boolean().optional(),
  isEmergencyContact: z.boolean().optional(),
  canDiscussHealth: z.boolean().optional(),
  canDiscussFinance: z.boolean().optional(),
  notes: z.string().optional(),
});

const assessmentSchema = z.object({
  organizationId: z.string(),
  clientId: z.string(),
  assessmentType: z.string(),
  assessmentDate: z.string().transform(val => new Date(val)),
  assessedBy: z.string(),
  personalCare: z.record(z.any()).optional(),
  mobility: z.record(z.any()).optional(),
  nutrition: z.record(z.any()).optional(),
  medication: z.record(z.any()).optional(),
  communication: z.record(z.any()).optional(),
  mentalHealth: z.record(z.any()).optional(),
  socialNeeds: z.record(z.any()).optional(),
  risks: z.record(z.any()).optional(),
  recommendations: z.array(z.string()).optional(),
  outcome: z.string().optional(),
  nextReviewDate: z.string().transform(val => new Date(val)).optional(),
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
        const profileData = clientProfileSchema.parse(data);
        const profile = await clientService.upsertClientProfile(
          profileData,
          session.user.id
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: profile }),
          { status: 200 }
        );

      case 'HOME_ENVIRONMENT':
        const environmentData = homeEnvironmentSchema.parse(data);
        const environment = await clientService.upsertHomeEnvironment(
          environmentData,
          session.user.id
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: environment }),
          { status: 200 }
        );

      case 'EMERGENCY_CONTACT':
        const contactData = emergencyContactSchema.parse(data);
        const contact = await clientService.createEmergencyContact(
          contactData,
          session.user.id
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: contact }),
          { status: 200 }
        );

      case 'ASSESSMENT':
        const assessmentData = assessmentSchema.parse(data);
        const assessment = await clientService.createAssessment(
          assessmentData,
          session.user.id
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: assessment }),
          { status: 200 }
        );

      default:
        return new NextResponse(
          JSON.stringify({ error: 'Invalid operation type' }),
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Client management error:', error);
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
      case 'EMERGENCY_CONTACT':
        const contactData = emergencyContactSchema.partial().parse(data);
        const contact = await clientService.updateEmergencyContact(
          id,
          contactData,
          session.user.id
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: contact }),
          { status: 200 }
        );

      case 'ASSESSMENT':
        const assessmentData = assessmentSchema.partial().parse(data);
        const assessment = await clientService.updateAssessment(
          id,
          assessmentData,
          session.user.id
        );
        return new NextResponse(
          JSON.stringify({ success: true, data: assessment }),
          { status: 200 }
        );

      default:
        return new NextResponse(
          JSON.stringify({ error: 'Invalid operation type' }),
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Client management error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
} 
