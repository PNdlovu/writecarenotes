/**
 * @writecarenotes.com
 * @fileoverview Stock types for medication inventory
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Comprehensive type definitions for medication stock management,
 * including stock levels, transactions, alerts, and analytics.
 */

export type StockTransactionType = 'RECEIPT' | 'ADJUSTMENT' | 'ADMINISTRATION';

export type StockAdjustmentReason = 
  | 'DAMAGED'
  | 'EXPIRED'
  | 'LOST'
  | 'DISPOSED'
  | 'RETURNED_TO_SUPPLIER'
  | 'COUNT_ADJUSTMENT'
  | 'OTHER';

export enum AlertPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface MedicationStock {
  id: string;
  medicationId: string;
  organizationId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  reorderLevel: number;
  criticalLevel: number;
  location?: string;
  supplier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastCheckedAt?: string;
  transactions?: StockTransaction[];
}

export interface StockTransaction {
  id: string;
  organizationId: string;
  stockId: string;
  medicationId: string;
  type: StockTransactionType;
  quantity: number;
  batchNumber: string;
  expiryDate?: string;
  reason?: StockAdjustmentReason;
  notes?: string;
  performedById: string;
  performedBy: {
    id: string;
    name: string;
  };
  witnessId?: string;
  witness?: {
    id: string;
    name: string;
  };
  supplierId?: string;
  supplier?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface StockCreateInput {
  medicationId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  reorderLevel: number;
  criticalLevel: number;
  location?: string;
  supplier?: string;
  notes?: string;
}

export interface StockUpdateInput {
  batchNumber?: string;
  expiryDate?: string;
  quantity?: number;
  reorderLevel?: number;
  criticalLevel?: number;
  location?: string;
  supplier?: string;
  notes?: string;
}

export interface StockTransactionCreateInput {
  medicationId: string;
  type: StockTransactionType;
  quantity: number;
  batchNumber: string;
  expiryDate?: string;
  reason?: StockAdjustmentReason;
  notes?: string;
  performedById: string;
  witnessId?: string;
  supplierId?: string;
}

export interface StockLevel {
  id: string;
  medicationId: string;
  organizationId: string;
  quantity: number;
  reorderLevel: number;
  criticalLevel: number;
  batchNumber?: string;
  expiryDate?: string;
  lastUpdated: string;
  status: 'NORMAL' | 'LOW' | 'CRITICAL';
}

export interface StockAlert {
  id: string;
  organizationId: string;
  type: 'CRITICAL_STOCK' | 'REORDER_STOCK' | 'EXPIRING_STOCK' | 'EXPIRED_STOCK';
  priority: AlertPriority;
  details: {
    medicationId: string;
    currentLevel?: number;
    criticalLevel?: number;
    reorderLevel?: number;
    expiryDate?: string;
    batchNumber?: string;
  };
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface StockAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
  totalStock: number;
  totalValue: number;
  stockMovement: {
    receipts: number;
    adjustments: number;
    administrations: number;
  };
  wastage: {
    quantity: number;
    value: number;
    reasons: Record<StockAdjustmentReason, number>;
  };
  expiryRisk: {
    expiringSoon: number;
    expired: number;
    potentialLoss: number;
  };
  stockLevels: {
    normal: number;
    low: number;
    critical: number;
  };
} 