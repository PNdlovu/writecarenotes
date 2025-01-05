/**
 * @writecarenotes.com
 * @fileoverview Healthcare Integration API routes
 * @version 1.0.0
 * @created 2024-01-05
 * @updated 2024-01-05
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API routes for healthcare system integrations including
 * pharmacy systems, NHS spine, and supplier connections.
 */

import { NextRequest, NextResponse } from 'next/server';
import { healthcareIntegration } from '@/features/medications/services/healthcareIntegration';
import { pharmacyService } from '@/features/medications/services/pharmacyService';
import { supplierService } from '@/features/medications/services/supplierService';
import { getCurrentUser } from '@/lib/auth/session';
import { validateRequest } from '@/lib/api/validation';
import { createAuditLog } from '@/lib/audit';
import { handleApiError } from '@/lib/api/error';
import { z } from 'zod';

const prescriptionSyncSchema = z.object({
  residentId: z.string(),
  pharmacyId: z.string(),
  fromDate: z.string().datetime(),
  toDate: z.string().datetime().optional(),
});

const supplierOrderSchema = z.object({
  supplierId: z.string(),
  items: z.array(z.object({
    medicationId: z.string(),
    quantity: z.number(),
    unit: z.string(),
  })),
  deliveryDate: z.string().datetime(),
  urgency: z.enum(['NORMAL', 'URGENT']),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const validatedParams = prescriptionSyncSchema.parse(searchParams);

    const prescriptions = await pharmacyService.syncPrescriptions({
      ...validatedParams,
      requestedBy: user.id,
    });

    await createAuditLog({
      action: 'pharmacy.prescriptions.sync',
      entityType: 'resident',
      entityId: validatedParams.residentId,
      performedBy: user.id,
      details: validatedParams,
    });

    return NextResponse.json(prescriptions);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();
    const validatedData = supplierOrderSchema.parse(data);

    const order = await supplierService.createOrder({
      ...validatedData,
      orderedBy: user.id,
      status: 'PENDING',
    });

    await createAuditLog({
      action: 'supplier.order.create',
      entityType: 'supplier',
      entityId: validatedData.supplierId,
      performedBy: user.id,
      details: { ...validatedData, orderId: order.id },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { orderId } = await req.json();
    
    if (!orderId) {
      return new NextResponse('Order ID is required', { status: 400 });
    }

    const status = await supplierService.checkOrderStatus(orderId);

    return NextResponse.json({ orderId, status });
  } catch (error) {
    return handleApiError(error);
  }
} 