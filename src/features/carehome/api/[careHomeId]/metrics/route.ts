import { NextRequest, NextResponse } from 'next/server';
import { CareHomeAPI } from '../../index';
import { CareHomeService } from '../../../services/CareHomeService';
import { handleValidationError } from '../../validation';
import { ZodError } from 'zod';
import { Region } from '../../../types/compliance';

const api = new CareHomeAPI(new CareHomeService(Region.UK));

export async function GET(
  request: NextRequest,
  { params }: { params: { careHomeId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate') || 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || 
      new Date().toISOString();

    const metrics = await api.getMetrics(
      params.careHomeId,
      startDate,
      endDate
    );
    return NextResponse.json(metrics);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(handleValidationError(error), { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

