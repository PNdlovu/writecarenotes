/**
 * @fileoverview Care Home Specific Care Plans API Route
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { carePlanService } from '@/features/careplans';

export async function GET(
  request: Request,
  { params }: { params: { organizationId: string; careHomeId: string } }
) {
  try {
    const { user } = await validateRequest(request);
    const { searchParams } = new URL(request.url);
    const residentId = searchParams.get('residentId');
    const status = searchParams.get('status');
    
    const carePlans = await carePlanService.getCarePlans({
      organizationId: params.organizationId,
      careHomeId: params.careHomeId,
      residentId,
      status,
    });
    
    return NextResponse.json(carePlans);
  } catch (error) {
    console.error('Error fetching care plans:', error);
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch care plans' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { organizationId: string; careHomeId: string } }
) {
  try {
    const { user, body } = await validateRequest(request);
    const newCarePlan = await carePlanService.createCarePlan({
      ...body,
      organizationId: params.organizationId,
      careHomeId: params.careHomeId,
    });
    return NextResponse.json(newCarePlan, { status: 201 });
  } catch (error) {
    console.error('Error creating care plan:', error);
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to create care plan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { organizationId: string; careHomeId: string } }
) {
  try {
    const { user, body } = await validateRequest(request);
    if (body.careHomeId !== params.careHomeId) {
      return NextResponse.json(
        { error: 'Care home ID mismatch' },
        { status: 400 }
      );
    }
    const updatedCarePlan = await carePlanService.updateCarePlan({
      ...body,
      organizationId: params.organizationId,
      careHomeId: params.careHomeId,
    });
    return NextResponse.json(updatedCarePlan);
  } catch (error) {
    console.error('Error updating care plan:', error);
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to update care plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { organizationId: string; careHomeId: string } }
) {
  try {
    const { user } = await validateRequest(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Care plan ID is required' },
        { status: 400 }
      );
    }
    await carePlanService.deleteCarePlan(id, {
      organizationId: params.organizationId,
      careHomeId: params.careHomeId,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting care plan:', error);
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to delete care plan' },
      { status: 500 }
    );
  }
} 