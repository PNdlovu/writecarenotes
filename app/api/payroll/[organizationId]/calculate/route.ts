import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PayrollCalculationService } from '@/services/payroll/calculationService';
import { PayrollCalculationSchema } from '@/features/payroll/types';
import { z } from 'zod';

const calculationService = new PayrollCalculationService();

export async function POST(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const calculation = PayrollCalculationSchema.parse(body);
    const result = calculationService.calculateNetPay(calculation);
    
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 