import { BedRepository } from '../database/repositories/bedRepository'
import { Bed, BedStatus } from '../types/bed.types'
import { BedError, BedErrorCode } from '../types/errors'
import type { ServiceContext } from '@/types/context'

export class BedService {
  private static instance: BedService
  private repository: BedRepository

  private constructor() {
    this.repository = BedRepository.getInstance()
  }

  static getInstance(): BedService {
    if (!BedService.instance) {
      BedService.instance = new BedService()
    }
    return BedService.instance
  }

  async getBed(id: string, context: ServiceContext): Promise<Bed> {
    const bed = await this.repository.findById(id, {
      userId: context.userId,
      careHomeId: context.careHomeId
    })

    if (!bed) {
      throw new BedError(
        `Bed not found: ${id}`,
        BedErrorCode.NOT_FOUND
      )
    }

    return bed
  }

  async createBed(data: Omit<Bed, 'id'>, context: ServiceContext): Promise<Bed> {
    // Validate room capacity
    await this.validateRoomCapacity(data.roomId, context)

    return this.repository.create(data, {
      userId: context.userId,
      careHomeId: context.careHomeId
    })
  }

  async updateBed(id: string, updates: Partial<Bed>, context: ServiceContext): Promise<Bed> {
    const bed = await this.getBed(id, context)

    // Validate status transition
    if (updates.status && updates.status !== bed.status) {
      this.validateStatusTransition(bed.status, updates.status)
    }

    return this.repository.update(id, updates, {
      userId: context.userId,
      careHomeId: context.careHomeId
    })
  }

  async deleteBed(id: string, context: ServiceContext): Promise<void> {
    const bed = await this.getBed(id, context)

    // Check if bed can be deleted
    if (bed.status !== 'AVAILABLE') {
      throw new BedError(
        'Cannot delete bed that is not available',
        BedErrorCode.INVALID_STATUS_TRANSITION
      )
    }

    await this.repository.delete(id, {
      userId: context.userId,
      careHomeId: context.careHomeId
    })
  }

  async assignResident(
    bedId: string,
    residentId: string,
    admissionDate: Date,
    context: ServiceContext
  ): Promise<Bed> {
    const bed = await this.getBed(bedId, context)

    // Validate bed availability
    if (bed.status !== 'AVAILABLE' && bed.status !== 'RESERVED') {
      throw new BedError(
        'Bed is not available for assignment',
        BedErrorCode.INVALID_STATUS_TRANSITION
      )
    }

    // If bed was reserved for a different resident, throw error
    if (bed.status === 'RESERVED' && 
        bed.nextReservation?.residentId !== residentId) {
      throw new BedError(
        'Bed is reserved for a different resident',
        BedErrorCode.INVALID_ASSIGNMENT
      )
    }

    return this.repository.update(bedId, {
      status: 'OCCUPIED',
      currentOccupant: {
        residentId,
        admissionDate,
        careLevel: 'MEDIUM', // Default level, should be updated based on assessment
        specialRequirements: []
      },
      nextReservation: null // Clear any reservation
    }, {
      userId: context.userId,
      careHomeId: context.careHomeId
    })
  }

  async reserveBed(
    bedId: string,
    residentId: string,
    expectedArrivalDate: Date,
    context: ServiceContext
  ): Promise<Bed> {
    const bed = await this.getBed(bedId, context)

    if (bed.status !== 'AVAILABLE') {
      throw new BedError(
        'Bed is not available for reservation',
        BedErrorCode.INVALID_STATUS_TRANSITION
      )
    }

    return this.repository.update(bedId, {
      status: 'RESERVED',
      nextReservation: {
        residentId,
        expectedArrivalDate,
        specialRequirements: []
      }
    }, {
      userId: context.userId,
      careHomeId: context.careHomeId
    })
  }

  async dischargeBed(
    bedId: string,
    context: ServiceContext
  ): Promise<Bed> {
    const bed = await this.getBed(bedId, context)

    if (bed.status !== 'OCCUPIED') {
      throw new BedError(
        'Bed is not occupied',
        BedErrorCode.INVALID_STATUS_TRANSITION
      )
    }

    return this.repository.update(bedId, {
      status: 'CLEANING',
      currentOccupant: null
    }, {
      userId: context.userId,
      careHomeId: context.careHomeId
    })
  }

  async getOccupancyStats(context: ServiceContext) {
    const stats = await this.repository.getOccupancyStats(context.careHomeId)
    return {
      ...stats,
      occupancyRate: (stats.occupied / stats.total) * 100
    }
  }

  private async validateRoomCapacity(roomId: string, context: ServiceContext): Promise<void> {
    // Implementation needed: Check if room has capacity for another bed
    // This would involve checking the room's maximum capacity against current bed count
  }

  private validateStatusTransition(currentStatus: BedStatus, newStatus: BedStatus): void {
    const validTransitions: Record<BedStatus, BedStatus[]> = {
      'AVAILABLE': ['OCCUPIED', 'RESERVED', 'MAINTENANCE', 'ISOLATION'],
      'OCCUPIED': ['CLEANING', 'ISOLATION'],
      'RESERVED': ['AVAILABLE', 'OCCUPIED'],
      'MAINTENANCE': ['AVAILABLE', 'CLEANING'],
      'CLEANING': ['AVAILABLE', 'MAINTENANCE'],
      'ISOLATION': ['CLEANING']
    }

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BedError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        BedErrorCode.INVALID_STATUS_TRANSITION
      )
    }
  }
}


