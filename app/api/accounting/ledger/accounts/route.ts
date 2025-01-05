/**
 * @fileoverview Chart of Accounts API Route Handler
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Handles CRUD operations for the chart of accounts
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth';
import { withValidation } from '@/lib/validation';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/audit';
import { ApiError } from '@/lib/errors';

// Validation schemas
const AccountTypeEnum = z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']);

const CreateAccountSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  type: AccountTypeEnum,
  category: z.string(),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional()
});

const UpdateAccountSchema = CreateAccountSchema.partial().extend({
  isActive: z.boolean().optional()
});

const QueryParamsSchema = z.object({
  category: z.string().optional(),
  type: AccountTypeEnum.optional(),
  active: z.boolean().optional(),
  search: z.string().optional(),
  includeBalance: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50)
});

/**
 * POST /api/accounting/ledger/accounts
 * Create a new account
 */
export async function POST(req: NextRequest) {
  return withAuth(req, async (session) => {
    return withValidation(
      req,
      CreateAccountSchema,
      async (data) => {
        try {
          // Check if account code already exists
          const existing = await prisma.account.findFirst({
            where: {
              organizationId: session.organizationId,
              code: data.code
            }
          });

          if (existing) {
            throw new ApiError('Account code already exists', 400);
          }

          const account = await prisma.account.create({
            data: {
              ...data,
              organizationId: session.organizationId,
              isActive: true,
              createdBy: session.userId
            }
          });

          await auditLog({
            action: 'ACCOUNT_CREATED',
            entityId: account.id,
            entityType: 'ACCOUNT',
            userId: session.userId,
            organizationId: session.organizationId,
            metadata: {
              code: account.code,
              name: account.name,
              type: account.type
            }
          });

          return NextResponse.json({
            success: true,
            data: account
          });
        } catch (error) {
          console.error('Failed to create account:', error);
          if (error instanceof ApiError) throw error;
          throw new ApiError('Failed to create account', 500);
        }
      }
    );
  });
}

/**
 * GET /api/accounting/ledger/accounts
 * Retrieve accounts with filtering and pagination
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
            ...(params.category && { category: params.category }),
            ...(params.type && { type: params.type }),
            ...(params.active !== undefined && { isActive: params.active }),
            ...(params.search && {
              OR: [
                { code: { contains: params.search, mode: 'insensitive' as const } },
                { name: { contains: params.search, mode: 'insensitive' as const } }
              ]
            })
          };

          const [accounts, total] = await Promise.all([
            prisma.account.findMany({
              where,
              include: {
                parent: {
                  select: {
                    id: true,
                    code: true,
                    name: true
                  }
                },
                ...(params.includeBalance && {
                  entries: {
                    select: {
                      debit: true,
                      credit: true
                    }
                  }
                })
              },
              orderBy: [
                { code: 'asc' }
              ],
              skip: (params.page - 1) * params.limit,
              take: params.limit
            }),
            prisma.account.count({ where })
          ]);

          // Calculate balances if requested
          const accountsWithBalance = params.includeBalance
            ? accounts.map(account => ({
                ...account,
                balance: account.entries.reduce(
                  (sum, entry) => sum + (entry.debit - entry.credit),
                  0
                ),
                entries: undefined
              }))
            : accounts;

          return NextResponse.json({
            success: true,
            data: accountsWithBalance,
            metadata: {
              page: params.page,
              limit: params.limit,
              total,
              totalPages: Math.ceil(total / params.limit)
            }
          });
        } catch (error) {
          console.error('Failed to retrieve accounts:', error);
          throw new ApiError('Failed to retrieve accounts', 500);
        }
      }
    );
  });
}

/**
 * PATCH /api/accounting/ledger/accounts/[accountId]
 * Update an existing account
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { accountId: string } }
) {
  return withAuth(req, async (session) => {
    return withValidation(
      req,
      UpdateAccountSchema,
      async (data) => {
        try {
          const account = await prisma.account.findUnique({
            where: {
              id: params.accountId,
              organizationId: session.organizationId
            }
          });

          if (!account) {
            throw new ApiError('Account not found', 404);
          }

          // Check if updating code and if it conflicts
          if (data.code && data.code !== account.code) {
            const existing = await prisma.account.findFirst({
              where: {
                organizationId: session.organizationId,
                code: data.code,
                id: { not: params.accountId }
              }
            });

            if (existing) {
              throw new ApiError('Account code already exists', 400);
            }
          }

          const updated = await prisma.account.update({
            where: {
              id: params.accountId
            },
            data: {
              ...data,
              updatedBy: session.userId,
              updatedAt: new Date()
            }
          });

          await auditLog({
            action: 'ACCOUNT_UPDATED',
            entityId: updated.id,
            entityType: 'ACCOUNT',
            userId: session.userId,
            organizationId: session.organizationId,
            metadata: {
              changes: data
            }
          });

          return NextResponse.json({
            success: true,
            data: updated
          });
        } catch (error) {
          console.error('Failed to update account:', error);
          if (error instanceof ApiError) throw error;
          throw new ApiError('Failed to update account', 500);
        }
      }
    );
  });
}

/**
 * DELETE /api/accounting/ledger/accounts/[accountId]
 * Soft delete an account (mark as inactive)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { accountId: string } }
) {
  return withAuth(req, async (session) => {
    try {
      // Check if account exists and belongs to organization
      const account = await prisma.account.findUnique({
        where: {
          id: params.accountId,
          organizationId: session.organizationId
        },
        include: {
          entries: {
            take: 1
          }
        }
      });

      if (!account) {
        throw new ApiError('Account not found', 404);
      }

      // Check if account has any entries
      if (account.entries.length > 0) {
        throw new ApiError('Cannot delete account with existing entries', 400);
      }

      // Soft delete by marking as inactive
      const updated = await prisma.account.update({
        where: {
          id: params.accountId
        },
        data: {
          isActive: false,
          updatedBy: session.userId,
          updatedAt: new Date()
        }
      });

      await auditLog({
        action: 'ACCOUNT_DELETED',
        entityId: updated.id,
        entityType: 'ACCOUNT',
        userId: session.userId,
        organizationId: session.organizationId,
        metadata: {
          code: account.code,
          name: account.name
        }
      });

      return NextResponse.json({
        success: true,
        data: updated
      });
    } catch (error) {
      console.error('Failed to delete account:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to delete account', 500);
    }
  });
} 
