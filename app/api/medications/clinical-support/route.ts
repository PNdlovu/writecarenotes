/**
 * @writecarenotes.com
 * @fileoverview Clinical Decision Support API routes
 * @version 1.0.0
 * @created 2024-01-05
 * @updated 2024-01-05
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API routes for clinical decision support including drug interactions,
 * weight-based dosing calculations, and clinical recommendations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { clinicalDecisionSupport } from '@/features/medications/services/clinicalDecisionSupport';
import { WeightBasedDosingService } from '@/features/medications/services/WeightBasedDosingService';
import { getCurrentUser } from '@/lib/auth/session';
import { validateRequest } from '@/lib/api/validation';
import { createAuditLog } from '@/lib/audit';
import { handleApiError } from '@/lib/api/error';
import { z } from 'zod';

const interactionCheckSchema = z.object({
  medications: z.array(z.string()),
  patientId: z.string(),
});

const weightBasedDosingSchema = z.object({
  medicationId: z.string(),
  weight: z.number(),
  age: z.number(),
  unit: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();
    const validatedData = interactionCheckSchema.parse(data);

    const interactions = await clinicalDecisionSupport.checkInteractions(
      validatedData.medications,
      validatedData.patientId
    );

    await createAuditLog({
      action: 'medication.interaction.check',
      entityType: 'medication',
      entityIds: validatedData.medications,
      performedBy: user.id,
      details: { interactions },
    });

    return NextResponse.json(interactions);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();
    const validatedData = weightBasedDosingSchema.parse(data);

    const dosingService = new WeightBasedDosingService();
    const dosing = await dosingService.calculateDose({
      medicationId: validatedData.medicationId,
      weight: validatedData.weight,
      age: validatedData.age,
      unit: validatedData.unit,
    });

    await createAuditLog({
      action: 'medication.dosing.calculate',
      entityType: 'medication',
      entityId: validatedData.medicationId,
      performedBy: user.id,
      details: { dosing, parameters: validatedData },
    });

    return NextResponse.json(dosing);
  } catch (error) {
    return handleApiError(error);
  }
} 