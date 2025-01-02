import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create ParentalConsent table
  await knex.schema.createTable('parental_consent', (table) => {
    table.string('id').primary();
    table.string('resident_id').notNullable();
    table.string('medication_id').notNullable();
    table.string('consent_type').notNullable();
    table.string('status').notNullable();
    table.string('family_portal_request_id').unique().notNullable();
    table.string('family_portal_status').notNullable();
    table.timestamp('requested_at').notNullable();
    table.timestamp('responded_at');
    table.timestamp('expires_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.text('notes');

    table.index('resident_id');
    table.index('medication_id');
    table.index('family_portal_request_id');
  });

  // Create ConsentGuardian table
  await knex.schema.createTable('consent_guardian', (table) => {
    table.string('id').primary();
    table.string('consent_id').unique().notNullable();
    table.string('name').notNullable();
    table.string('relationship').notNullable();
    table.string('contact_number').notNullable();
    table.string('email');
    table.string('family_portal_user_id').notNullable();

    table.foreign('consent_id').references('parental_consent.id');
    table.index('family_portal_user_id');
  });

  // Create EmergencyContact table
  await knex.schema.createTable('emergency_contact', (table) => {
    table.string('id').primary();
    table.string('consent_id').unique().notNullable();
    table.string('name').notNullable();
    table.string('relationship').notNullable();
    table.string('contact_number').notNullable();

    table.foreign('consent_id').references('parental_consent.id');
  });

  // Create ConsentCondition table
  await knex.schema.createTable('consent_condition', (table) => {
    table.string('id').primary();
    table.string('consent_id').notNullable();
    table.string('condition').notNullable();

    table.foreign('consent_id').references('parental_consent.id');
    table.index('consent_id');
  });

  // Create ConsentHistory table
  await knex.schema.createTable('consent_history', (table) => {
    table.string('id').primary();
    table.string('consent_id').notNullable();
    table.timestamp('timestamp').notNullable();
    table.string('action').notNullable();
    table.string('portal_session_id');
    table.text('notes');

    table.foreign('consent_id').references('parental_consent.id');
    table.index('consent_id');
    table.index('timestamp');
  });

  // Create HistoryActor table
  await knex.schema.createTable('history_actor', (table) => {
    table.string('id').primary();
    table.string('history_id').unique().notNullable();
    table.string('actor_id').notNullable();
    table.string('name').notNullable();
    table.string('role').notNullable();
    table.string('portal_user_id');

    table.foreign('history_id').references('consent_history.id');
    table.index('actor_id');
    table.index('portal_user_id');
  });

  // Create Verification table
  await knex.schema.createTable('verification', (table) => {
    table.string('id').primary();
    table.string('consent_id').unique().notNullable();
    table.string('type').notNullable();
    table.string('method').notNullable();
    table.timestamp('verified_at').notNullable();
    table.text('signature_data');
    table.text('encrypted_data');
    table.string('iv');

    table.foreign('consent_id').references('parental_consent.id');
  });

  // Create OfflineSync table
  await knex.schema.createTable('offline_sync', (table) => {
    table.string('id').primary();
    table.string('consent_id').unique().notNullable();
    table.string('status').notNullable();
    table.timestamp('last_sync_attempt');
    table.text('sync_error');
    table.json('local_changes');

    table.foreign('consent_id').references('parental_consent.id');
  });

  // Create NotificationPreference table
  await knex.schema.createTable('notification_preference', (table) => {
    table.string('id').primary();
    table.string('user_id').unique().notNullable();
    table.boolean('email').defaultTo(true);
    table.boolean('push').defaultTo(true);
    table.boolean('sms').defaultTo(false);
    table.string('reminder_frequency').defaultTo('NONE');

    table.index('user_id');
  });

  // Create NotificationQueue table
  await knex.schema.createTable('notification_queue', (table) => {
    table.string('id').primary();
    table.string('type').notNullable();
    table.string('user_id').notNullable();
    table.json('payload').notNullable();
    table.string('status').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('sent_at');
    table.text('error');

    table.index('user_id');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order to handle foreign key constraints
  await knex.schema.dropTableIfExists('notification_queue');
  await knex.schema.dropTableIfExists('notification_preference');
  await knex.schema.dropTableIfExists('offline_sync');
  await knex.schema.dropTableIfExists('verification');
  await knex.schema.dropTableIfExists('history_actor');
  await knex.schema.dropTableIfExists('consent_history');
  await knex.schema.dropTableIfExists('consent_condition');
  await knex.schema.dropTableIfExists('emergency_contact');
  await knex.schema.dropTableIfExists('consent_guardian');
  await knex.schema.dropTableIfExists('parental_consent');
}


