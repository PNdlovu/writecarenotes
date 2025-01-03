/**
 * @fileoverview Reconciliation API routes
 * @version 1.0.0
 * @created 2024-03-21
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const reconciliations = await prisma.reconciliation.findMany({
      include: {
        account: true,
        items: true,
      }
    });
    return NextResponse.json(reconciliations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reconciliations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const reconciliation = await prisma.reconciliation.create({
      data,
      include: {
        account: true,
        items: true,
      }
    });
    return NextResponse.json(reconciliation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create reconciliation' }, { status: 500 });
  }
} 
