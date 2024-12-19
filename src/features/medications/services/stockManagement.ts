/**
 * @fileoverview Stock Management Service for Medications
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { addToSyncQueue } from '@/lib/sync';

interface StockEntry {
  id: string;
  medicationId: string;
  careHomeId: string;
  quantity: number;
  batchNumber: string;
  expiryDate: string;
  supplier: string;
  receivedBy: string;
  receivedDate: string;
  cost?: number;
}

interface StockAdjustment {
  id: string;
  stockEntryId: string;
  type: 'RECEIVED' | 'ADMINISTERED' | 'DISPOSED' | 'RETURNED' | 'DAMAGED';
  quantity: number;
  reason?: string;
  adjustedBy: string;
  witnessedBy?: string;
  timestamp: string;
}

interface StockAlert {
  id: string;
  medicationId: string;
  type: 'LOW_STOCK' | 'EXPIRING' | 'EXPIRED' | 'REORDER';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  details: string;
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export class StockManagementService {
  async addStockEntry(careHomeId: string, data: Partial<StockEntry>): Promise<StockEntry> {
    try {
      const stockEntry = await db.stockEntry.create({
        data: {
          ...data,
          id: uuidv4(),
          careHomeId,
          receivedDate: new Date().toISOString(),
        },
      });

      // Add stock adjustment record
      await this.recordStockAdjustment({
        stockEntryId: stockEntry.id,
        type: 'RECEIVED',
        quantity: stockEntry.quantity,
        adjustedBy: stockEntry.receivedBy,
        timestamp: stockEntry.receivedDate,
      });

      // Check and update alerts
      await this.updateStockAlerts(careHomeId, data.medicationId!);

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'stockEntry',
        data: stockEntry,
        status: 'PENDING',
        retryCount: 0,
        timestamp: new Date().toISOString(),
      });

      return stockEntry;
    } catch (error) {
      throw new Error('Failed to add stock entry: ' + error.message);
    }
  }

  async recordStockAdjustment(data: Partial<StockAdjustment>): Promise<StockAdjustment> {
    try {
      const adjustment = await db.stockAdjustment.create({
        data: {
          ...data,
          id: uuidv4(),
          timestamp: new Date().toISOString(),
        },
      });

      // Update current stock level
      const stockEntry = await db.stockEntry.findUnique({
        where: { id: data.stockEntryId },
      });

      if (stockEntry) {
        await db.medication.update({
          where: { id: stockEntry.medicationId },
          data: {
            currentStock: {
              increment: data.type === 'RECEIVED' ? data.quantity : -data.quantity,
            },
          },
        });
      }

      return adjustment;
    } catch (error) {
      throw new Error('Failed to record stock adjustment: ' + error.message);
    }
  }

  async updateStockAlerts(careHomeId: string, medicationId: string): Promise<void> {
    try {
      const medication = await db.medication.findUnique({
        where: { id: medicationId },
        include: {
          stockEntries: {
            orderBy: { expiryDate: 'asc' },
          },
        },
      });

      if (!medication) return;

      // Check for low stock
      if (medication.currentStock <= medication.reorderPoint) {
        await this.createStockAlert({
          medicationId,
          type: 'LOW_STOCK',
          details: `Current stock (${medication.currentStock}) is below reorder point (${medication.reorderPoint})`,
        });
      }

      // Check for expiring medications
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      for (const entry of medication.stockEntries) {
        const expiryDate = new Date(entry.expiryDate);
        
        if (expiryDate <= new Date()) {
          await this.createStockAlert({
            medicationId,
            type: 'EXPIRED',
            details: `Batch ${entry.batchNumber} has expired on ${entry.expiryDate}`,
          });
        } else if (expiryDate <= thirtyDaysFromNow) {
          await this.createStockAlert({
            medicationId,
            type: 'EXPIRING',
            details: `Batch ${entry.batchNumber} will expire on ${entry.expiryDate}`,
          });
        }
      }
    } catch (error) {
      throw new Error('Failed to update stock alerts: ' + error.message);
    }
  }

  private async createStockAlert(data: Partial<StockAlert>): Promise<StockAlert> {
    try {
      // Check if similar active alert exists
      const existingAlert = await db.stockAlert.findFirst({
        where: {
          medicationId: data.medicationId,
          type: data.type,
          status: 'ACTIVE',
        },
      });

      if (existingAlert) return existingAlert;

      return await db.stockAlert.create({
        data: {
          ...data,
          id: uuidv4(),
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      throw new Error('Failed to create stock alert: ' + error.message);
    }
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<StockAlert> {
    try {
      return await db.stockAlert.update({
        where: { id: alertId },
        data: {
          status: 'ACKNOWLEDGED',
          acknowledgedBy,
          acknowledgedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      throw new Error('Failed to acknowledge alert: ' + error.message);
    }
  }

  async getStockLevels(careHomeId: string, medicationId?: string): Promise<any> {
    try {
      const where = {
        careHomeId,
        ...(medicationId && { id: medicationId }),
      };

      return await db.medication.findMany({
        where,
        select: {
          id: true,
          name: true,
          currentStock: true,
          reorderPoint: true,
          maxStock: true,
          stockEntries: {
            orderBy: { expiryDate: 'asc' },
            select: {
              quantity: true,
              batchNumber: true,
              expiryDate: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error('Failed to get stock levels: ' + error.message);
    }
  }

  async getActiveAlerts(careHomeId: string): Promise<StockAlert[]> {
    try {
      return await db.stockAlert.findMany({
        where: {
          medication: { careHomeId },
          status: 'ACTIVE',
        },
        orderBy: { createdAt: 'desc' },
        include: {
          medication: {
            select: {
              name: true,
              currentStock: true,
              reorderPoint: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error('Failed to get active alerts: ' + error.message);
    }
  }
} 


