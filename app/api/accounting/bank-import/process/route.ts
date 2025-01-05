/**
 * @fileoverview Bank Import Processing API Route
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * API route handler for processing imported bank transactions with automated matching
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { TransactionType } from '@prisma/client';
import { logAuditEvent } from '@/lib/audit';

// Bank transaction validation schema
const BankTransactionSchema = z.object({
  date: z.date(),
  description: z.string(),
  reference: z.string().optional(),
  amount: z.number(),
  type: z.nativeEnum(TransactionType),
});

// Request validation schema
const RequestSchema = z.object({
  transactions: z.array(BankTransactionSchema),
  accountId: z.string(),
  organizationId: z.string(),
});

export async function POST(request: Request) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const { transactions, accountId, organizationId } = RequestSchema.parse(body);

    // Verify account belongs to organization
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        organizationId,
        isActive: true,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or inactive' },
        { status: 404 }
      );
    }

    // Process transactions in batches
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const batchResults = await prisma.$transaction(
        batch.map((transaction) =>
          prisma.bankTransaction.create({
            data: {
              ...transaction,
              organizationId,
            },
          })
        )
      );
      results.push(...batchResults);
    }

    // Log audit event
    await logAuditEvent({
      entityType: 'BANK_TRANSACTION',
      entityId: results[0].id,
      action: 'CREATE',
      details: {
        count: results.length,
        accountId,
      },
      organizationId,
      userId: session.user.id,
    });

    return NextResponse.json({
      message: `Successfully processed ${results.length} transactions`,
      transactions: results,
    });
  } catch (error) {
    console.error('Error processing bank transactions:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to process bank transactions' },
      { status: 500 }
    );
  }
}
``` 
