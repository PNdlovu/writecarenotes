/**
 * @fileoverview Individual Care Plan API Routes
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';
import { carePlanService } from '../../../../index';

export async function GET(
  request: Request,
  { params }: { params: { carePlanId: string } }
) {
  try {
    const carePlan = await carePlanService.getCarePlan(params.carePlanId);
    if (!carePlan) {
      return NextResponse.json(
        { error: 'Care plan not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(carePlan);
  } catch (error) {
    console.error('Error fetching care plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch care plan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { carePlanId: string } }
) {
  try {
    const data = await request.json();
    const carePlan = await carePlanService.updateCarePlan(params.carePlanId, data);
    return NextResponse.json(carePlan);
  } catch (error) {
    console.error('Error updating care plan:', error);
    return NextResponse.json(
      { error: 'Failed to update care plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { carePlanId: string } }
) {
  try {
    await carePlanService.deleteCarePlan(params.carePlanId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting care plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete care plan' },
      { status: 500 }
    );
  }
}

