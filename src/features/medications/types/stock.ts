/**
 * @writecarenotes.com
 * @fileoverview Stock Management Types
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for medication stock management, including stock levels,
 * transactions, batches, and related entities.
 */

export type StockStatus =
  | 'NORMAL'
  | 'LOW'
  | 'OUT_OF_STOCK'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'RECALLED';

export type TransactionType = 'IN' | 'OUT';

export type ReorderStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'ORDERED'
  | 'RECEIVED'
  | 'CANCELLED'
  | 'ERROR';

export type AuditStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ERROR';

export interface StockLevel {
  medicationId: string;
  currentQuantity: number;
  reorderLevel: number;
  expiryDate: Date;
  status: StockStatus;
  lastChecked?: Date;
  lastUpdated?: Date;
}

export interface StockTransaction {
  id: string;
  medicationId: string;
  type: TransactionType;
  quantity: number;
  staffId: string;
  batchNumber?: string;
  timestamp: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchRecord {
  id: string;
  medicationId: string;
  batchNumber: string;
  expiryDate: Date;
  initialQuantity: number;
  currentQuantity: number;
  supplier: string;
  receivedDate: Date;
  status: StockStatus;
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReorderRequest {
  id: string;
  stockId: string;
  quantity: number;
  status: ReorderStatus;
  requestedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  orderedAt?: Date;
  receivedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockAudit {
  id: string;
  careHomeId: string;
  staffId: string;
  status: AuditStatus;
  startTime: Date;
  endTime?: Date;
  discrepancies?: StockDiscrepancy[];
  requirements: {
    controlledDrugs: any;
    documentation: any;
    guidelines: any;
    standards: any;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockDiscrepancy {
  id: string;
  auditId: string;
  medicationId: string;
  expectedQuantity: number;
  actualQuantity: number;
  type: 'OVERAGE' | 'SHORTAGE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'REPORTED' | 'UNDER_REVIEW' | 'RESOLVED';
  resolution?: string;
  reportedBy: string;
  reportedAt: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface StockAlert {
  id: string;
  medicationId: string;
  type: 'LOW_STOCK' | 'EXPIRING' | 'EXPIRED' | 'RECALLED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface SupplierOrder {
  id: string;
  reorderRequestId: string;
  supplierId: string;
  orderNumber: string;
  status: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  items: OrderItem[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  medicationId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'REJECTED';
  notes?: string;
} 