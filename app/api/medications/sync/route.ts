/**
 * @writecarenotes.com
 * @fileoverview Medication Sync API routes
 * @version 1.0.0
 * @created 2024-01-05
 * @updated 2024-01-05
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API routes for medication data synchronization including
 * offline support, conflict resolution, and sync status tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { OfflineSupportService } from '@/features/medications/services/OfflineSupportService';
import { getCurrentUser } from '@/lib/auth/session';
import { validateRequest } from '@/lib/api/validation';
import { createAuditLog } from '@/lib/audit';
import { handleApiError } from '@/lib/api/error';
import { z } from 'zod';

const syncRequestSchema = z.object({
  deviceId: z.string(),
  lastSyncTimestamp: z.string().datetime(),
  dataType: z.enum(['MEDICATIONS', 'MAR', 'STOCK', 'ALL']),
  changes: z.array(z.object({
    type: z.enum(['CREATE', 'UPDATE', 'DELETE']),
    entity: z.string(),
    entityId: z.string(),
    timestamp: z.string().datetime(),
    data: z.record(z.any()),
  })).optional(),
});

const conflictResolutionSchema = z.object({
  syncId: z.string(),
  resolutions: z.array(z.object({
    entityId: z.string(),
    resolution: z.enum(['LOCAL', 'REMOTE', 'MERGE']),
    mergedData: z.record(z.any()).optional(),
  })),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const deviceId = req.nextUrl.searchParams.get('deviceId');
    
    if (!deviceId) {
      return new NextResponse('Device ID is required', { status: 400 });
    }

    const offlineService = new OfflineSupportService();
    const syncStatus = await offlineService.getSyncStatus(deviceId);

    return NextResponse.json(syncStatus);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();
    const validatedData = syncRequestSchema.parse(data);

    const offlineService = new OfflineSupportService();
    const syncResult = await offlineService.synchronize({
      ...validatedData,
      userId: user.id,
    });

    if (syncResult.conflicts.length > 0) {
      await createAuditLog({
        action: 'sync.conflicts.detected',
        entityType: 'sync',
        entityId: syncResult.syncId,
        performedBy: user.id,
        details: { conflicts: syncResult.conflicts },
      });
    }

    return NextResponse.json(syncResult);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();
    const validatedData = conflictResolutionSchema.parse(data);

    const offlineService = new OfflineSupportService();
    const resolution = await offlineService.resolveConflicts({
      ...validatedData,
      resolvedBy: user.id,
    });

    await createAuditLog({
      action: 'sync.conflicts.resolved',
      entityType: 'sync',
      entityId: validatedData.syncId,
      performedBy: user.id,
      details: { resolutions: validatedData.resolutions },
    });

    return NextResponse.json(resolution);
  } catch (error) {
    return handleApiError(error);
  }
} 