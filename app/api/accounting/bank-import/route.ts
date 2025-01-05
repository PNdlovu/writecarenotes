/**
 * @fileoverview Bank Import API routes
 * @version 1.0.0
 * @created 2024-03-21
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const bankImport = await prisma.bankImport.create({ data });
    return NextResponse.json(bankImport);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process bank import' }, { status: 500 });
  }
} 
