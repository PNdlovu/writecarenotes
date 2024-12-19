/**
 * @fileoverview Controlled Drugs Management Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { addToSyncQueue } from '@/lib/sync';

interface ControlledDrugEntry {
  id: string;
  medicationId: string;
  careHomeId: string;
  type: 'RECEIPT' | 'ADMINISTRATION' | 'DISPOSAL' | 'RETURN' | 'CHECK';
  quantity: number;
  balance: number;
  batchNumber?: string;
  performedBy: string;
  witnessedBy: string;
  timestamp: string;
  notes?: string;
}

interface BalanceCheck {
  id: string;
  medicationId: string;
  careHomeId: string;
  expectedBalance: number;
  actualBalance: number;
  discrepancy: number;
  checkedBy: string;
  witnessedBy: string;
  timestamp: string;
  notes?: string;
  actionTaken?: string;
  reportedTo?: string;
}

interface RegisterPage {
  id: string;
  medicationId: string;
  careHomeId: string;
  pageNumber: number;
  startDate: string;
  endDate?: string;
  entries: ControlledDrugEntry[];
  balanceChecks: BalanceCheck[];
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

export class ControlledDrugsService {
  async recordEntry(
    careHomeId: string,
    data: Partial<ControlledDrugEntry>
  ): Promise<ControlledDrugEntry> {
    try {
      // Validate witness requirement
      if (!data.witnessedBy) {
        throw new Error('Witness is required for controlled drug operations');
      }

      // Get current balance
      const currentBalance = await this.getCurrentBalance(careHomeId, data.medicationId!);
      
      // Calculate new balance
      const balanceChange = data.type === 'RECEIPT' ? data.quantity! : -data.quantity!;
      const newBalance = currentBalance + balanceChange;

      // Create entry
      const entry = await db.controlledDrugEntry.create({
        data: {
          ...data,
          id: uuidv4(),
          careHomeId,
          balance: newBalance,
          timestamp: new Date().toISOString(),
        },
      });

      // Update register page
      await this.updateRegisterPage(careHomeId, data.medicationId!, entry);

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'controlledDrugEntry',
        data: entry,
        status: 'PENDING',
        retryCount: 0,
        timestamp: new Date().toISOString(),
      });

      return entry;
    } catch (error) {
      throw new Error('Failed to record controlled drug entry: ' + error.message);
    }
  }

  async performBalanceCheck(
    careHomeId: string,
    data: Partial<BalanceCheck>
  ): Promise<BalanceCheck> {
    try {
      // Validate witness requirement
      if (!data.witnessedBy) {
        throw new Error('Witness is required for balance checks');
      }

      // Get current balance
      const expectedBalance = await this.getCurrentBalance(careHomeId, data.medicationId!);

      // Calculate discrepancy
      const discrepancy = data.actualBalance! - expectedBalance;

      // Create balance check record
      const check = await db.balanceCheck.create({
        data: {
          ...data,
          id: uuidv4(),
          careHomeId,
          expectedBalance,
          discrepancy,
          timestamp: new Date().toISOString(),
        },
      });

      // Update register page
      await this.updateRegisterPage(careHomeId, data.medicationId!, null, check);

      // If discrepancy found, create alert
      if (discrepancy !== 0) {
        await this.createDiscrepancyAlert(careHomeId, data.medicationId!, check);
      }

      return check;
    } catch (error) {
      throw new Error('Failed to perform balance check: ' + error.message);
    }
  }

  private async getCurrentBalance(
    careHomeId: string,
    medicationId: string
  ): Promise<number> {
    const lastEntry = await db.controlledDrugEntry.findFirst({
      where: {
        careHomeId,
        medicationId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return lastEntry?.balance || 0;
  }

  private async updateRegisterPage(
    careHomeId: string,
    medicationId: string,
    entry?: ControlledDrugEntry | null,
    check?: BalanceCheck | null
  ): Promise<void> {
    try {
      // Get or create active register page
      let page = await db.registerPage.findFirst({
        where: {
          careHomeId,
          medicationId,
          status: 'ACTIVE',
        },
      });

      if (!page) {
        page = await db.registerPage.create({
          data: {
            id: uuidv4(),
            careHomeId,
            medicationId,
            pageNumber: await this.getNextPageNumber(careHomeId, medicationId),
            startDate: new Date().toISOString(),
            status: 'ACTIVE',
            entries: [],
            balanceChecks: [],
          },
        });
      }

      // Update page with new entry or check
      const updates: any = {};
      if (entry) {
        updates.entries = [...page.entries, entry];
      }
      if (check) {
        updates.balanceChecks = [...page.balanceChecks, check];
      }

      await db.registerPage.update({
        where: { id: page.id },
        data: updates,
      });

      // Check if page is full (e.g., 31 days or 50 entries)
      const isPageFull = this.isRegisterPageFull(page);
      if (isPageFull) {
        await this.completeRegisterPage(page.id);
      }
    } catch (error) {
      throw new Error('Failed to update register page: ' + error.message);
    }
  }

  private async getNextPageNumber(
    careHomeId: string,
    medicationId: string
  ): Promise<number> {
    const lastPage = await db.registerPage.findFirst({
      where: {
        careHomeId,
        medicationId,
      },
      orderBy: {
        pageNumber: 'desc',
      },
    });

    return (lastPage?.pageNumber || 0) + 1;
  }

  private isRegisterPageFull(page: RegisterPage): boolean {
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);
    
    return (
      page.entries.length >= 50 ||
      new Date(page.startDate) <= thirtyOneDaysAgo
    );
  }

  private async completeRegisterPage(pageId: string): Promise<void> {
    await db.registerPage.update({
      where: { id: pageId },
      data: {
        status: 'COMPLETED',
        endDate: new Date().toISOString(),
      },
    });
  }

  private async createDiscrepancyAlert(
    careHomeId: string,
    medicationId: string,
    check: BalanceCheck
  ): Promise<void> {
    await db.alert.create({
      data: {
        id: uuidv4(),
        careHomeId,
        type: 'CD_DISCREPANCY',
        severity: 'HIGH',
        status: 'ACTIVE',
        title: 'Controlled Drug Discrepancy',
        description: `Discrepancy of ${check.discrepancy} units found during balance check`,
        metadata: {
          medicationId,
          checkId: check.id,
          expectedBalance: check.expectedBalance,
          actualBalance: check.actualBalance,
          discrepancy: check.discrepancy,
          checkedBy: check.checkedBy,
          witnessedBy: check.witnessedBy,
        },
        createdAt: new Date().toISOString(),
      },
    });
  }

  async getRegisterPages(
    careHomeId: string,
    filters: {
      medicationId?: string;
      status?: RegisterPage['status'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<RegisterPage[]> {
    try {
      const where: any = { careHomeId };

      if (filters.medicationId) where.medicationId = filters.medicationId;
      if (filters.status) where.status = filters.status;
      if (filters.startDate || filters.endDate) {
        where.startDate = {};
        if (filters.startDate) where.startDate.gte = filters.startDate;
        if (filters.endDate) where.startDate.lte = filters.endDate;
      }

      return await db.registerPage.findMany({
        where,
        orderBy: [
          { medicationId: 'asc' },
          { pageNumber: 'desc' },
        ],
        include: {
          medication: {
            select: {
              name: true,
              form: true,
              strength: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error('Failed to get register pages: ' + error.message);
    }
  }

  async getDiscrepancyReport(
    careHomeId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    try {
      const checks = await db.balanceCheck.findMany({
        where: {
          careHomeId,
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
          discrepancy: {
            not: 0,
          },
        },
        include: {
          medication: {
            select: {
              name: true,
              form: true,
              strength: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      // Calculate summary statistics
      const summary = {
        totalChecks: checks.length,
        totalDiscrepancies: checks.reduce((sum, check) => sum + Math.abs(check.discrepancy), 0),
        medicationsAffected: new Set(checks.map(check => check.medicationId)).size,
        byType: {
          overages: checks.filter(check => check.discrepancy > 0).length,
          shortages: checks.filter(check => check.discrepancy < 0).length,
        },
      };

      return {
        checks,
        summary,
      };
    } catch (error) {
      throw new Error('Failed to generate discrepancy report: ' + error.message);
    }
  }
} 


