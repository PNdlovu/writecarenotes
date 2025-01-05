/**
 * @writecarenotes.com
 * @fileoverview Stock Management Service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Comprehensive stock management service for handling medication inventory,
 * including automated reordering, expiry tracking, and batch management.
 */

import { prisma } from '@/lib/prisma';
import { createMetricsCollector } from '../monitoring/metrics';
import { BNFConfig } from '../../config/bnf.config';
import { NICEConfig } from '../../config/nice.config';
import type {
  StockLevel,
  StockTransaction,
  BatchRecord,
  ReorderRequest,
  StockAudit,
  StockAlert,
  SupplierOrder
} from '../../types/stock';

export class StockManagementService {
  private metricsCollector;
  private bnfConfig: BNFConfig;
  private niceConfig: NICEConfig;

  constructor() {
    this.metricsCollector = createMetricsCollector('stock-management');
    this.bnfConfig = new BNFConfig();
    this.niceConfig = new NICEConfig();
  }

  async checkStockLevels(careHomeId: string): Promise<StockLevel[]> {
    try {
      const stock = await prisma.medicationStock.findMany({
        where: { careHomeId }
      });

      const stockLevels = await Promise.all(
        stock.map(async (item) => {
          // Check reorder level
          if (item.currentQuantity <= item.reorderLevel) {
            await this.initiateReorder(item.id);
          }

          // Check expiry
          if (this.isNearingExpiry(item.expiryDate)) {
            await this.createExpiryAlert(item.id);
          }

          return {
            medicationId: item.medicationId,
            currentQuantity: item.currentQuantity,
            reorderLevel: item.reorderLevel,
            expiryDate: item.expiryDate,
            status: this.determineStockStatus(item)
          };
        })
      );

      return stockLevels;
    } catch (error) {
      this.metricsCollector.incrementError('stock-check-failure');
      throw new Error('Failed to check stock levels');
    }
  }

  async recordStockTransaction(
    medicationId: string,
    type: 'IN' | 'OUT',
    quantity: number,
    staffId: string,
    batchNumber?: string
  ): Promise<StockTransaction> {
    try {
      // Record transaction
      const transaction = await prisma.stockTransaction.create({
        data: {
          medicationId,
          type,
          quantity,
          staffId,
          batchNumber,
          timestamp: new Date()
        }
      });

      // Update stock levels
      await this.updateStockLevel(medicationId, type, quantity);

      // Record batch information if provided
      if (batchNumber) {
        await this.updateBatchRecord(medicationId, batchNumber, type, quantity);
      }

      return transaction;
    } catch (error) {
      this.metricsCollector.incrementError('stock-transaction-failure');
      throw new Error('Failed to record stock transaction');
    }
  }

  async manageBatch(
    medicationId: string,
    batchNumber: string,
    expiryDate: Date,
    quantity: number,
    supplier: string
  ): Promise<BatchRecord> {
    try {
      const batch = await prisma.batchRecord.create({
        data: {
          medicationId,
          batchNumber,
          expiryDate,
          initialQuantity: quantity,
          currentQuantity: quantity,
          supplier,
          receivedDate: new Date()
        }
      });

      // Check if this is a new batch with earlier expiry
      await this.updateExpiryTracking(medicationId);

      return batch;
    } catch (error) {
      this.metricsCollector.incrementError('batch-management-failure');
      throw new Error('Failed to manage batch');
    }
  }

  async initiateReorder(stockId: string): Promise<ReorderRequest> {
    try {
      const stock = await prisma.medicationStock.findUnique({
        where: { id: stockId }
      });

      if (!stock) {
        throw new Error('Stock not found');
      }

      // Create reorder request
      const reorderRequest = await prisma.reorderRequest.create({
        data: {
          stockId,
          quantity: this.calculateReorderQuantity(stock),
          status: 'PENDING',
          requestedAt: new Date()
        }
      });

      // Create supplier order
      await this.createSupplierOrder(reorderRequest.id);

      return reorderRequest;
    } catch (error) {
      this.metricsCollector.incrementError('reorder-initiation-failure');
      throw new Error('Failed to initiate reorder');
    }
  }

