// src/features/medications/database/migrations/20241209_add_mar_schema.ts

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create medications table
  await knex.schema.createTable('medications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.decimal('dosage').notNullable();
    table.string('unit').notNullable();
    table.string('route').notNullable();
    table.string('frequency').notNullable();
    table.text('instructions');
    table.timestamp('start_date').notNullable();
    table.timestamp('end_date');
    table.string('barcode');
    table.boolean('active').notNullable().defaultTo(true);
    table.boolean('controlled_drug').notNullable().defaultTo(false);
    table.boolean('requires_double_signature').notNullable().defaultTo(false);
    table.integer('stock_level');
    // Regional compliance fields
    table.boolean('parental_consent');
    table.timestamp('parental_consent_date');
    table.string('parental_consent_by');
    table.timestamp('ofsted_notification_date');
    table.timestamp('healthcare_plan_review_date');
    table.boolean('age_specific_dosage');
    table.boolean('pediatric_formulation');
    // Audit fields
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
    table.uuid('organization_id').notNullable();
    // Indexes
    table.index(['organization_id']);
    table.index(['barcode']);
    table.index(['controlled_drug']);
  });

  // Create medication schedules table
  await knex.schema.createTable('medication_schedules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('medication_id').notNullable().references('id').inTable('medications');
    table.uuid('resident_id').notNullable();
    table.timestamp('scheduled_time').notNullable();
    table.string('status').notNullable();
    table.uuid('administered_by').references('id').inTable('users');
    table.uuid('witness').references('id').inTable('users');
    table.timestamp('administered_at');
    table.text('notes');
    // Audit fields
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
    table.uuid('organization_id').notNullable();
    // Indexes
    table.index(['organization_id']);
    table.index(['resident_id']);
    table.index(['medication_id']);
    table.index(['scheduled_time']);
    table.index(['status']);
  });

  // Create medication administration records table
  await knex.schema.createTable('medication_administration_records', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('schedule_id').notNullable().references('id').inTable('medication_schedules');
    table.string('status').notNullable();
    table.uuid('administered_by').notNullable().references('id').inTable('users');
    table.uuid('witness').references('id').inTable('users');
    table.timestamp('administered_at').notNullable();
    table.text('notes');
    // Compliance fields
    table.integer('stock_level_before');
    table.integer('stock_level_after');
    table.boolean('barcode_scanned');
    table.boolean('double_signature_verified');
    // Audit fields
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
    table.uuid('organization_id').notNullable();
    // Indexes
    table.index(['organization_id']);
    table.index(['schedule_id']);
    table.index(['administered_at']);
  });

  // Create medication stock transactions table
  await knex.schema.createTable('medication_stock_transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('medication_id').notNullable().references('id').inTable('medications');
    table.string('transaction_type').notNullable(); // RECEIVED, ADMINISTERED, DISPOSED, ADJUSTED
    table.integer('quantity').notNullable();
    table.integer('stock_level_before').notNullable();
    table.integer('stock_level_after').notNullable();
    table.string('batch_number');
    table.timestamp('expiry_date');
    table.uuid('performed_by').notNullable().references('id').inTable('users');
    table.uuid('witness').references('id').inTable('users');
    table.text('notes');
    // Audit fields
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
    table.uuid('organization_id').notNullable();
    // Indexes
    table.index(['organization_id']);
    table.index(['medication_id']);
    table.index(['transaction_type']);
    table.index(['batch_number']);
  });

  // Create medication verifications table
  await knex.schema.createTable('medication_verifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('administration_id').notNullable().references('id').inTable('medication_administration_records');
    table.string('verification_method').notNullable(); // PIN, BARCODE, BIOMETRIC
    table.boolean('success').notNullable();
    table.uuid('verified_by').notNullable().references('id').inTable('users');
    table.jsonb('error_details');
    // Audit fields
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
    table.uuid('organization_id').notNullable();
    // Indexes
    table.index(['organization_id']);
    table.index(['administration_id']);
    table.index(['verification_method']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('medication_verifications');
  await knex.schema.dropTableIfExists('medication_stock_transactions');
  await knex.schema.dropTableIfExists('medication_administration_records');
  await knex.schema.dropTableIfExists('medication_schedules');
  await knex.schema.dropTableIfExists('medications');
}


