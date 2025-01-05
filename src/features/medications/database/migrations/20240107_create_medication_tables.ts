/**
 * @writecarenotes.com
 * @fileoverview Database Migration for Medication Module
 * @version 1.0.0
 * @created 2024-01-07
 * @updated 2024-01-07
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Core database schema for medication management with extensibility
 * for future mobile/native app support.
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create medication schedules table
  await knex.schema.createTable('medication_schedules', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('resident_id').notNullable().references('id').inTable('residents');
    table.uuid('medication_id').notNullable().references('id').inTable('medications');
    table.string('frequency').notNullable();
    table.jsonb('times').notNullable();
    table.jsonb('days_of_week').notNullable();
    table.text('instructions');
    table.string('route').notNullable();
    table.string('dosage').notNullable();
    table.decimal('max_dosage_24hr');
    table.boolean('requires_witness').defaultTo(false);
    table.boolean('requires_double_signature').defaultTo(false);
    table.boolean('requires_stock_check').defaultTo(false);
    table.boolean('parental_consent').defaultTo(false);
    table.timestamp('consent_date');
    table.string('consented_by');
    table.boolean('is_children_service').defaultTo(false);
    table.string('care_home_type').notNullable();
    table.timestamp('scheduled_time').notNullable();
    table.string('medication_name').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_administered_at');
    table.uuid('last_administered_by').references('id').inTable('staff');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('created_by').references('id').inTable('staff');
    table.uuid('updated_by').references('id').inTable('staff');

    // Core indexes
    table.index(['resident_id', 'is_active']);
    table.index(['medication_id', 'is_active']);
    table.index('scheduled_time');
  });

  // Create medication administrations table
  await knex.schema.createTable('medication_administrations', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('schedule_id').notNullable().references('id').inTable('medication_schedules');
    table.string('status').notNullable();
    table.uuid('administered_by').notNullable().references('id').inTable('staff');
    table.uuid('witness_id').references('id').inTable('staff');
    table.text('notes');
    table.timestamp('administered_at').notNullable();
    table.decimal('dosage').notNullable();
    table.uuid('verified_by').references('id').inTable('staff');
    table.timestamp('verified_at');
    table.text('verification_notes');
    table.string('region');
    table.jsonb('requirements');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Core indexes
    table.index(['schedule_id', 'administered_at']);
    table.index(['administered_by', 'administered_at']);
  });

  // Create medication alerts table
  await knex.schema.createTable('medication_alerts', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('type').notNullable();
    table.string('priority').notNullable();
    table.string('status').notNullable();
    table.jsonb('details').notNullable();
    table.timestamp('created_at').notNullable();
    table.timestamp('acknowledged_at');
    table.uuid('acknowledged_by').references('id').inTable('staff');
    table.string('region');
    table.boolean('requires_immediate_attention').defaultTo(false);
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Core indexes
    table.index(['status', 'priority']);
    table.index('requires_immediate_attention');
  });

  // Create medication stock table
  await knex.schema.createTable('medication_stock', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('medication_id').notNullable().references('id').inTable('medications');
    table.decimal('quantity').notNullable();
    table.decimal('reorder_level').notNullable();
    table.decimal('critical_level').notNullable();
    table.timestamp('expiry_date');
    table.string('batch_number');
    table.timestamp('last_updated').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Core indexes
    table.index(['medication_id', 'quantity']);
    table.index('expiry_date');
  });

  // Create stock transactions table
  await knex.schema.createTable('stock_transactions', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('medication_id').notNullable().references('id').inTable('medications');
    table.string('type').notNullable();
    table.decimal('quantity').notNullable();
    table.string('reason');
    table.text('notes');
    table.string('batch_number');
    table.timestamp('expiry_date');
    table.string('supplier');
    table.uuid('received_by').references('id').inTable('staff');
    table.uuid('adjusted_by').references('id').inTable('staff');
    table.timestamp('transaction_date').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Core indexes
    table.index(['medication_id', 'transaction_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('stock_transactions');
  await knex.schema.dropTableIfExists('medication_stock');
  await knex.schema.dropTableIfExists('medication_alerts');
  await knex.schema.dropTableIfExists('medication_administrations');
  await knex.schema.dropTableIfExists('medication_schedules');
} 