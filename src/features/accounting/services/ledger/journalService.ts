/**
 * @fileoverview Journal Service for ledger operations
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';
import { JournalEntry, JournalEntryLine, JournalEntryStatus } from '@prisma/client';

export class JournalService {
  async createJournalEntry(data: {
    organizationId: string;
    date: Date;
    reference: string;
    description: string;
    lines: Array<{
      accountId: string;
      debit?: number;
      credit?: number;
      description?: string;
      costCenterId?: string;
    }>;
  }) {
    // Validate double-entry
    const totalDebits = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredits = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.001) {
      throw new Error('Total debits must equal total credits');
    }

    return prisma.journalEntry.create({
      data: {
        organizationId: data.organizationId,
        date: data.date,
        reference: data.reference,
        description: data.description,
        status: JournalEntryStatus.DRAFT,
        lines: {
          create: data.lines
        }
      },
      include: {
        lines: {
          include: {
            account: true,
            costCenter: true
          }
        }
      }
    });
  }

  async getJournalEntries(
    organizationId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      status?: JournalEntryStatus;
      accountId?: string;
    }
  ) {
    return prisma.journalEntry.findMany({
      where: {
        organizationId,
        deletedAt: null,
        ...(filters?.startDate && {
          date: {
            gte: filters.startDate
          }
        }),
        ...(filters?.endDate && {
          date: {
            lte: filters.endDate
          }
        }),
        ...(filters?.status && {
          status: filters.status
        }),
        ...(filters?.accountId && {
          lines: {
            some: {
              accountId: filters.accountId
            }
          }
        })
      },
      include: {
        lines: {
          include: {
            account: true,
            costCenter: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
  }

  async updateJournalEntry(
    id: string,
    organizationId: string,
    data: Partial<JournalEntry> & {
      lines?: Array<Partial<JournalEntryLine>>;
    }
  ) {
    const { lines, ...entryData } = data;

    return prisma.journalEntry.update({
      where: {
        id,
        organizationId
      },
      data: {
        ...entryData,
        ...(lines && {
          lines: {
            deleteMany: {},
            create: lines
          }
        })
      },
      include: {
        lines: {
          include: {
            account: true,
            costCenter: true
          }
        }
      }
    });
  }

  async deleteJournalEntry(id: string, organizationId: string) {
    return prisma.journalEntry.update({
      where: {
        id,
        organizationId
      },
      data: {
        deletedAt: new Date()
      }
    });
  }

  async postJournalEntry(id: string, organizationId: string) {
    return prisma.journalEntry.update({
      where: {
        id,
        organizationId,
        status: JournalEntryStatus.DRAFT
      },
      data: {
        status: JournalEntryStatus.POSTED,
        postedAt: new Date()
      }
    });
  }
} 