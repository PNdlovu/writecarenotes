import { sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { medications } from "./medication";
import { users } from "./user";

export const pharmacyOrders = pgTable("pharmacy_orders", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id")
    .references(() => medications.id)
    .notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  status: text("status", {
    enum: ["PENDING", "APPROVED", "SHIPPED", "RECEIVED", "CANCELLED"],
  }).notNull(),
  orderDate: timestamp("order_date").defaultNow().notNull(),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  receivedDate: timestamp("received_date"),
  lotNumber: text("lot_number"),
  pharmacyReference: text("pharmacy_reference"),
  notes: text("notes"),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const medicationInventory = pgTable("medication_inventory", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id")
    .references(() => medications.id)
    .notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  lotNumber: text("lot_number").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  location: text("location"),
  status: text("status", {
    enum: ["AVAILABLE", "LOW", "EXPIRED", "DISPOSED"],
  })
    .default("AVAILABLE")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  inventoryId: integer("inventory_id")
    .references(() => medicationInventory.id)
    .notNull(),
  type: text("type", {
    enum: ["RECEIVED", "ADMINISTERED", "DISPOSED", "ADJUSTED"],
  }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  remainingQuantity: decimal("remaining_quantity", {
    precision: 10,
    scale: 2,
  }).notNull(),
  performedBy: integer("performed_by")
    .references(() => users.id)
    .notNull(),
  witnessId: integer("witness_id").references(() => users.id),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Add inventory fields to medications table
export const medicationInventoryFields = {
  autoReorder: boolean("auto_reorder").default(false).notNull(),
  reorderThreshold: decimal("reorder_threshold", { precision: 10, scale: 2 }),
  reorderQuantity: decimal("reorder_quantity", { precision: 10, scale: 2 }),
  defaultLocation: text("default_location"),
};


