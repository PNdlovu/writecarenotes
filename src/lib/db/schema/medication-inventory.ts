// src/lib/db/schema/medication-inventory.ts
import { 
  integer, 
  pgEnum, 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  boolean,
  json,
  varchar,
  decimal
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { medications } from './medication';
import { careHomes } from './care-home';
import { suppliers } from './supplier';

export const storageConditionEnum = pgEnum('storage_condition', [
  'ROOM_TEMPERATURE',
  'REFRIGERATED',
  'CONTROLLED',
  'HAZARDOUS'
]);

export const stockActionEnum = pgEnum('stock_action', [
  'RECEIVED',
  'DISPENSED',
  'DISPOSED',
  'TRANSFERRED',
  'RETURNED',
  'ADJUSTED'
]);

export const medicationInventory = pgTable('medication_inventory', {
  id: serial('id').primaryKey(),
  careHomeId: integer('care_home_id').references(() => careHomes.id),
  medicationId: integer('medication_id').references(() => medications.id),
  batchNumber: varchar('batch_number', { length: 100 }).notNull(),
  serialNumber: varchar('serial_number', { length: 100 }),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  
  // Stock details
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  costPerUnit: decimal('cost_per_unit', { precision: 10, scale: 2 }),
  reorderLevel: decimal('reorder_level', { precision: 10, scale: 2 }),
  maximumLevel: decimal('maximum_level', { precision: 10, scale: 2 }),
  
  // Dates
  manufactureDate: timestamp('manufacture_date'),
  expiryDate: timestamp('expiry_date').notNull(),
  receivedDate: timestamp('received_date').notNull(),
  
  // Storage
  storageCondition: storageConditionEnum('storage_condition').notNull(),
  storageLocation: json('storage_location').$type<{
    building: string;
    floor: string;
    room: string;
    cabinet: string;
    shelf?: string;
    position?: string;
    temperature?: {
      min: number;
      max: number;
      unit: 'C' | 'F';
    };
  }>(),
  
  // Quality control
  qualityControl: json('quality_control').$type<{
    inspectedBy: string;
    inspectionDate: Date;
    condition: 'GOOD' | 'DAMAGED' | 'SUSPECT';
    notes?: string;
    images?: string[];
  }>(),
  
  // Controlled substance specific
  controlledDrug: json('controlled_drug').$type<{
    schedule: string;
    registerNumber: string;
    witnessRequired: boolean;
    specialStorage: boolean;
  }>(),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const stockMovements = pgTable('stock_movements', {
  id: serial('id').primaryKey(),
  inventoryId: integer('inventory_id').references(() => medicationInventory.id),
  action: stockActionEnum('action').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  
  // Transaction details
  transactionDetails: json('transaction_details').$type<{
    reference: string;
    authorizedBy: string;
    performedBy: string;
    witnessedBy?: string;
    notes?: string;
    linkedDocuments?: string[];
  }>(),
  
  // Disposal specific
  disposal: json('disposal').$type<{
    method: string;
    reason: string;
    witnessedBy: string;
    disposalCertificate?: string;
  }>(),
  
  // Transfer specific
  transfer: json('transfer').$type<{
    fromLocation: string;
    toLocation: string;
    transportMethod: string;
    temperature?: {
      min: number;
      max: number;
      unit: 'C' | 'F';
    };
  }>(),
  
  audit: json('audit').$type<{
    createdBy: number;
    createdAt: Date;
    modifiedBy?: number;
    modifiedAt?: Date;
    modificationReason?: string;
  }>(),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Zod schemas for validation
export const insertInventorySchema = createInsertSchema(medicationInventory);
export const selectInventorySchema = createSelectSchema(medicationInventory);

export const insertStockMovementSchema = createInsertSchema(stockMovements);
export const selectStockMovementSchema = createSelectSchema(stockMovements);
