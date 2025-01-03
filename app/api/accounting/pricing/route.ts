/**
 * @fileoverview Pricing API Routes
 * @version 1.0.0
 * @created 2024-03-21
 */

import { NextResponse } from 'next/server';
import { PricingService } from '@/features/accounting/services';
import { withApiMiddleware, ApiContext } from '../middleware';
import { z } from 'zod';

// Validation schemas
const priceConfigSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['FIXED', 'VARIABLE', 'TIERED', 'VOLUME']),
  currency: z.string().length(3),
  amount: z.number().positive(),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
  rules: z.array(z.object({
    condition: z.string(),
    value: z.number()
  })).optional(),
  metadata: z.record(z.any()).optional()
});

const updateConfigSchema = z.object({
  id: z.string().uuid(),
  updates: z.object({
    name: z.string().min(1).optional(),
    amount: z.number().positive().optional(),
    effectiveTo: z.string().datetime().optional(),
    rules: z.array(z.object({
      condition: z.string(),
      value: z.number()
    })).optional(),
    metadata: z.record(z.any()).optional()
  })
});

export async function POST(request: Request) {
  return withApiMiddleware(request, async (context: ApiContext) => {
    try {
      const data = await request.json();
      const validatedData = priceConfigSchema.parse(data);

      const pricingService = PricingService.getInstance();
      const priceConfig = await pricingService.createPriceConfiguration(
        context.organizationId,
        validatedData
      );

      return NextResponse.json(priceConfig, { status: 201 });
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
    const type = searchParams.get('type');
    const effectiveDate = searchParams.get('effectiveDate');
    const currency = searchParams.get('currency');

    const pricingService = PricingService.getInstance();
    const priceConfigs = await pricingService.getPriceConfigs(
      context.organizationId,
      {
        type: type as any,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
        currency: currency
      }
    );

    return NextResponse.json(priceConfigs);
  });
}

export async function PUT(request: Request) {
  return withApiMiddleware(request, async (context: ApiContext) => {
    try {
      const data = await request.json();
      const validatedData = updateConfigSchema.parse(data);

      const pricingService = PricingService.getInstance();
      const updatedConfig = await pricingService.updatePriceConfig(
        validatedData.id,
        context.organizationId,
        validatedData.updates
      );

      return NextResponse.json(updatedConfig);
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

export async function DELETE(request: Request) {
  return withApiMiddleware(request, async (context: ApiContext) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Price configuration ID is required' },
        { status: 400 }
      );
    }

    const pricingService = PricingService.getInstance();
    await pricingService.deletePriceConfig(id, context.organizationId);

    return new NextResponse(null, { status: 204 });
  });
} 
