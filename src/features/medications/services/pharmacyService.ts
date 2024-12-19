/**
 * @fileoverview Pharmacy Integration Service
 * @version 1.0.0
 * @created 2024-03-22
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { z } from 'zod';
import { db } from '@/lib/db';
import type { Medication, MedicationOrder } from '../types';

// Supported pharmacy system types
export type PharmacySystem = 'EMIS' | 'TPP' | 'VISION' | 'CEGEDIM';

// Barcode formats
export type BarcodeFormat = 'GS1-128' | 'GS1-DataMatrix' | 'EAN-13' | 'QR';

interface PharmacyConfig {
  system: PharmacySystem;
  apiKey: string;
  baseUrl: string;
  organizationId: string;
}

const barcodeSchema = z.object({
  format: z.enum(['GS1-128', 'GS1-DataMatrix', 'EAN-13', 'QR']),
  content: z.string(),
  expiryDate: z.string().datetime().optional(),
  batchNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  productCode: z.string(),
  quantity: z.number(),
});

export type BarcodeData = z.infer<typeof barcodeSchema>;

class PharmacyService {
  private config: PharmacyConfig;

  constructor(config: PharmacyConfig) {
    this.config = config;
  }

  /**
   * Parse medication barcode
   */
  async parseMedicationBarcode(barcodeData: string): Promise<BarcodeData> {
    try {
      // Detect barcode format
      const format = this.detectBarcodeFormat(barcodeData);
      
      // Parse based on format
      let parsed: any;
      switch (format) {
        case 'GS1-128':
          parsed = this.parseGS1Barcode(barcodeData);
          break;
        case 'GS1-DataMatrix':
          parsed = this.parseDataMatrixBarcode(barcodeData);
          break;
        case 'EAN-13':
          parsed = this.parseEANBarcode(barcodeData);
          break;
        case 'QR':
          parsed = this.parseQRBarcode(barcodeData);
          break;
        default:
          throw new Error('Unsupported barcode format');
      }

      // Validate parsed data
      return barcodeSchema.parse(parsed);
    } catch (error) {
      console.error('Barcode parsing error:', error);
      throw new Error('Invalid barcode format or data');
    }
  }

  /**
   * Verify medication against pharmacy system
   */
  async verifyMedication(barcode: BarcodeData): Promise<{
    verified: boolean;
    medication?: Medication;
    warnings?: string[];
  }> {
    try {
      // Query pharmacy system
      const response = await fetch(`${this.config.baseUrl}/verify-medication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Organization-ID': this.config.organizationId,
        },
        body: JSON.stringify({
          barcode,
          system: this.config.system,
        }),
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const result = await response.json();

      // Check for warnings (e.g., expiry date, recalls)
      const warnings: string[] = [];
      if (barcode.expiryDate && new Date(barcode.expiryDate) <= new Date()) {
        warnings.push('Medication is expired');
      }
      if (result.recalls?.length > 0) {
        warnings.push('Medication has active recalls');
      }

      return {
        verified: result.verified,
        medication: result.medication,
        warnings,
      };
    } catch (error) {
      console.error('Medication verification error:', error);
      throw new Error('Failed to verify medication');
    }
  }

  /**
   * Place order with pharmacy
   */
  async placeOrder(order: MedicationOrder): Promise<{
    orderId: string;
    estimatedDelivery: Date;
    status: string;
  }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/place-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Organization-ID': this.config.organizationId,
        },
        body: JSON.stringify({
          order,
          system: this.config.system,
        }),
      });

      if (!response.ok) {
        throw new Error('Order placement failed');
      }

      return response.json();
    } catch (error) {
      console.error('Order placement error:', error);
      throw new Error('Failed to place order');
    }
  }

  /**
   * Generate barcode for medication
   */
  async generateBarcode(
    medication: Medication,
    format: BarcodeFormat = 'GS1-128'
  ): Promise<string> {
    try {
      const barcodeData = {
        format,
        productCode: medication.id,
        name: medication.name,
        dosage: medication.dosage,
        quantity: medication.currentStock,
        expiryDate: medication.stockEntries?.[0]?.expiryDate,
        batchNumber: medication.stockEntries?.[0]?.batchNumber,
      };

      const response = await fetch(`${this.config.baseUrl}/generate-barcode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Organization-ID': this.config.organizationId,
        },
        body: JSON.stringify(barcodeData),
      });

      if (!response.ok) {
        throw new Error('Barcode generation failed');
      }

      return response.json();
    } catch (error) {
      console.error('Barcode generation error:', error);
      throw new Error('Failed to generate barcode');
    }
  }

  private detectBarcodeFormat(data: string): BarcodeFormat {
    if (data.startsWith(']d2')) return 'GS1-DataMatrix';
    if (data.startsWith(']C1')) return 'GS1-128';
    if (data.length === 13 && /^\d+$/.test(data)) return 'EAN-13';
    if (data.startsWith('QR')) return 'QR';
    throw new Error('Unknown barcode format');
  }

  private parseGS1Barcode(data: string): Partial<BarcodeData> {
    // GS1-128 parsing logic
    const parsed: Partial<BarcodeData> = {
      format: 'GS1-128',
      content: data,
    };

    // Extract Application Identifiers
    const aiMap: Record<string, string> = {
      '01': 'productCode',
      '10': 'batchNumber',
      '17': 'expiryDate',
      '21': 'serialNumber',
      '30': 'quantity',
    };

    let position = 3; // Skip format identifier
    while (position < data.length) {
      const ai = data.substr(position, 2);
      position += 2;
      
      if (ai in aiMap) {
        const field = aiMap[ai];
        let value = '';
        
        // Extract value based on AI format
        switch (ai) {
          case '17': // Date (YYMMDD)
            value = data.substr(position, 6);
            position += 6;
            const year = parseInt(value.substr(0, 2)) + 2000;
            const month = parseInt(value.substr(2, 2)) - 1;
            const day = parseInt(value.substr(4, 2));
            parsed.expiryDate = new Date(year, month, day).toISOString();
            break;
          
          case '30': // Quantity
            value = data.substr(position, 8).replace(/^0+/, '');
            position += 8;
            parsed.quantity = parseInt(value);
            break;
          
          default: // Variable length fields
            while (position < data.length && data[position] !== '\x1d') {
              value += data[position];
              position++;
            }
            parsed[field as keyof BarcodeData] = value;
            position++; // Skip separator
        }
      }
    }

    return parsed;
  }

  private parseDataMatrixBarcode(data: string): Partial<BarcodeData> {
    // Implementation similar to GS1-128 but with DataMatrix specifics
    return this.parseGS1Barcode(data.slice(3)); // Skip format identifier
  }

  private parseEANBarcode(data: string): Partial<BarcodeData> {
    return {
      format: 'EAN-13',
      content: data,
      productCode: data.slice(0, -1), // Remove check digit
      quantity: 1,
    };
  }

  private parseQRBarcode(data: string): Partial<BarcodeData> {
    // Assume JSON format for QR codes
    const parsed = JSON.parse(data.slice(2)); // Skip 'QR' prefix
    return {
      format: 'QR',
      content: data,
      ...parsed,
    };
  }
}

export const pharmacyService = new PharmacyService({
  system: process.env.PHARMACY_SYSTEM as PharmacySystem,
  apiKey: process.env.PHARMACY_API_KEY!,
  baseUrl: process.env.PHARMACY_API_URL!,
  organizationId: process.env.PHARMACY_ORG_ID!,
}); 


