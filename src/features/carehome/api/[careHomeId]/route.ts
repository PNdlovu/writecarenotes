import { NextRequest, NextResponse } from 'next/server';
import { CareHomeAPI } from '../index';
import { CareHomeService } from '../../services/CareHomeService';
import { handleValidationError } from '../validation';
import { ZodError } from 'zod';
import { Region } from '../../types/compliance';

const api = new CareHomeAPI(new CareHomeService(Region.UK));

export async function GET(
  request: NextRequest,
  { params }: { params: { careHomeId: string } }
) {
  try {
    const careHome = await api.getCareHome(params.careHomeId);
    return NextResponse.json(careHome);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(handleValidationError(error), { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch care home' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { careHomeId: string } }
) {
  try {
    const data = await request.json();
    const updatedCareHome = await api.updateCareHome(params.careHomeId, data);
    return NextResponse.json(updatedCareHome);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(handleValidationError(error), { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update care home' },
      { status: 500 }
    );
  }
}

