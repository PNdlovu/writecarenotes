/**
 * @fileoverview Care Plan Templates API Route
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';
import { carePlanService } from '../../index';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive') !== 'false';
    const templates = await carePlanService.getCarePlanTemplates(isActive);
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching care plan templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch care plan templates' },
      { status: 500 }
    );
  }
}


