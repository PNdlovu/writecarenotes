/**
 * @writecarenotes.com
 * @fileoverview Stock analytics types
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for stock analytics and reporting
 * including usage trends, wastage, costs, and forecasts.
 */

export interface UsageTrend {
  date: string;
  quantity: number;
}

export interface WastageReport {
  medicationId: string;
  medicationName: string;
  quantity: number;
  instances: number;
  reasons: string[];
}

export interface CostAnalysis {
  medicationId: string;
  medicationName: string;
  purchaseCost: number;
  usageCost: number;
  receivedQuantity: number;
  usedQuantity: number;
}

export interface ExpiryForecast {
  medicationId: string;
  medicationName: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  daysToExpiry: number;
  estimatedLoss: number;
}

export interface StockAnalyticsSummary {
  totalWastage: number;
  totalCost: number;
  potentialLoss: number;
  wastagePercentage: number;
}

export interface StockAnalytics {
  summary: StockAnalyticsSummary;
  wastage: WastageReport[];
  costs: CostAnalysis[];
  forecast: ExpiryForecast[];
}

// Automated reordering types
export interface ReorderRule {
  medicationId: string;
  supplierId: string;
  triggerLevel: number;
  orderQuantity: number;
  isEnabled: boolean;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  items: PurchaseOrderItem[];
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  medicationId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

// Barcode/QR types
export interface StockLabel {
  stockId: string;
  medicationId: string;
  batchNumber: string;
  expiryDate: string;
  barcode: string;
  qrCode: string;
}

export interface ScanResult {
  type: 'BARCODE' | 'QR';
  code: string;
  stockId: string;
  medicationId: string;
  scannedAt: string;
}

// Stock transfer types
export interface StockTransfer {
  id: string;
  stockId: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  initiatedBy: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Temperature monitoring types
export interface TemperatureLog {
  id: string;
  locationId: string;
  temperature: number;
  humidity?: number;
  timestamp: string;
  isAlert: boolean;
}

export interface StorageLocation {
  id: string;
  name: string;
  minTemp: number;
  maxTemp: number;
  minHumidity?: number;
  maxHumidity?: number;
  currentTemp?: number;
  currentHumidity?: number;
  lastChecked?: string;
  status: 'NORMAL' | 'WARNING' | 'ALERT';
}

export interface TemperatureAlert {
  id: string;
  locationId: string;
  type: 'HIGH_TEMP' | 'LOW_TEMP' | 'HIGH_HUMIDITY' | 'LOW_HUMIDITY';
  value: number;
  threshold: number;
  timestamp: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
} 