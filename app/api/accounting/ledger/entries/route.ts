/**
 * @fileoverview Ledger Entries API Route Handler
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Handles creation and retrieval of journal entries in the general ledger
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth';
import { withValidation } from '@/lib/validation';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/audit';
import { ApiError } from '@/lib/errors';

// Validation schemas
const LedgerEntrySchema = z.object({
  accountId: z.string().uuid(),
  debit: z.number().optional(),
  credit: z.number().optional(),
  description: z.string().optional(),
  costCenter: z.string().optional()
});

const CreateJournalEntrySchema = z.object({
  date: z.string().datetime(),
  reference: z.string(),
  description: z.string(),
  entries: z.array(LedgerEntrySchema)
    .min(2, 'At least two entries are required')
    .refine(
      (entries) => {
        const totalDebits = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
        const totalCredits = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
        return Math.abs(totalDebits - totalCredits) < 0.001; // Allow for small floating point differences
      },
      'Total debits must equal total credits'
    ),
  attachments: z.array(z.string()).optional()
});

const QueryParamsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  accountId: z.string().uuid().optional(),
  reference: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
});

/**
 * POST /api/accounting/ledger/entries
 * Create a new journal entry
 */
export async function POST(req: NextRequest) {
  return withAuth(req, async (session) => {
    return withValidation(
      req,
      CreateJournalEntrySchema,
      async (data) => {
        try {
          const result = await prisma.$transaction(async (tx) => {
            // Create the journal entry
            const journalEntry = await tx.journalEntry.create({
              data: {
                date: new Date(data.date),
                reference: data.reference,
                description: data.description,
                organizationId: session.organizationId,
                createdBy: session.userId,
                status: 'POSTED',
                entries: {
                  create: data.entries.map(entry => ({
                    accountId: entry.accountId,
                    debit: entry.debit || 0,
                    credit: entry.credit || 0,
                    description: entry.description,
                    costCenter: entry.costCenter
                  }))
                },
                attachments: data.attachments
                  ? {
                      create: data.attachments.map(url => ({ url }))
                    }
                  : undefined
              },
              include: {
                entries: true,
                attachments: true
              }
            });

            // Log the action
            await auditLog({
              action: 'JOURNAL_ENTRY_CREATED',
              entityId: journalEntry.id,
              entityType: 'JOURNAL_ENTRY',
              userId: session.userId,
              organizationId: session.organizationId,
              metadata: {
                reference: data.reference,
                amount: data.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0)
              }
            });

            return journalEntry;
          });

          return NextResponse.json({
            success: true,
            data: result
          });
        } catch (error) {
          console.error('Failed to create journal entry:', error);
          throw new ApiError('Failed to create journal entry', 500);
        }
      }
    );
  });
}

/**
 * GET /api/accounting/ledger/entries
 * Retrieve journal entries with filtering and pagination
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async (session) => {
    return withValidation(
      req,
      QueryParamsSchema,
      async (params) => {
        try {
          const where = {
            organizationId: session.organizationId,
            ...(params.startDate && {
              date: {
                gte: new Date(params.startDate)
              }
            }),
            ...(params.endDate && {
              date: {
                lte: new Date(params.endDate)
              }
            }),
            ...(params.reference && {
              reference: {
                contains: params.reference,
                mode: 'insensitive' as const
              }
            }),
            ...(params.accountId && {
              entries: {
                some: {
                  accountId: params.accountId
                }
              }
            })
          };

          const [entries, total] = await Promise.all([
            prisma.journalEntry.findMany({
              where,
              include: {
                entries: {
                  include: {
                    account: true
                  }
                },
                attachments: true,
                createdByUser: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              },
              orderBy: {
                date: 'desc'
              },
              skip: (params.page - 1) * params.limit,
              take: params.limit
            }),
            prisma.journalEntry.count({ where })
          ]);

          return NextResponse.json({
            success: true,
            data: entries,
            metadata: {
              page: params.page,
              limit: params.limit,
              total,
              totalPages: Math.ceil(total / params.limit)
            }
          });
        } catch (error) {
          console.error('Failed to retrieve journal entries:', error);
          throw new ApiError('Failed to retrieve journal entries', 500);
        }
      }
    );
  });
} 