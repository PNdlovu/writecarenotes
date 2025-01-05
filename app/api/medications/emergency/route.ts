/**
 * @writecarenotes.com
 * @fileoverview Emergency Protocols API routes
 * @version 1.0.0
 * @created 2024-01-05
 * @updated 2024-01-05
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API routes for emergency medication protocols including
 * protocol management, emergency actions, and audit logging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { EmergencyProtocolService } from '@/features/medications/services/EmergencyProtocolService';
import { getCurrentUser } from '@/lib/auth/session';
import { validateRequest } from '@/lib/api/validation';
import { createAuditLog } from '@/lib/audit';
import { handleApiError } from '@/lib/api/error';
import { z } from 'zod';

const emergencyProtocolSchema = z.object({
  residentId: z.string(),
  medicationId: z.string(),
  condition: z.string(),
  instructions: z.string(),
  maxDosage: z.number(),
  frequency: z.string(),
  authorizedBy: z.string(),
});

const emergencyActionSchema = z.object({
  protocolId: z.string(),
  residentId: z.string(),
  medicationId: z.string(),
  dosageGiven: z.number(),
  reason: z.string(),
  outcome: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const residentId = req.nextUrl.searchParams.get('residentId');
    
    if (!residentId) {
      return new NextResponse('Resident ID is required', { status: 400 });
    }

    const protocolService = new EmergencyProtocolService();
    const protocols = await protocolService.getProtocols(residentId);

    return NextResponse.json(protocols);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();
    const validatedData = emergencyProtocolSchema.parse(data);

    const protocolService = new EmergencyProtocolService();
    const protocol = await protocolService.createProtocol({
      ...validatedData,
      createdBy: user.id,
    });

    await createAuditLog({
      action: 'emergency.protocol.create',
      entityType: 'resident',
      entityId: validatedData.residentId,
      performedBy: user.id,
      details: validatedData,
    });

    return NextResponse.json(protocol, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();
    const validatedData = emergencyActionSchema.parse(data);

    const protocolService = new EmergencyProtocolService();
    const action = await protocolService.recordEmergencyAction({
      ...validatedData,
      performedBy: user.id,
      timestamp: new Date(),
    });

    await createAuditLog({
      action: 'emergency.action.record',
      entityType: 'resident',
      entityId: validatedData.residentId,
      performedBy: user.id,
      details: { ...validatedData, actionId: action.id },
    });

    return NextResponse.json(action);
  } catch (error) {
    return handleApiError(error);
  }
} 