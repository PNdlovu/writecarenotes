/**
 * @writecarenotes.com
 * @fileoverview Stock repository for medication inventory
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Comprehensive repository for managing medication stock data,
 * with support for offline-first operations and sync.
 */

import { db } from '@/lib/db';
import { addToSyncQueue } from '@/lib/sync';
import type {
  MedicationStock,
  StockTransaction,
  StockCreateInput,
  StockUpdateInput,
  StockTransactionCreateInput,
  StockLevel,
  StockAnalytics,
} from '../../types/stock';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export class StockRepository {
  /**
   * Stock Level Operations
   */
  async getStockLevel(
    medicationId: string,
    organizationId: string
  ): Promise<StockLevel> {
    const stock = await db.medicationStock.findFirst({
      where: {
        medicationId,
        organizationId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!stock) {
      return {
        id: '',
        medicationId,
        organizationId,
        quantity: 0,
        reorderLevel: 0,
        criticalLevel: 0,
        lastUpdated: new Date().toISOString(),
        status: 'NORMAL',
      };
    }

    return {
      id: stock.id,
      medicationId: stock.medicationId,
      organizationId: stock.organizationId,
      quantity: stock.quantity,
      reorderLevel: stock.reorderLevel,
      criticalLevel: stock.criticalLevel,
      batchNumber: stock.batchNumber,
      expiryDate: stock.expiryDate,
      lastUpdated: stock.updatedAt,
      status:
        stock.quantity <= stock.criticalLevel
          ? 'CRITICAL'
          : stock.quantity <= stock.reorderLevel
          ? 'LOW'
          : 'NORMAL',
    };
  }

  async getStockByMedicationId(medicationId: string): Promise<MedicationStock[]> {
    return db.medicationStock.findMany({
      where: { medicationId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async getStockById(id: string): Promise<MedicationStock | null> {
    return db.medicationStock.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  /**
   * Stock Creation and Updates
   */
  async createStock(
    organizationId: string,
    data: StockCreateInput
  ): Promise<MedicationStock> {
    const stock = await db.medicationStock.create({
      data: {
        ...data,
        organizationId,
      },
      include: {
        transactions: true,
      },
    });

    await addToSyncQueue({
      type: 'CREATE',
      entity: 'medicationStock',
      data: stock,
    });

    return stock;
  }

  async updateStock(
    id: string,
    data: StockUpdateInput
  ): Promise<MedicationStock> {
    const stock = await db.medicationStock.update({
      where: { id },
      data,
      include: {
        transactions: true,
      },
    });

    await addToSyncQueue({
      type: 'UPDATE',
      entity: 'medicationStock',
      data: stock,
    });

    return stock;
  }

  /**
   * Transaction Management
   */
  async recordTransaction(
    organizationId: string,
    data: StockTransactionCreateInput
  ): Promise<StockTransaction> {
    const transaction = await db.stockTransaction.create({
      data: {
        ...data,
        organizationId,
      },
      include: {
        performedBy: true,
        witness: true,
        supplier: true,
      },
    });

    // Update stock quantity
    const quantityChange = data.type === 'RECEIPT' ? data.quantity : -data.quantity;
    await db.medicationStock.update({
      where: {
        medicationId_organizationId: {
          medicationId: data.medicationId,
          organizationId,
        },
      },
      data: {
        quantity: {
          increment: quantityChange,
        },
        updatedAt: new Date(),
      },
    });

    await addToSyncQueue({
      type: 'CREATE',
      entity: 'stockTransaction',
      data: transaction,
    });

    return transaction;
  }

  async getTransactionHistory(
    medicationId: string,
    organizationId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      type?: 'RECEIPT' | 'ADJUSTMENT';
      limit?: number;
      offset?: number;
    }
  ): Promise<StockTransaction[]> {
    return db.stockTransaction.findMany({
      where: {
        medicationId,
        organizationId,
        ...(options?.type && { type: options.type }),
        ...(options?.startDate && options?.endDate && {
          createdAt: {
            gte: startOfDay(options.startDate),
            lte: endOfDay(options.endDate),
          },
        }),
      },
      orderBy: { createdAt: 'desc' },
      skip: options?.offset || 0,
      take: options?.limit || 50,
      include: {
        performedBy: true,
        witness: true,
        supplier: true,
      },
    });
  }

  /**
   * Analytics and Reporting
   */
  async getExpiringStock(
    organizationId: string,
    daysThreshold: number = 90
  ): Promise<MedicationStock[]> {
    const thresholdDate = format(
      addDays(new Date(), daysThreshold),
      'yyyy-MM-dd'
    );

    return db.medicationStock.findMany({
      where: {
        organizationId,
        expiryDate: {
          lte: thresholdDate,
        },
        quantity: {
          gt: 0,
        },
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });
  }

  async getStockAnalytics(
    organizationId: string,
    period: 'day' | 'week' | 'month' | 'year'
  ): Promise<StockAnalytics> {
    const startDate = this.getStartDateForPeriod(period);
    const endDate = new Date();

    const [
      stockLevels,
      transactions,
      wastage,
      expiryRisk,
    ] = await Promise.all([
      // Current stock levels
      db.medicationStock.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true,
      }),

      // Stock movements
      db.stockTransaction.groupBy({
        by: ['type'],
        where: {
          organizationId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          quantity: true,
        },
      }),

      // Wastage analysis
      db.stockTransaction.groupBy({
        by: ['reason'],
        where: {
          organizationId,
          type: 'ADJUSTMENT',
          quantity: {
            lt: 0,
          },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          quantity: true,
          value: true,
        },
      }),

      // Expiry risk
      db.medicationStock.aggregate({
        where: {
          organizationId,
          expiryDate: {
            lte: format(addDays(new Date(), 90), 'yyyy-MM-dd'),
          },
        },
        _count: true,
        _sum: {
          quantity: true,
          value: true,
        },
      }),
    ]);

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalStock: await this.getTotalStock(organizationId),
      totalValue: await this.getTotalStockValue(organizationId),
      stockMovement: {
        receipts: this.sumTransactionsByType(transactions, 'RECEIPT'),
        adjustments: this.sumTransactionsByType(transactions, 'ADJUSTMENT'),
        administrations: this.sumTransactionsByType(transactions, 'ADMINISTRATION'),
      },
      wastage: {
        quantity: Math.abs(this.sumWastageQuantity(wastage)),
        value: Math.abs(this.sumWastageValue(wastage)),
        reasons: this.groupWastageByReason(wastage),
      },
      expiryRisk: {
        expiringSoon: expiryRisk._count || 0,
        expired: await this.getExpiredCount(organizationId),
        potentialLoss: expiryRisk._sum?.value || 0,
      },
      stockLevels: {
        normal: this.countStockByStatus(stockLevels, 'NORMAL'),
        low: this.countStockByStatus(stockLevels, 'LOW'),
        critical: this.countStockByStatus(stockLevels, 'CRITICAL'),
      },
    };
  }

  /**
   * Helper Methods
   */
  private getStartDateForPeriod(period: 'day' | 'week' | 'month' | 'year'): Date {
    const now = new Date();
    switch (period) {
      case 'day':
        return subDays(now, 1);
      case 'week':
        return subDays(now, 7);
      case 'month':
        return subDays(now, 30);
      case 'year':
        return subDays(now, 365);
    }
  }

  private async getTotalStock(organizationId: string): Promise<number> {
    const result = await db.medicationStock.aggregate({
      where: { organizationId },
      _sum: { quantity: true },
    });
    return result._sum?.quantity || 0;
  }

  private async getTotalStockValue(organizationId: string): Promise<number> {
    const result = await db.medicationStock.aggregate({
      where: { organizationId },
      _sum: { value: true },
    });
    return result._sum?.value || 0;
  }

  private sumTransactionsByType(
    transactions: any[],
    type: string
  ): number {
    const transaction = transactions.find(t => t.type === type);
    return transaction?._sum?.quantity || 0;
  }

  private sumWastageQuantity(wastage: any[]): number {
    return wastage.reduce((sum, w) => sum + (w._sum?.quantity || 0), 0);
  }

  private sumWastageValue(wastage: any[]): number {
    return wastage.reduce((sum, w) => sum + (w._sum?.value || 0), 0);
  }

  private groupWastageByReason(wastage: any[]): Record<string, number> {
    return wastage.reduce((acc, w) => ({
      ...acc,
      [w.reason]: Math.abs(w._sum?.quantity || 0),
    }), {});
  }

  private countStockByStatus(stockLevels: any[], status: string): number {
    const level = stockLevels.find(s => s.status === status);
    return level?._count || 0;
  }

  private async getExpiredCount(organizationId: string): Promise<number> {
    const result = await db.medicationStock.count({
      where: {
        organizationId,
        expiryDate: {
          lt: format(new Date(), 'yyyy-MM-dd'),
        },
      },
    });
    return result;
  }
} 