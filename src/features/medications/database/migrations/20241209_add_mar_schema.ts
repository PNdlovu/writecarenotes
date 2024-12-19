// src/features/medications/database/migrations/20241209_add_mar_schema.ts

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create MedicationSchedule table
  await knex.schema.createTable('medication_schedule', (table) => {
    table.string('id').primary();
    table.string('frequency').notNullable();
    table.json('times').notNullable();
    table.json('daysOfWeek').notNullable();
    table.text('instructions');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });

  // Create MAR table
  await knex.schema.createTable('mar', (table) => {
    table.string('id').primary();
    table.string('residentId').notNullable();
    table.string('medicationId').notNullable();
    table.string('scheduleId').notNullable();
    table.string('status').notNullable();
    table.timestamp('startDate').notNullable();
    table.timestamp('endDate');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
    
    table.foreign('residentId').references('resident.id');
    table.foreign('medicationId').references('medication.id');
    table.foreign('scheduleId').references('medication_schedule.id');
    
    table.index('residentId');
    table.index('medicationId');
  });

  // Create MAREntry table
  await knex.schema.createTable('mar_entry', (table) => {
    table.string('id').primary();
    table.string('marId').notNullable();
    table.timestamp('scheduledTime').notNullable();
    table.timestamp('administeredAt');
    table.string('status').notNullable();
    table.text('notes');
    table.string('administeredBy');
    table.string('witnessedBy');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
    
    table.foreign('marId').references('mar.id');
    table.index('marId');
    table.index('scheduledTime');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('mar_entry');
  await knex.schema.dropTable('mar');
  await knex.schema.dropTable('medication_schedule');
}


