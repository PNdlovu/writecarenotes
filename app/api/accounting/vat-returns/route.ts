/**
 * @fileoverview VAT Returns API routes
 * @version 1.0.0
 * @created 2024-03-21
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const vatReturns = await prisma.vatReturn.findMany({
      include: {
        transactions: true,
      }
    });
    return NextResponse.json(vatReturns);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch VAT returns' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const vatReturn = await prisma.vatReturn.create({
      data,
      include: {
        transactions: true,
      }
    });
    return NextResponse.json(vatReturn);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create VAT return' }, { status: 500 });
  }
} 