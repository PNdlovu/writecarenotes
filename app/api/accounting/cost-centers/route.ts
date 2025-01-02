/**
 * @fileoverview Cost Centers API routes
 * @version 1.0.0
 * @created 2024-03-21
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const costCenters = await prisma.costCenter.findMany();
    return NextResponse.json(costCenters);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cost centers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const costCenter = await prisma.costCenter.create({ data });
    return NextResponse.json(costCenter);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create cost center' }, { status: 500 });
  }
} 