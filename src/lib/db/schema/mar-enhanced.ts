// src/lib/db/schema/mar-enhanced.ts
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
import { residents } from './resident';
import { staff } from './staff';

export const marStatusEnum = pgEnum('mar_status', [
  'SCHEDULED',
  'ADMINISTERED',
  'REFUSED',
  'WITHHELD',
  'MISSED',
  'CANCELLED',
  'RESCHEDULED'
]);

export const administrationRouteEnum = pgEnum('administration_route', [
  'ORAL',
  'TOPICAL',
  'SUBCUTANEOUS',
  'INTRAMUSCULAR',
  'INTRAVENOUS',
  'INHALED',
  'SUBLINGUAL',
  'RECTAL',
  'TRANSDERMAL',
  'NASAL',
  'OPHTHALMIC',
  'OTIC'
]);

export const medicationAdministrationRecord = pgTable('medication_administration_record', {
  id: serial('id').primaryKey(),
  residentId: integer('resident_id').references(() => residents.id),
  medicationId: integer('medication_id').references(() => medications.id),
  scheduledTime: timestamp('scheduled_time').notNull(),
  actualTime: timestamp('actual_time'),
  status: marStatusEnum('status').default('SCHEDULED'),
  administeredBy: integer('administered_by').references(() => staff.id),
  witnessedBy: integer('witnessed_by').references(() => staff.id),
  route: administrationRouteEnum('route').notNull(),
  dose: decimal('dose', { precision: 10, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  
  // Enhanced tracking fields
  locationVerification: json('location_verification').$type<{
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    careHomeArea: string;
    verificationMethod: 'GPS' | 'BARCODE' | 'RFID' | 'MANUAL';
  }>(),
  
  residentCondition: json('resident_condition').$type<{
    beforeAdministration: {
      consciousness: string;
      pain: number;
      vitalSigns?: {
        bloodPressure?: string;
        temperature?: number;
        pulseRate?: number;
        respiratoryRate?: number;
      };
    };
    afterAdministration?: {
      consciousness: string;
      pain: number;
      adverseEffects?: string[];
      notes?: string;
    };
  }>(),
  
  refusalDetails: json('refusal_details').$type<{
    reason: string;
    actionTaken: string[];
    escalatedTo?: string;
    followUpRequired: boolean;
  }>(),
  
  withholding: json('withholding').$type<{
    reason: string;
    authorizedBy: string;
    clinicalJustification: string;
    duration: string;
    reviewDate: Date;
  }>(),
  
  preparation: json('preparation').$type<{
    batchNumber: string;
    expiryDate: Date;
    stockLevel: number;
    preparationNotes?: string[];
  }>(),
  
  deviceUsed: json('device_used').$type<{
    type: string;
    identifier: string;
    calibrationDue?: Date;
  }>(),
  
  digitalSignature: json('digital_signature').$type<{
    administrator: {
      staffId: number;
      timestamp: Date;
      ipAddress: string;
      deviceId: string;
    };
    witness?: {
      staffId: number;
      timestamp: Date;
      ipAddress: string;
      deviceId: string;
    };
  }>(),
  
  audit: json('audit').$type<{
    createdBy: number;
    createdAt: Date;
    modifiedBy?: number;
    modifiedAt?: Date;
    modificationReason?: string;
    systemVersion: string;
  }>(),
  
  offline: json('offline').$type<{
    createdOffline: boolean;
    syncedAt?: Date;
    originalDeviceId?: string;
    conflictResolution?: {
      resolved: boolean;
      resolvedBy?: number;
      resolution?: string;
    };
  }>(),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Zod schemas for validation
export const insertMarSchema = createInsertSchema(medicationAdministrationRecord);
export const selectMarSchema = createSelectSchema(medicationAdministrationRecord);
