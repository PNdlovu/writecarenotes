/**
 * @fileoverview Care Plans API Routes
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';
import { carePlanService } from '../../../index';
import type { CarePlan, CarePlanFilters } from '../../../types/careplan.types';

export async function GET(
  request: Request,
  { params }: { params: { careHomeId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: CarePlanFilters = {
      status: searchParams.get('status') as any,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
      language: searchParams.get('language') || undefined,
      region: searchParams.get('region') || undefined,
      searchTerm: searchParams.get('searchTerm') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      type: searchParams.get('type') as any,
    };

    const carePlans = await carePlanService.getCarePlansByCareHome(params.careHomeId, filters);
    return NextResponse.json(carePlans);
  } catch (error) {
    console.error('Error fetching care plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch care plans' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { careHomeId: string } }
) {
  try {
    const data = await request.json();
    const carePlan = await carePlanService.createCarePlan({
      ...data,
      careHomeId: params.careHomeId,
    });
    return NextResponse.json(carePlan, { status: 201 });
  } catch (error) {
    console.error('Error creating care plan:', error);
    return NextResponse.json(
      { error: 'Failed to create care plan' },
      { status: 500 }
    );
  }
}

