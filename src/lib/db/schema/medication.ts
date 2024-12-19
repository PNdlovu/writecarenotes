import { 
  integer, 
  pgEnum, 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  boolean,
  json,
  varchar 
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { residents } from './resident';

export const medicationRiskLevelEnum = pgEnum('medication_risk_level', ['LOW', 'MEDIUM', 'HIGH']);
export const medicationRouteEnum = pgEnum('medication_route', [
  'ORAL',
  'TOPICAL',
  'INJECTION',
  'INHALED',
  'PEG',
  'SUBLINGUAL',
  'TRANSDERMAL',
  'RECTAL',
  'VAGINAL',
  'NASAL',
  'GASTROSTOMY',
  'JEJUNOSTOMY',
  'OTHER'
]);
export const medicationStatusEnum = pgEnum('medication_status', ['ACTIVE', 'DISCONTINUED', 'ON_HOLD']);
export const administrationStatusEnum = pgEnum('administration_status', ['PENDING', 'COMPLETED', 'MISSED', 'LATE', 'REFUSED']);
export const effectivenessEnum = pgEnum('effectiveness', ['EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'NOT_EFFECTIVE']);
export const incidentSeverityEnum = pgEnum('incident_severity', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const incidentStatusEnum = pgEnum('incident_status', ['REPORTED', 'UNDER_REVIEW', 'RESOLVED']);

export const medications = pgTable('medications', {
  id: serial('id').primaryKey(),
  residentId: integer('resident_id').references(() => residents.id),
  name: text('name').notNull(),
  dosage: text('dosage').notNull(),
  route: medicationRouteEnum('route').notNull(),
  frequency: text('frequency').notNull(),
  times: json('times').$type<string[]>().notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  status: medicationStatusEnum('status').default('ACTIVE'),
  instructions: text('instructions'),
  riskLevel: medicationRiskLevelEnum('risk_level').default('LOW'),
  isControlled: boolean('is_controlled').default(false),
  isPRN: boolean('is_prn').default(false),
  ingredients: json('ingredients').$type<string[]>().default([]),
  contraindications: json('contraindications').$type<{ condition: string }[]>().default([]),
  requiresWitness: boolean('requires_witness').default(false),
  maxDailyDose: integer('max_daily_dose'),
  minTimeBetweenDoses: integer('min_time_between_doses'), // in minutes
  adaptiveEquipment: json('adaptive_equipment').$type<{
    type: string;
    instructions: string;
    maintenanceNotes: string;
  }[]>().default([]),
  communicationNeeds: json('communication_needs').$type<{
    method: string;
    preferences: string;
    supportRequired: string;
  }>(),
  storageLocation: json('storage_location').$type<{
    type: 'FACILITY' | 'CLIENT_HOME' | 'MOBILE_STORAGE';
    details: string;
    accessInstructions: string;
    temperature: string;
  }>(),
  selfAdminCapability: json('self_admin_capability').$type<{
    canSelfAdminister: boolean;
    assessmentDate: Date;
    supportRequired: string;
    reviewDate: Date;
  }>(),
  easyReadInstructions: text('easy_read_instructions'),
  offlineAccess: boolean('offline_access').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const medicationLocations = pgTable('medication_locations', {
  id: serial('id').primaryKey(),
  medicationId: integer('medication_id').references(() => medications.id),
  locationType: varchar('location_type', { length: 50 }).notNull(), // FACILITY, CLIENT_HOME, MOBILE_STORAGE
  address: text('address'),
  storageDetails: text('storage_details'),
  temperatureRequirements: text('temperature_requirements'),
  accessInstructions: text('access_instructions'),
  gpsCoordinates: varchar('gps_coordinates', { length: 100 }),
  lastChecked: timestamp('last_checked'),
  checkedBy: integer('checked_by').references(() => staff.id),
  status: varchar('status', { length: 50 }).default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const medicationAdministrations = pgTable('medication_administrations', {
  id: serial('id').primaryKey(),
  medicationId: integer('medication_id').references(() => medications.id),
  residentId: integer('resident_id').references(() => residents.id),
  scheduledTime: timestamp('scheduled_time').notNull(),
  administeredTime: timestamp('administered_time'),
  status: administrationStatusEnum('status').default('PENDING'),
  notes: text('notes'),
  administeredBy: integer('administered_by').references(() => staff.id),
  witnessedBy: integer('witnessed_by').references(() => staff.id),
  effectiveness: effectivenessEnum('effectiveness'),
  wasOverridden: boolean('was_overridden').default(false),
  overrideReason: text('override_reason'),
  painLevel: integer('pain_level'), // For PRN pain medications
  symptoms: json('symptoms').$type<string[]>(),
  vitalSigns: json('vital_signs').$type<{
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
  }>(),
  locationVerification: json('location_verification').$type<{
    gpsCoordinates: string;
    timestamp: Date;
    verified: boolean;
  }>(),
  alternativeSignature: json('alternative_signature').$type<{
    method: string;
    proxyName: string;
    relationship: string;
    reason: string;
  }>(),
  offlineSync: json('offline_sync').$type<{
    originalTimestamp: Date;
    syncedAt: Date;
    deviceId: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
  modifiedAt: timestamp('modified_at').defaultNow(),
});

export const medicationSignatures = pgTable('medication_signatures', {
  id: serial('id').primaryKey(),
  administrationId: integer('administration_id').references(() => medicationAdministrations.id),
  medicationId: integer('medication_id').references(() => medications.id),
  residentId: integer('resident_id').references(() => residents.id),
  staffId: integer('staff_id').references(() => staff.id),
  signatureType: varchar('signature_type', { length: 50 }).notNull(), // 'ADMINISTRATION', 'WITNESS', 'OVERRIDE'
  timestamp: timestamp('timestamp').defaultNow(),
  notes: text('notes'),
});

export const medicationIncidents = pgTable('medication_incidents', {
  id: serial('id').primaryKey(),
  medicationId: integer('medication_id').references(() => medications.id),
  residentId: integer('resident_id').references(() => residents.id),
  administrationId: integer('administration_id').references(() => medicationAdministrations.id),
  reportedBy: integer('reported_by').references(() => staff.id),
  severity: incidentSeverityEnum('severity').notNull(),
  status: incidentStatusEnum('status').default('REPORTED'),
  description: text('description').notNull(),
  actionTaken: text('action_taken'),
  followUpRequired: boolean('follow_up_required').default(false),
  followUpNotes: text('follow_up_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const medicationInventory = pgTable('medication_inventory', {
  id: serial('id').primaryKey(),
  medicationId: integer('medication_id').references(() => medications.id),
  batchNumber: varchar('batch_number', { length: 50 }),
  expiryDate: timestamp('expiry_date').notNull(),
  quantity: integer('quantity').notNull(),
  remainingQuantity: integer('remaining_quantity').notNull(),
  location: varchar('location', { length: 100 }),
  supplier: varchar('supplier', { length: 100 }),
  receivedBy: integer('received_by').references(() => staff.id),
  receivedAt: timestamp('received_at').defaultNow(),
  lastCountAt: timestamp('last_count_at').defaultNow(),
  lastCountBy: integer('last_count_by').references(() => staff.id),
  notes: text('notes'),
});

export const medicationInventoryAudits = pgTable('medication_inventory_audits', {
  id: serial('id').primaryKey(),
  inventoryId: integer('inventory_id').references(() => medicationInventory.id),
  medicationId: integer('medication_id').references(() => medications.id),
  countedBy: integer('counted_by').references(() => staff.id),
  witnessedBy: integer('witnessed_by').references(() => staff.id),
  expectedQuantity: integer('expected_quantity').notNull(),
  actualQuantity: integer('actual_quantity').notNull(),
  hasDiscrepancy: boolean('has_discrepancy').default(false),
  discrepancyNotes: text('discrepancy_notes'),
  resolved: boolean('resolved').default(false),
  resolvedBy: integer('resolved_by').references(() => staff.id),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Zod schemas for validation
export const insertMedicationSchema = createInsertSchema(medications, {
  times: z.array(z.string()),
  ingredients: z.array(z.string()),
  contraindications: z.array(z.object({ condition: z.string() })),
  adaptiveEquipment: z.array(z.object({
    type: z.string(),
    instructions: z.string(),
    maintenanceNotes: z.string(),
  })),
  communicationNeeds: z.object({
    method: z.string(),
    preferences: z.string(),
    supportRequired: z.string(),
  }),
  storageLocation: z.object({
    type: z.enum(['FACILITY', 'CLIENT_HOME', 'MOBILE_STORAGE']),
    details: z.string(),
    accessInstructions: z.string(),
    temperature: z.string(),
  }),
  selfAdminCapability: z.object({
    canSelfAdminister: z.boolean(),
    assessmentDate: z.date(),
    supportRequired: z.string(),
    reviewDate: z.date(),
  }),
});

export const selectMedicationSchema = createSelectSchema(medications);

export const insertAdministrationSchema = createInsertSchema(medicationAdministrations, {
  symptoms: z.array(z.string()).optional(),
  vitalSigns: z.object({
    bloodPressure: z.string().optional(),
    heartRate: z.number().optional(),
    temperature: z.number().optional(),
    respiratoryRate: z.number().optional(),
  }).optional(),
  locationVerification: z.object({
    gpsCoordinates: z.string(),
    timestamp: z.date(),
    verified: z.boolean(),
  }),
  alternativeSignature: z.object({
    method: z.string(),
    proxyName: z.string(),
    relationship: z.string(),
    reason: z.string(),
  }),
  offlineSync: z.object({
    originalTimestamp: z.date(),
    syncedAt: z.date(),
    deviceId: z.string(),
  }),
});

export const selectAdministrationSchema = createSelectSchema(medicationAdministrations);


