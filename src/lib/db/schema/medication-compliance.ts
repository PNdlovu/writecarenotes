// src/lib/db/schema/medication-compliance.ts
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
import { medications } from './medication';
import { careHomes } from './care-home';

export const regulatoryBodyEnum = pgEnum('regulatory_body', [
  'CQC',      // Care Quality Commission (England)
  'CIW',      // Care Inspectorate Wales
  'CI',       // Care Inspectorate (Scotland)
  'RQIA',     // Regulation and Quality Improvement Authority (Northern Ireland)
  'HIQA'      // Health Information and Quality Authority (Ireland)
]);

export const complianceStatusEnum = pgEnum('compliance_status', [
  'COMPLIANT',
  'PARTIAL',
  'NON_COMPLIANT',
  'UNDER_REVIEW'
]);

export const medicationCompliance = pgTable('medication_compliance', {
  id: serial('id').primaryKey(),
  careHomeId: integer('care_home_id').references(() => careHomes.id),
  regulatoryBody: regulatoryBodyEnum('regulatory_body').notNull(),
  lastInspectionDate: timestamp('last_inspection_date'),
  nextInspectionDate: timestamp('next_inspection_date'),
  complianceStatus: complianceStatusEnum('compliance_status').default('UNDER_REVIEW'),
  requirements: json('requirements').$type<{
    controlledDrugs: {
      storage: string[];
      documentation: string[];
      disposal: string[];
    };
    medicationAdministration: {
      training: string[];
      documentation: string[];
      procedures: string[];
    };
    medicationStorage: {
      temperature: string[];
      security: string[];
      segregation: string[];
    };
    staffCompetency: {
      training: string[];
      assessment: string[];
      review: string[];
    };
  }>(),
  findings: json('findings').$type<{
    date: Date;
    inspector: string;
    areas: {
      category: string;
      status: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
      notes: string;
      actions: string[];
      deadline?: Date;
    }[];
  }[]>(),
  improvementPlan: json('improvement_plan').$type<{
    actions: {
      id: string;
      finding: string;
      action: string;
      assignedTo: string;
      deadline: Date;
      status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
      evidence?: string[];
    }[];
    lastUpdated: Date;
    nextReview: Date;
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const medicationTraining = pgTable('medication_training', {
  id: serial('id').primaryKey(),
  careHomeId: integer('care_home_id').references(() => careHomes.id),
  staffId: integer('staff_id'),
  trainingType: varchar('training_type', { length: 100 }).notNull(),
  completionDate: timestamp('completion_date').notNull(),
  expiryDate: timestamp('expiry_date'),
  certificateNumber: varchar('certificate_number', { length: 100 }),
  provider: varchar('provider', { length: 100 }),
  competencyAssessment: json('competency_assessment').$type<{
    assessor: string;
    date: Date;
    areas: {
      category: string;
      score: number;
      notes: string;
      recommendations?: string[];
    }[];
    overallResult: 'PASS' | 'FAIL' | 'NEEDS_IMPROVEMENT';
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Zod schemas for validation
export const insertComplianceSchema = createInsertSchema(medicationCompliance);
export const selectComplianceSchema = createSelectSchema(medicationCompliance);

export const insertTrainingSchema = createInsertSchema(medicationTraining);
export const selectTrainingSchema = createSelectSchema(medicationTraining);
