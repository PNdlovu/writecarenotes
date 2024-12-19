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
    const compliance = await api.getCompliance(params.careHomeId);
    return NextResponse.json(compliance);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(handleValidationError(error), { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch compliance data' },
      { status: 500 }
    );
  }
}

