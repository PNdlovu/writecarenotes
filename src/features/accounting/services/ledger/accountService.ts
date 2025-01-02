/**
 * @fileoverview Account Service for ledger operations
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';
import { Account, AccountType } from '@prisma/client';

export class AccountService {
  async getAccounts(organizationId: string) {
    return prisma.account.findMany({
      where: {
        organizationId,
        deletedAt: null
      },
      include: {
        parent: true,
        children: true
      }
    });
  }

  async getAccountById(id: string, organizationId: string) {
    return prisma.account.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null
      },
      include: {
        parent: true,
        children: true
      }
    });
  }

  async createAccount(data: {
    organizationId: string;
    code: string;
    name: string;
    type: AccountType;
    parentId?: string;
    description?: string;
  }) {
    return prisma.account.create({
      data: {
        ...data,
        isActive: true
      },
      include: {
        parent: true
      }
    });
  }

  async updateAccount(
    id: string,
    organizationId: string,
    data: Partial<Account>
  ) {
    return prisma.account.update({
      where: {
        id,
        organizationId
      },
      data,
      include: {
        parent: true
      }
    });
  }

  async deleteAccount(id: string, organizationId: string) {
    return prisma.account.update({
      where: {
        id,
        organizationId
      },
      data: {
        deletedAt: new Date(),
        isActive: false
      }
    });
  }

  async getAccountBalance(id: string, organizationId: string, asOf?: Date) {
    const entries = await prisma.journalEntryLine.findMany({
      where: {
        accountId: id,
        journalEntry: {
          organizationId,
          date: asOf ? {
            lte: asOf
          } : undefined,
          status: 'POSTED'
        }
      }
    });

    return entries.reduce(
      (balance, entry) => balance + (entry.debit || 0) - (entry.credit || 0),
      0
    );
  }

  async validateAccountCode(code: string, organizationId: string, excludeId?: string) {
    const existing = await prisma.account.findFirst({
      where: {
        code,
        organizationId,
        id: excludeId ? {
          not: excludeId
        } : undefined,
        deletedAt: null
      }
    });

    return !existing;
  }
} 