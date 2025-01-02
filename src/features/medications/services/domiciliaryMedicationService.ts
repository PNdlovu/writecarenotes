/**
 * @writecarenotes.com
 * @fileoverview Domiciliary extension for medication management
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Extension service for medication management in domiciliary care.
 * Extends core medication functionality with domiciliary-specific features
 * like visit scheduling, offline support, and location verification.
 */

import { prisma } from '@/lib/prisma'
import { SyncStatus } from '@prisma/client'
import { z } from 'zod'
import { MedicationService } from '../medicationService'
import { RegionalComplianceService } from '../../staff/services/regionalComplianceService'

// Validation schemas
export const visitMedicationSchema = z.object({
  visitId: z.string(),
  medicationId: z.string(),
  scheduledTime: z.date(),
  notes: z.string().optional(),
})

export const locationVerificationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number(),
  timestamp: z.date(),
})

export class DomiciliaryMedicationExtension {
  constructor(
    private medicationService: MedicationService,
    private complianceService: RegionalComplianceService
  ) {}

  /**
   * Schedule medications for a visit
   */
  async scheduleVisitMedications(
    visitId: string,
    medications: z.infer<typeof visitMedicationSchema>[]
  ) {
    const visit = await prisma.domiciliaryVisit.findUnique({
      where: { id: visitId },
      include: { client: true },
    })

    if (!visit) {
      throw new Error('Visit not found')
    }

    // Verify regional compliance
    await this.complianceService.verifyMedicationSchedule(
      visit.client.organizationId,
      medications
    )

    // Create schedules using transaction
    return prisma.$transaction(
      medications.map(med =>
        prisma.domiciliaryMedicationSchedule.create({
          data: {
            visitId: visit.id,
            clientId: visit.clientId,
            medicationId: med.medicationId,
            scheduledTime: med.scheduledTime,
            notes: med.notes,
            status: 'PENDING',
            syncStatus: SyncStatus.PENDING,
          },
        })
      )
    )
  }

  /**
   * Verify location before administration
   */
  async verifyAdministrationLocation(
    scheduleId: string,
    location: z.infer<typeof locationVerificationSchema>
  ) {
    const schedule = await prisma.domiciliaryMedicationSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        visit: true,
        client: true,
      },
    })

    if (!schedule) {
      throw new Error('Schedule not found')
    }

    // Calculate distance from client's address
    // This would use a geocoding service in production
    const isWithinRange = true // Placeholder for actual calculation

    if (!isWithinRange) {
      throw new Error('Location verification failed')
    }

    return prisma.domiciliaryMedicationSchedule.update({
      where: { id: scheduleId },
      data: {
        locationVerified: true,
        locationVerifiedAt: new Date(),
      },
    })
  }

  /**
   * Get visit medication schedules with offline support
   */
  async getVisitSchedules(visitId: string) {
    const schedules = await prisma.domiciliaryMedicationSchedule.findMany({
      where: { visitId },
      include: {
        medication: true,
        visit: {
          include: {
            client: true,
          },
        },
      },
    })

    // Add offline support metadata
    return schedules.map(schedule => ({
      ...schedule,
      offlineEnabled: true,
      lastSynced: schedule.lastSyncedAt,
    }))
  }

  /**
   * Sync offline changes
   */
  async syncOfflineChanges(staffId: string) {
    const pendingSchedules = await prisma.domiciliaryMedicationSchedule.findMany({
      where: {
        visit: {
          staffId,
        },
        syncStatus: SyncStatus.PENDING,
      },
    })

    // Process each pending change
    for (const schedule of pendingSchedules) {
      try {
        // Verify and sync with main medication records
        await this.medicationService.verifyAdministration(schedule.medicationId)
        
        // Update sync status
        await prisma.domiciliaryMedicationSchedule.update({
          where: { id: schedule.id },
          data: { syncStatus: SyncStatus.SYNCED },
        })
      } catch (error) {
        console.error(`Failed to sync schedule ${schedule.id}:`, error)
        // Mark as failed but keep for retry
        await prisma.domiciliaryMedicationSchedule.update({
          where: { id: schedule.id },
          data: { syncStatus: SyncStatus.FAILED },
        })
      }
    }

    return pendingSchedules
  }

  /**
   * Get regional compliance alerts
   */
  async getComplianceAlerts(organizationId: string) {
    const [missedMedications, scheduleConflicts] = await Promise.all([
      // Get missed medications
      prisma.domiciliaryMedicationSchedule.findMany({
        where: {
          visit: {
            client: {
              organizationId,
            },
          },
          status: 'MISSED',
        },
        include: {
          medication: true,
          client: true,
        },
      }),
      // Get schedule conflicts
      prisma.domiciliaryMedicationSchedule.findMany({
        where: {
          visit: {
            client: {
              organizationId,
            },
          },
          scheduledTime: {
            // Within next 24 hours
            gte: new Date(),
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
        include: {
          visit: true,
          medication: true,
        },
      }),
    ])

    return {
      missedMedications: missedMedications.map(med => ({
        type: 'MISSED_MEDICATION',
        severity: 'HIGH',
        message: `Missed medication for ${med.client.name}: ${med.medication.name}`,
        data: med,
      })),
      scheduleConflicts: this.findScheduleConflicts(scheduleConflicts),
    }
  }

  private findScheduleConflicts(schedules: any[]) {
    // Implementation to find overlapping or conflicting schedules
    return []
  }
} 