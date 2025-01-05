/**
 * @writecarenotes.com
 * @fileoverview Repository layer for medication administration records
 * @version 1.0.0
 * @created 2024-01-07
 * @updated 2024-01-07
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Repository layer handling database operations for medication
 * administration records with transaction support and audit logging.
 */

import { Knex } from 'knex';
import { 
  MedicationScheduleItem, 
  MedicationStatus,
  MedicationAdministrationRecord,
  MedicationVerificationResult,
  Staff
} from '../../types';

export class MedicationAdministrationRepository {
  constructor(private readonly knex: Knex) {}

  async getScheduleForResident(
    residentId: string,
    startDate: Date,
    endDate: Date,
    organizationId: string
  ): Promise<MedicationScheduleItem[]> {
    return this.knex.transaction(async (trx) => {
      const schedules = await trx('medication_schedules')
        .select([
          'medication_schedules.*',
          'medications.*',
          'administered_by_user.name as administered_by_name',
          'administered_by_user.role as administered_by_role',
          'witness_user.name as witness_name',
          'witness_user.role as witness_role',
          'created_by_user.name as created_by_name',
          'created_by_user.role as created_by_role',
          'updated_by_user.name as updated_by_name',
          'updated_by_user.role as updated_by_role',
        ])
        .join('medications', 'medication_schedules.medication_id', 'medications.id')
        .leftJoin('users as administered_by_user', 'medication_schedules.administered_by', 'administered_by_user.id')
        .leftJoin('users as witness_user', 'medication_schedules.witness', 'witness_user.id')
        .leftJoin('users as created_by_user', 'medication_schedules.created_by', 'created_by_user.id')
        .leftJoin('users as updated_by_user', 'medication_schedules.updated_by', 'updated_by_user.id')
        .where('medication_schedules.resident_id', residentId)
        .where('medication_schedules.organization_id', organizationId)
        .whereBetween('medication_schedules.scheduled_time', [startDate, endDate])
        .orderBy('medication_schedules.scheduled_time');

      return schedules.map(this.mapScheduleFromDb);
    });
  }

  async updateScheduleStatus(
    scheduleId: string,
    status: MedicationStatus,
    administeredBy: Staff,
    witness?: Staff,
    notes?: string,
    organizationId: string
  ): Promise<MedicationAdministrationRecord> {
    return this.knex.transaction(async (trx) => {
      // Get the schedule and medication details
      const schedule = await trx('medication_schedules')
        .select(['medication_schedules.*', 'medications.*'])
        .join('medications', 'medication_schedules.medication_id', 'medications.id')
        .where('medication_schedules.id', scheduleId)
        .where('medication_schedules.organization_id', organizationId)
        .first();

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      // Update schedule status
      await trx('medication_schedules')
        .where('id', scheduleId)
        .update({
          status,
          administered_by: administeredBy.id,
          witness: witness?.id,
          administered_at: new Date(),
          updated_at: new Date(),
          updated_by: administeredBy.id,
        });

      // Create administration record
      const [record] = await trx('medication_administration_records')
        .insert({
          schedule_id: scheduleId,
          status,
          administered_by: administeredBy.id,
          witness: witness?.id,
          administered_at: new Date(),
          notes,
          stock_level_before: schedule.stock_level,
          stock_level_after: schedule.stock_level - (status === MedicationStatus.COMPLETED ? 1 : 0),
          created_by: administeredBy.id,
          updated_by: administeredBy.id,
          organization_id: organizationId,
        })
        .returning('*');

      // Update medication stock level if administered
      if (status === MedicationStatus.COMPLETED) {
        await trx('medications')
          .where('id', schedule.medication_id)
          .decrement('stock_level', 1);

        // Record stock transaction
        await trx('medication_stock_transactions')
          .insert({
            medication_id: schedule.medication_id,
            transaction_type: 'ADMINISTERED',
            quantity: -1,
            stock_level_before: schedule.stock_level,
            stock_level_after: schedule.stock_level - 1,
            performed_by: administeredBy.id,
            witness: witness?.id,
            notes: `Administered as per schedule ${scheduleId}`,
            created_by: administeredBy.id,
            updated_by: administeredBy.id,
            organization_id: organizationId,
          });
      }

      return this.mapAdministrationRecordFromDb(record);
    });
  }

  async recordVerification(
    administrationId: string,
    verification: MedicationVerificationResult,
    organizationId: string
  ): Promise<void> {
    await this.knex('medication_verifications')
      .insert({
        administration_id: administrationId,
        verification_method: verification.verificationMethod,
        success: verification.success,
        verified_by: verification.verifiedBy.id,
        error_details: verification.error ? JSON.stringify(verification.error) : null,
        created_by: verification.verifiedBy.id,
        updated_by: verification.verifiedBy.id,
        organization_id: organizationId,
      });
  }

  private mapScheduleFromDb(dbRecord: any): MedicationScheduleItem {
    return {
      id: dbRecord.id,
      medication: {
        id: dbRecord.medication_id,
        name: dbRecord.name,
        dosage: dbRecord.dosage,
        unit: dbRecord.unit,
        route: dbRecord.route,
        frequency: dbRecord.frequency,
        instructions: dbRecord.instructions,
        startDate: dbRecord.start_date,
        endDate: dbRecord.end_date,
        barcode: dbRecord.barcode,
        active: dbRecord.active,
        controlledDrug: dbRecord.controlled_drug,
        requiresDoubleSignature: dbRecord.requires_double_signature,
        stockLevel: dbRecord.stock_level,
      },
      scheduledTime: dbRecord.scheduled_time,
      status: dbRecord.status,
      administeredBy: dbRecord.administered_by ? {
        id: dbRecord.administered_by,
        name: dbRecord.administered_by_name,
        role: dbRecord.administered_by_role,
      } : undefined,
      witness: dbRecord.witness ? {
        id: dbRecord.witness,
        name: dbRecord.witness_name,
        role: dbRecord.witness_role,
      } : undefined,
      administeredAt: dbRecord.administered_at,
      notes: dbRecord.notes,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      createdBy: {
        id: dbRecord.created_by,
        name: dbRecord.created_by_name,
        role: dbRecord.created_by_role,
      },
      updatedBy: {
        id: dbRecord.updated_by,
        name: dbRecord.updated_by_name,
        role: dbRecord.updated_by_role,
      },
    };
  }

  private mapAdministrationRecordFromDb(dbRecord: any): MedicationAdministrationRecord {
    return {
      id: dbRecord.id,
      scheduleItem: this.mapScheduleFromDb(dbRecord),
      status: dbRecord.status,
      administeredBy: {
        id: dbRecord.administered_by,
        name: dbRecord.administered_by_name,
        role: dbRecord.administered_by_role,
      },
      witness: dbRecord.witness ? {
        id: dbRecord.witness,
        name: dbRecord.witness_name,
        role: dbRecord.witness_role,
      } : undefined,
      administeredAt: dbRecord.administered_at,
      notes: dbRecord.notes,
      stockLevelBefore: dbRecord.stock_level_before,
      stockLevelAfter: dbRecord.stock_level_after,
      barcodeScanned: dbRecord.barcode_scanned,
      doubleSignatureVerified: dbRecord.double_signature_verified,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      createdBy: {
        id: dbRecord.created_by,
        name: dbRecord.created_by_name,
        role: dbRecord.created_by_role,
      },
      updatedBy: {
        id: dbRecord.updated_by,
        name: dbRecord.updated_by_name,
        role: dbRecord.updated_by_role,
      },
    };
  }
}


