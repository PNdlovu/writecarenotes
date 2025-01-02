/**
 * @writecarenotes.com
 * @fileoverview Stock label service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for managing medication stock labels
 * including barcode and QR code generation and scanning.
 */

import { db } from '@/lib/db';
import { generateBarcode, generateQRCode } from '@/lib/barcodes';
import type { StockLabel, ScanResult } from '../types/stockAnalytics';

export class LabelService {
  /**
   * Generate stock label
   */
  async generateLabel(stockId: string): Promise<StockLabel> {
    // Get stock details
    const stock = await db.medicationStock.findUnique({
      where: { id: stockId },
      include: {
        medication: true,
      },
    });

    if (!stock) {
      throw new Error('Stock not found');
    }

    // Generate unique code for the stock
    const code = `MED-${stock.medicationId}-${stock.batchNumber}`;

    // Generate barcode and QR code
    const barcode = await generateBarcode(code);
    const qrCode = await generateQRCode(code);

    // Create label
    const label: StockLabel = {
      stockId,
      medicationId: stock.medicationId,
      batchNumber: stock.batchNumber,
      expiryDate: stock.expiryDate.toISOString(),
      barcode,
      qrCode,
    };

    return label;
  }

  /**
   * Process scan result
   */
  async processScan(
    code: string,
    type: 'BARCODE' | 'QR'
  ): Promise<ScanResult> {
    // Parse the code
    const [prefix, medicationId, batchNumber] = code.split('-');

    if (prefix !== 'MED') {
      throw new Error('Invalid code format');
    }

    // Find the stock
    const stock = await db.medicationStock.findFirst({
      where: {
        medicationId,
        batchNumber,
      },
    });

    if (!stock) {
      throw new Error('Stock not found');
    }

    // Create scan result
    const result: ScanResult = {
      type,
      code,
      stockId: stock.id,
      medicationId,
      scannedAt: new Date().toISOString(),
    };

    // Log the scan
    await db.stockScan.create({
      data: {
        type,
        code,
        stockId: stock.id,
      },
    });

    return result;
  }

  /**
   * Get scan history
   */
  async getScanHistory(
    stockId: string,
    limit?: number
  ): Promise<ScanResult[]> {
    const scans = await db.stockScan.findMany({
      where: {
        stockId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return scans.map(scan => ({
      type: scan.type as 'BARCODE' | 'QR',
      code: scan.code,
      stockId: scan.stockId,
      medicationId: scan.stock.medicationId,
      scannedAt: scan.createdAt.toISOString(),
    }));
  }

  /**
   * Print label
   */
  async printLabel(stockId: string): Promise<void> {
    const label = await this.generateLabel(stockId);

    // TODO: Implement printer integration
    console.log('Printing label:', label);
  }

  /**
   * Validate scan
   */
  async validateScan(
    code: string,
    expectedStockId: string
  ): Promise<boolean> {
    try {
      const result = await this.processScan(code, 'BARCODE');
      return result.stockId === expectedStockId;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get stock from scan
   */
  async getStockFromScan(code: string): Promise<{
    id: string;
    medicationId: string;
    batchNumber: string;
    quantity: number;
    expiryDate: string;
  }> {
    const [prefix, medicationId, batchNumber] = code.split('-');

    if (prefix !== 'MED') {
      throw new Error('Invalid code format');
    }

    const stock = await db.medicationStock.findFirst({
      where: {
        medicationId,
        batchNumber,
      },
    });

    if (!stock) {
      throw new Error('Stock not found');
    }

    return {
      id: stock.id,
      medicationId: stock.medicationId,
      batchNumber: stock.batchNumber,
      quantity: stock.quantity,
      expiryDate: stock.expiryDate.toISOString(),
    };
  }
} 