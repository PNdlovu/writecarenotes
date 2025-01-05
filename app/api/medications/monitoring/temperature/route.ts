/**
 * @writecarenotes.com
 * @fileoverview Temperature Monitoring API routes
 * @version 1.0.0
 * @created 2024-01-05
 * @updated 2024-01-05
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API routes for medication storage temperature monitoring including
 * logging, alerts, and compliance reporting.
 */

import { NextRequest, NextResponse } from 'next/server';
import { temperatureMonitoringService } from '@/features/medications/services/temperatureMonitoringService';
import { getCurrentUser } from '@/lib/auth/session';
import { validateRequest } from '@/lib/api/validation';
import { createAuditLog } from '@/lib/audit';
import { handleApiError } from '@/lib/api/error';
import { z } from 'zod';

const temperatureLogSchema = z.object({
  locationId: z.string(),
  temperature: z.number(),
  humidity: z.number().optional(),
  timestamp: z.string().datetime(),
});

const querySchema = z.object({
  locationId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const validatedParams = querySchema.parse(searchParams);

    const logs = await temperatureMonitoringService.getTemperatureLogs(
      validatedParams.locationId,
      new Date(validatedParams.startDate),
      new Date(validatedParams.endDate)
    );

    return NextResponse.json(logs);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();
    const validatedData = temperatureLogSchema.parse(data);

    const log = await temperatureMonitoringService.logTemperature({
      ...validatedData,
      recordedBy: user.id,
    });

    await createAuditLog({
      action: 'temperature.log',
      entityType: 'storage',
      entityId: validatedData.locationId,
      performedBy: user.id,
      details: validatedData,
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
} 