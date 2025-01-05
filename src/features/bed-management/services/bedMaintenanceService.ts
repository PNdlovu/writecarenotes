import { BedService } from './bedService'
import { BedRepository } from '../database/repositories/bedRepository'
import type {
  Bed,
  MaintenanceSchedule,
  MaintenanceType
} from '../types/bed.types'
import { BedError, BedErrorCode } from '../types/errors'
import type { ServiceContext } from '@/types/context'

interface MaintenanceDue {
  bed: Bed
  maintenanceType: MaintenanceType
  daysOverdue: number
}

export class BedMaintenanceService {
  private static instance: BedMaintenanceService
  private bedService: BedService
  private bedRepository: BedRepository

  private constructor() {
    this.bedService = BedService.getInstance()
    this.bedRepository = BedRepository.getInstance()
  }

  static getInstance(): BedMaintenanceService {
    if (!BedMaintenanceService.instance) {
      BedMaintenanceService.instance = new BedMaintenanceService()
    }
    return BedMaintenanceService.instance
  }

  async scheduleMaintenance(
    bedId: string,
    schedule: Omit<MaintenanceSchedule, 'status'>,
    context: ServiceContext
  ): Promise<Bed> {
    const bed = await this.bedService.getBed(bedId, context)

    // Validate bed availability
    if (bed.status === 'OCCUPIED') {
      throw new BedError(
        'Cannot schedule maintenance for occupied bed',
        BedErrorCode.INVALID_OPERATION
      )
    }

    // Create maintenance schedule
    const maintenanceSchedule: MaintenanceSchedule = {
      ...schedule,
      status: 'SCHEDULED'
    }

    // Update bed
    return this.bedRepository.update(
      bedId,
      {
        status: 'MAINTENANCE',
        maintenanceSchedule
      },
      context
    )
  }

  async startMaintenance(
    bedId: string,
    context: ServiceContext
  ): Promise<Bed> {
    const bed = await this.bedService.getBed(bedId, context)

    if (!bed.maintenanceSchedule) {
      throw new BedError(
        'No maintenance scheduled',
        BedErrorCode.INVALID_OPERATION
      )
    }

    if (bed.maintenanceSchedule.status !== 'SCHEDULED') {
      throw new BedError(
        'Maintenance is not in scheduled state',
        BedErrorCode.INVALID_OPERATION
      )
    }

    return this.bedRepository.update(
      bedId,
      {
        maintenanceSchedule: {
          ...bed.maintenanceSchedule,
          status: 'IN_PROGRESS'
        }
      },
      context
    )
  }

  async completeMaintenance(
    bedId: string,
    issues: string[],
    notes: string | undefined,
    context: ServiceContext
  ): Promise<Bed> {
    const bed = await this.bedService.getBed(bedId, context)

    if (!bed.maintenanceSchedule) {
      throw new BedError(
        'No maintenance scheduled',
        BedErrorCode.INVALID_OPERATION
      )
    }

    if (bed.maintenanceSchedule.status !== 'IN_PROGRESS') {
      throw new BedError(
        'Maintenance is not in progress',
        BedErrorCode.INVALID_OPERATION
      )
    }

    // Schedule next maintenance based on type
    const nextDue = this.calculateNextMaintenanceDate(
      bed.maintenanceSchedule.type
    )

    return this.bedRepository.update(
      bedId,
      {
        status: 'AVAILABLE',
        maintenanceSchedule: {
          lastChecked: new Date(),
          nextDue,
          type: bed.maintenanceSchedule.type,
          issues,
          notes,
          status: 'COMPLETED'
        }
      },
      context
    )
  }

  async findOverdueMaintenance(
    context: ServiceContext
  ): Promise<MaintenanceDue[]> {
    const beds = await this.bedRepository.findAll(context)
    const overdue: MaintenanceDue[] = []
    const now = new Date()

    for (const bed of beds) {
      if (!bed.maintenanceSchedule?.nextDue) continue

      const daysOverdue = Math.floor(
        (now.getTime() - bed.maintenanceSchedule.nextDue.getTime()) /
        (1000 * 60 * 60 * 24)
      )

      if (daysOverdue > 0) {
        overdue.push({
          bed,
          maintenanceType: bed.maintenanceSchedule.type,
          daysOverdue
        })
      }
    }

    return overdue.sort((a, b) => b.daysOverdue - a.daysOverdue)
  }

  private calculateNextMaintenanceDate(type: MaintenanceType): Date {
    const now = new Date()
    const intervals: { [K in MaintenanceType]: number } = {
      ROUTINE: 30, // 30 days
      PREVENTIVE: 90, // 90 days
      REPAIR: 180, // 180 days
      DEEP_CLEANING: 60, // 60 days
      INSPECTION: 365, // 365 days
      EMERGENCY: 30 // 30 days after emergency repair
    }

    return new Date(
      now.getTime() + intervals[type] * 24 * 60 * 60 * 1000
    )
  }
}


