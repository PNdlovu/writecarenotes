/**
 * @writecarenotes.com
 * @fileoverview Domiciliary client management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API endpoints for managing domiciliary care clients, including assessments,
 * care plans, and service delivery tracking. Implements comprehensive client
 * management with full regulatory compliance and data protection.
 *
 * Features:
 * - Client profile management
 * - Care needs assessment
 * - Service package configuration
 * - Document management
 * - Contact management
 * - Risk assessment
 *
 * Mobile-First Considerations:
 * - Optimized response size
 * - Offline data sync
 * - Secure data handling
 * - Battery-efficient updates
 *
 * Enterprise Features:
 * - GDPR compliance
 * - Data encryption
 * - Audit logging
 * - Access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ClientService } from '@/features/domiciliary/services/clientService';
import { rateLimit } from '@/lib/rateLimit';
import { auditLog } from '@/lib/audit';
import { validateClientCompliance } from '@/lib/compliance';
import { handleOfflineSync } from '@/lib/offline';
import { encryptSensitiveData } from '@/lib/encryption';

// Initialize services
const clientService = new ClientService();

// Validation schemas
const clientSchema = z.object({
  organizationId: z.string(),
  personalInfo: z.object({
    title: z.string().optional(),
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.string(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
    nhsNumber: z.string().optional(),
    niNumber: z.string().optional(),
    ethnicity: z.string().optional(),
    religion: z.string().optional(),
    preferredLanguage: z.string().optional(),
    communicationNeeds: z.array(z.string()).optional(),
  }),
  contactInfo: z.object({
    address: z.object({
      line1: z.string(),
      line2: z.string().optional(),
      town: z.string(),
      county: z.string(),
      postcode: z.string(),
    }),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    email: z.string().email().optional(),
    preferredContact: z.enum(['PHONE', 'MOBILE', 'EMAIL']).optional(),
  }),
  accessInfo: z.object({
    keySafe: z.boolean(),
    keySafeCode: z.string().optional(),
    keySafeLocation: z.string().optional(),
    accessNotes: z.string().optional(),
    parkingAvailable: z.boolean().optional(),
    parkingNotes: z.string().optional(),
  }),
  emergencyContacts: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
    mobile: z.string().optional(),
    hasKey: z.boolean(),
    isPrimaryContact: z.boolean(),
  })).optional(),
  medicalInfo: z.object({
    gpName: z.string(),
    gpSurgery: z.string(),
    gpPhone: z.string(),
    medicalConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      notes: z.string().optional(),
    })).optional(),
  }).optional(),
  preferences: z.object({
    staffGenderPreference: z.enum(['MALE', 'FEMALE', 'NO_PREFERENCE']).optional(),
    visitTimes: z.array(z.object({
      dayOfWeek: z.number(),
      preferredTime: z.string(),
    })).optional(),
    culturalPreferences: z.array(z.string()).optional(),
    dietaryRequirements: z.array(z.string()).optional(),
  }).optional(),
});

const clientUpdateSchema = clientSchema.partial().extend({
  clientId: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_HOLD', 'DECEASED']).optional(),
});

/**
 * GET /api/domiciliary/clients
 * Retrieves clients based on query parameters
 */
export async function GET(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'clients_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const postcode = searchParams.get('postcode');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get clients
    const clients = await clientService.getClients({
      organizationId,
      status,
      search,
      postcode,
      page,
      limit
    });

    // Handle offline sync
    const offlineData = await handleOfflineSync(req, 'clients', clients);

    // Audit log
    await auditLog.record({
      action: 'clients_retrieved',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId,
      details: { filters: { status, search, postcode, page, limit } }
    });

    return NextResponse.json(offlineData || clients);
  } catch (error) {
    console.error('Client retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/domiciliary/clients
 * Creates a new client
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'clients_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Validate request body
    const body = await req.json();
    const data = clientSchema.parse(body);

    // Encrypt sensitive data
    const encryptedData = await encryptSensitiveData(data, ['keySafeCode', 'niNumber', 'medicalInfo']);

    // Validate compliance
    const complianceResult = await validateClientCompliance({
      organizationId: data.organizationId,
      clientData: encryptedData
    });

    if (!complianceResult.valid) {
      return NextResponse.json(
        { error: 'Compliance validation failed', details: complianceResult.errors },
        { status: 400 }
      );
    }

    // Create client
    const client = await clientService.createClient(encryptedData);

    // Audit log
    await auditLog.record({
      action: 'client_created',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId: data.organizationId,
      details: { clientId: client.id }
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Client creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/domiciliary/clients
 * Updates an existing client
 */
export async function PUT(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(req, 'clients_api');
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Validate request body
    const body = await req.json();
    const data = clientUpdateSchema.parse(body);

    // Encrypt sensitive data if present
    const encryptedData = await encryptSensitiveData(data, ['keySafeCode', 'niNumber', 'medicalInfo']);

    // Update client
    const client = await clientService.updateClient(data.clientId, encryptedData);

    // Audit log
    await auditLog.record({
      action: 'client_updated',
      module: 'domiciliary',
      userId: session.user.id,
      organizationId: data.organizationId,
      details: { clientId: data.clientId, changes: Object.keys(data) }
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Client update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 