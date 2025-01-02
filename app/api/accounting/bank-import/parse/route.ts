/**
 * @fileoverview Bank Statement Parser API Route
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * API route handler for parsing bank statements in various formats
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { parse as csvParse } from 'csv-parse';
import { parse as ofxParse } from 'ofx-js';
import { parse as qifParse } from 'qif';
import { z } from 'zod';
import { TransactionType } from '.prisma/client';

// Import format validation schema
const ImportFormatSchema = z.enum(['CSV', 'OFX', 'QIF']);
type ImportFormat = z.infer<typeof ImportFormatSchema>;

// Bank transaction validation schema
const BankTransactionSchema = z.object({
  date: z.date(),
  description: z.string(),
  reference: z.string().optional(),
  amount: z.number(),
  type: z.nativeEnum(TransactionType),
});

type BankTransaction = z.infer<typeof BankTransactionSchema>;

// Request validation schema
const RequestSchema = z.object({
  format: ImportFormatSchema,
  content: z.string(),
  columnMapping: z.record(z.string()).optional(),
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
    const { format, content, columnMapping } = RequestSchema.parse(body);

    let transactions: BankTransaction[] = [];

    switch (format) {
      case 'CSV':
        if (!columnMapping) {
          return NextResponse.json(
            { error: 'Column mapping is required for CSV imports' },
            { status: 400 }
          );
        }
        transactions = parseCSV(content, columnMapping);
        break;
      case 'OFX':
        transactions = parseOFX(content);
        break;
      case 'QIF':
        transactions = parseQIF(content);
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported file format' },
          { status: 400 }
        );
    }

    // Validate all transactions
    transactions.forEach((transaction) => {
      BankTransactionSchema.parse(transaction);
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error parsing bank statement:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to parse bank statement' },
      { status: 500 }
    );
  }
}

function parseCSV(content: string, columnMapping: Record<string, string>): BankTransaction[] {
  const records = csvParse(content, {
    columns: true,
    skip_empty_lines: true,
  });

  return records.map((record: any) => ({
    date: new Date(record[columnMapping.date]),
    description: record[columnMapping.description],
    reference: record[columnMapping.reference],
    amount: parseFloat(record[columnMapping.amount]),
    type: parseFloat(record[columnMapping.amount]) >= 0 ? TransactionType.CREDIT : TransactionType.DEBIT,
  }));
}

function parseOFX(content: string): BankTransaction[] {
  const parsed = ofxParse(content);
  return parsed.transactions.map((transaction: any) => ({
    date: new Date(transaction.date),
    description: transaction.description,
    reference: transaction.reference,
    amount: Math.abs(transaction.amount),
    type: transaction.amount >= 0 ? TransactionType.CREDIT : TransactionType.DEBIT,
  }));
}

function parseQIF(content: string): BankTransaction[] {
  const parsed = qifParse(content);
  return parsed.transactions.map((transaction: any) => ({
    date: new Date(transaction.date),
    description: transaction.payee,
    reference: transaction.number,
    amount: Math.abs(transaction.amount),
    type: transaction.amount >= 0 ? TransactionType.CREDIT : TransactionType.DEBIT,
  }));
} 