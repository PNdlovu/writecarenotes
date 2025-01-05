/**
 * @writecarenotes.com
 * @fileoverview Barcode and QR code service for medication stock
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Comprehensive service for generating and scanning barcodes and QR codes
 * for medication stock management, including label generation and
 * scanning capabilities.
 */

import { db } from '@/lib/db';
import { addToSyncQueue } from '@/lib/sync';
import { BrowserQRCodeReader, BrowserBarcodeReader } from '@zxing/library';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';
import type {
  MedicationStock,
  StockLabel,
  ScanResult,
  LabelType,
  BarcodeFormat,
} from '../types/stock';

export class BarcodeService {
  private qrReader: BrowserQRCodeReader;
  private barcodeReader: BrowserBarcodeReader;

  constructor() {
    this.qrReader = new BrowserQRCodeReader();
    this.barcodeReader = new BrowserBarcodeReader();
  }

  /**
   * Label Generation
   */
  async generateLabels(
    stock: MedicationStock,
    options?: {
      type?: LabelType;
      format?: BarcodeFormat;
      quantity?: number;
    }
  ): Promise<StockLabel[]> {
    const labels: StockLabel[] = [];
    const quantity = options?.quantity || 1;
    const type = options?.type || 'STANDARD';
    const format = options?.format || 'CODE128';

    for (let i = 0; i < quantity; i++) {
      const label = await this.createLabel(stock, type, format);
      labels.push(label);

      await addToSyncQueue({
        type: 'CREATE',
        entity: 'stockLabel',
        data: label,
      });
    }

    return labels;
  }

  async createLabel(
    stock: MedicationStock,
    type: LabelType,
    format: BarcodeFormat
  ): Promise<StockLabel> {
    const labelData = this.generateLabelData(stock, type);
    const [barcode, qrCode] = await Promise.all([
      this.generateBarcode(labelData, format),
      this.generateQRCode(labelData),
    ]);

    const label = await db.stockLabel.create({
      data: {
        stockId: stock.id,
        type,
        format,
        barcode,
        qrCode,
        labelData,
        organizationId: stock.organizationId,
      },
    });

    return label;
  }

  /**
   * Barcode Generation
   */
  private async generateBarcode(
    data: string,
    format: BarcodeFormat
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      bwipjs.toBuffer({
        bcid: this.getBwipFormat(format),
        text: data,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: 'center',
      }, (err, png) => {
        if (err) reject(err);
        else resolve(`data:image/png;base64,${png.toString('base64')}`);
      });
    });
  }

  private async generateQRCode(data: string): Promise<string> {
    return QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 200,
    });
  }

  /**
   * Scanning
   */
  async scanBarcode(imageData: string): Promise<ScanResult> {
    try {
      const result = await this.barcodeReader.decodeFromImage(imageData);
      if (!result) throw new Error('No barcode found');

      const data = this.parseLabelData(result.getText());
      const stock = await this.findStockByLabel(data);

      return {
        success: true,
        format: result.getBarcodeFormat().toString(),
        data,
        stock,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scan barcode',
      };
    }
  }

  async scanQRCode(imageData: string): Promise<ScanResult> {
    try {
      const result = await this.qrReader.decodeFromImage(imageData);
      if (!result) throw new Error('No QR code found');

      const data = this.parseLabelData(result.getText());
      const stock = await this.findStockByLabel(data);

      return {
        success: true,
        format: 'QR_CODE',
        data,
        stock,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scan QR code',
      };
    }
  }

  /**
   * Label Management
   */
  async getLabels(
    organizationId: string,
    options?: {
      stockId?: string;
      type?: LabelType;
      format?: BarcodeFormat;
      limit?: number;
      offset?: number;
    }
  ): Promise<StockLabel[]> {
    return db.stockLabel.findMany({
      where: {
        organizationId,
        ...(options?.stockId && { stockId: options.stockId }),
        ...(options?.type && { type: options.type }),
        ...(options?.format && { format: options.format }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: options?.offset || 0,
      take: options?.limit || 50,
      include: {
        stock: true,
      },
    });
  }

  /**
   * Helper Methods
   */
  private generateLabelData(stock: MedicationStock, type: LabelType): string {
    const data = {
      id: stock.id,
      medicationId: stock.medicationId,
      batchNumber: stock.batchNumber,
      expiryDate: stock.expiryDate,
      type,
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(data);
  }

  private parseLabelData(data: string): any {
    try {
      return JSON.parse(data);
    } catch {
      throw new Error('Invalid label data format');
    }
  }

  private async findStockByLabel(data: any): Promise<MedicationStock | null> {
    if (!data.id || !data.medicationId) {
      throw new Error('Invalid label data');
    }

    return db.medicationStock.findFirst({
      where: {
        id: data.id,
        medicationId: data.medicationId,
      },
      include: {
        medication: true,
      },
    });
  }

  private getBwipFormat(format: BarcodeFormat): string {
    switch (format) {
      case 'CODE128':
        return 'code128';
      case 'CODE39':
        return 'code39';
      case 'EAN13':
        return 'ean13';
      case 'EAN8':
        return 'ean8';
      case 'UPC':
        return 'upca';
      default:
        return 'code128';
    }
  }
} 