/**
 * @fileoverview Payments API Routes
 * @version 1.0.0
 * @created 2024-03-21
 */

import { NextResponse } from 'next/server';
import { PaymentService } from '@/features/accounting/services';
import { withApiMiddleware, ApiContext } from '../middleware';
import { z } from 'zod';

// Validation schemas
const paymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  method: z.enum(['CARD', 'BANK_TRANSFER', 'DIRECT_DEBIT', 'CASH']),
  reference: z.string().min(1),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const updateSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(['process', 'complete', 'fail', 'refund']),
  reason: z.string().optional()
});

export async function POST(request: Request) {
  return withApiMiddleware(request, async (context: ApiContext) => {
    try {
      const data = await request.json();
      const validatedData = paymentSchema.parse(data);

      const paymentService = PaymentService.getInstance();
      const payment = await paymentService.createPayment(
        context.organizationId,
        validatedData
      );

      return NextResponse.json(payment, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  });
}

export async function GET(request: Request) {
  return withApiMiddleware(request, async (context: ApiContext) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const paymentService = PaymentService.getInstance();
    const payments = await paymentService.getPaymentHistory(
      context.organizationId,
      {
        status: status as any,
        method: method as any,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      }
    );

    return NextResponse.json(payments);
  });
}

export async function PUT(request: Request) {
  return withApiMiddleware(request, async (context: ApiContext) => {
    try {
      const data = await request.json();
      const validatedData = updateSchema.parse(data);

      const paymentService = PaymentService.getInstance();
      let result;

      switch (validatedData.action) {
        case 'process':
          result = await paymentService.processPayment(
            validatedData.id,
            context.organizationId
          );
          break;

        case 'complete':
          result = await paymentService.completePayment(
            validatedData.id,
            context.organizationId
          );
          break;

        case 'fail':
          if (!validatedData.reason) {
            return NextResponse.json(
              { error: 'Reason is required for failed payments' },
              { status: 400 }
            );
          }
          result = await paymentService.failPayment(
            validatedData.id,
            context.organizationId,
            validatedData.reason
          );
          break;

        case 'refund':
          if (!validatedData.reason) {
            return NextResponse.json(
              { error: 'Reason is required for refunds' },
              { status: 400 }
            );
          }
          result = await paymentService.refundPayment(
            validatedData.id,
            context.organizationId,
            validatedData.reason
          );
          break;
      }

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  });
} 