  async performStockAudit(
    careHomeId: string,
    staffId: string,
    region: string
  ): Promise<StockAudit> {
    try {
      // Get regional requirements
      const requirements = this.getRegionalRequirements(region);

      // Create audit record
      const audit = await prisma.stockAudit.create({
        data: {
          careHomeId,
          staffId,
          status: 'IN_PROGRESS',
          startTime: new Date(),
          requirements
        }
      });

      // Get all stock items
      const stockItems = await prisma.medicationStock.findMany({
        where: { careHomeId }
      });

      // Perform audit checks
      await Promise.all(
        stockItems.map(async (item) => {
          await this.auditStockItem(audit.id, item);
        })
      );

      // Complete audit
      const completedAudit = await prisma.stockAudit.update({
        where: { id: audit.id },
        data: {
          status: 'COMPLETED',
          endTime: new Date()
        }
      });

      return completedAudit;
    } catch (error) {
      this.metricsCollector.incrementError('stock-audit-failure');
      throw new Error('Failed to perform stock audit');
    }
  }

  private async updateStockLevel(
    medicationId: string,
    type: 'IN' | 'OUT',
    quantity: number
  ): Promise<void> {
    const stock = await prisma.medicationStock.findUnique({
      where: { medicationId }
    });

    if (!stock) {
      throw new Error('Stock not found');
    }

    const newQuantity = type === 'IN'
      ? stock.currentQuantity + quantity
      : stock.currentQuantity - quantity;

    await prisma.medicationStock.update({
      where: { medicationId },
      data: { currentQuantity: newQuantity }
    });
  }

  private async updateBatchRecord(
    medicationId: string,
    batchNumber: string,
    type: 'IN' | 'OUT',
    quantity: number
  ): Promise<void> {
    const batch = await prisma.batchRecord.findFirst({
      where: {
        medicationId,
        batchNumber
      }
    });

    if (!batch) {
      throw new Error('Batch not found');
    }

    const newQuantity = type === 'IN'
      ? batch.currentQuantity + quantity
      : batch.currentQuantity - quantity;

    await prisma.batchRecord.update({
      where: { id: batch.id },
      data: { currentQuantity: newQuantity }
    });
  }

  private async updateExpiryTracking(medicationId: string): Promise<void> {
    const batches = await prisma.batchRecord.findMany({
      where: { medicationId },
      orderBy: { expiryDate: 'asc' }
    });

    if (batches.length > 0) {
      await prisma.medicationStock.update({
        where: { medicationId },
        data: { expiryDate: batches[0].expiryDate }
      });
    }
  }

  private async createSupplierOrder(reorderRequestId: string): Promise<SupplierOrder> {
    // Implementation
    return {} as SupplierOrder;
  }

  private async auditStockItem(auditId: string, stockItem: any): Promise<void> {
    // Implementation
  }

  private async createExpiryAlert(stockId: string): Promise<StockAlert> {
    // Implementation
    return {} as StockAlert;
  }

  private calculateReorderQuantity(stock: any): number {
    const averageUsage = this.calculateAverageUsage(stock);
    const leadTime = 5; // days
    const safetyStock = Math.ceil(averageUsage * 7); // 1 week safety stock
    return Math.ceil(averageUsage * leadTime) + safetyStock;
  }

  private calculateAverageUsage(stock: any): number {
    // Implementation
    return 0;
  }

  private determineStockStatus(stock: any): string {
    if (stock.currentQuantity <= 0) return 'OUT_OF_STOCK';
    if (stock.currentQuantity <= stock.reorderLevel) return 'LOW';
    if (this.isNearingExpiry(stock.expiryDate)) return 'EXPIRING_SOON';
    return 'NORMAL';
  }

  private isNearingExpiry(expiryDate: Date): boolean {
    const warningPeriod = 90 * 24 * 60 * 60 * 1000; // 90 days
    return Date.now() + warningPeriod >= expiryDate.getTime();
  }

  private getRegionalRequirements(region: string): any {
    const bnfRegionalSettings = this.bnfConfig.REGIONAL_SETTINGS[region];
    const niceRegionalGuidelines = this.niceConfig.REGIONAL_GUIDELINES[region];

    return {
      controlledDrugs: bnfRegionalSettings.CONTROLLED_DRUGS_REQUIREMENTS,
      documentation: this.bnfConfig.REGIONAL_DOCUMENTATION[region],
      guidelines: niceRegionalGuidelines.GUIDELINES,
      standards: this.niceConfig.REGIONAL_CARE_STANDARDS[region]
    };
  }
} 