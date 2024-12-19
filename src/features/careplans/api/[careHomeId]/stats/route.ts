/**
 * @fileoverview Care Plan Statistics API Route
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';
import { carePlanService } from '../../../index';

export async function GET(
  request: Request,
  { params }: { params: { careHomeId: string } }
) {
  try {
    const stats = await carePlanService.getCarePlanStats(params.careHomeId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching care plan stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch care plan statistics' },
      { status: 500 }
    );
  }
}

