/**
 * @writecarenotes.com
 * @fileoverview Stock transfer service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for managing medication stock transfers
 * between different locations within a care home.
 */

import { db } from '@/lib/db';
import type { StockTransfer } from '../types/stockAnalytics';

export class TransferService {
  /**
   * Get transfers
   */
  async getTransfers(
    organizationId: string,
    status?: StockTransfer['status']
  ): Promise<StockTransfer[]> {
    return db.stockTransfer.findMany({
      where: {
        organizationId,
        status: status ? status : undefined,
      },
      include: {
        stock: {
          include: {
            medication: true,
          },
        },
        initiatedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
        completedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get transfer by ID
   */
  async getTransferById(id: string): Promise<StockTransfer | null> {
    return db.stockTransfer.findUnique({
      where: { id },
      include: {
        stock: {
          include: {
            medication: true,
          },
        },
        initiatedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
        completedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Create transfer
   */
  async createTransfer(
    organizationId: string,
    initiatedById: string,
    data: {
      stockId: string;
      fromLocation: string;
      toLocation: string;
      quantity: number;
    }
  ): Promise<StockTransfer> {
    // Validate stock exists and has sufficient quantity
    const stock = await db.medicationStock.findUnique({
      where: { id: data.stockId },
    });

    if (!stock) {
      throw new Error('Stock not found');
    }

    if (stock.quantity < data.quantity) {
      throw new Error('Insufficient stock quantity');
    }

    if (stock.location !== data.fromLocation) {
      throw new Error('Stock is not in the specified location');
    }

    // Create transfer
    return db.stockTransfer.create({
      data: {
        ...data,
        organizationId,
        initiatedById,
        status: 'PENDING',
      },
      include: {
        stock: {
          include: {
            medication: true,
          },
        },
        initiatedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Update transfer status
   */
  async updateTransferStatus(
    id: string,
    status: StockTransfer['status'],
    completedById?: string
  ): Promise<StockTransfer> {
    const transfer = await this.getTransferById(id);

    if (!transfer) {
      throw new Error('Transfer not found');
    }

    // Validate status transition
    if (transfer.status === 'COMPLETED' || transfer.status === 'CANCELLED') {
      throw new Error('Transfer is already completed or cancelled');
    }

    if (status === 'COMPLETED' && !completedById) {
      throw new Error('Completed by user ID is required');
    }

    // Update transfer and stock location if completed
    if (status === 'COMPLETED') {
      await db.$transaction(async (tx) => {
        // Update stock location
        await tx.medicationStock.update({
          where: { id: transfer.stockId },
          data: { location: transfer.toLocation },
        });

        // Create stock transaction for tracking
        await tx.stockTransaction.create({
          data: {
            type: 'ADJUSTMENT',
            stockId: transfer.stockId,
            quantity: 0, // No quantity change, just location
            batchNumber: transfer.stock.batchNumber,
            reason: `Transferred from ${transfer.fromLocation} to ${transfer.toLocation}`,
            organizationId: transfer.organizationId,
            performedById: completedById!,
          },
        });

        // Update transfer status
        await tx.stockTransfer.update({
          where: { id },
          data: {
            status,
            completedById,
            updatedAt: new Date(),
          },
        });
      });
    } else {
      // Just update status for other transitions
      await db.stockTransfer.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date(),
        },
      });
    }

    return this.getTransferById(id) as Promise<StockTransfer>;
  }

  /**
   * Get transfer history
   */
  async getTransferHistory(
    stockId: string,
    limit?: number
  ): Promise<StockTransfer[]> {
    return db.stockTransfer.findMany({
      where: {
        stockId,
        status: 'COMPLETED',
      },
      include: {
        initiatedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
        completedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get pending transfers for location
   */
  async getPendingTransfersForLocation(
    organizationId: string,
    location: string
  ): Promise<StockTransfer[]> {
    return db.stockTransfer.findMany({
      where: {
        organizationId,
        OR: [
          { fromLocation: location },
          { toLocation: location },
        ],
        status: {
          in: ['PENDING', 'IN_TRANSIT'],
        },
      },
      include: {
        stock: {
          include: {
            medication: true,
          },
        },
        initiatedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
} 