import { BedService } from './bedService'
import { BedRepository } from '../database/repositories/bedRepository'
import { WaitlistRepository } from '../database/repositories/waitlistRepository'
import type {
  Bed,
  WaitlistEntry,
  PriorityLevel,
  CareLevel,
  BedType
} from '../types/bed.types'
import { BedError, BedErrorCode } from '../types/errors'
import type { ServiceContext } from '@/types/context'

interface AllocationCriteria {
  careLevel: CareLevel
  priority: PriorityLevel
  preferredBedTypes?: BedType[]
  specialRequirements?: string[]
  floor?: string
  wing?: string
}

interface AllocationResult {
  bed: Bed | null
  score: number
  reasons: string[]
}

export class BedAllocationService {
  private static instance: BedAllocationService
  private bedService: BedService
  private bedRepository: BedRepository
  private waitlistRepository: WaitlistRepository

  private constructor() {
    this.bedService = BedService.getInstance()
    this.bedRepository = BedRepository.getInstance()
    this.waitlistRepository = WaitlistRepository.getInstance()
  }

  static getInstance(): BedAllocationService {
    if (!BedAllocationService.instance) {
      BedAllocationService.instance = new BedAllocationService()
    }
    return BedAllocationService.instance
  }

  async findOptimalBed(
    criteria: AllocationCriteria,
    context: ServiceContext
  ): Promise<AllocationResult> {
    const availableBeds = await this.bedRepository.findAvailable(context)
    let bestMatch: AllocationResult = { bed: null, score: 0, reasons: [] }

    for (const bed of availableBeds) {
      const score = this.calculateMatchScore(bed, criteria)
      if (score.value > bestMatch.score) {
        bestMatch = { bed, score: score.value, reasons: score.reasons }
      }
    }

    return bestMatch
  }

  private calculateMatchScore(bed: Bed, criteria: AllocationCriteria): { value: number; reasons: string[] } {
    let score = 0
    const reasons: string[] = []

    // Base score for availability
    if (bed.status === 'AVAILABLE') {
      score += 100
      reasons.push('Bed is available')
    }

    // Preferred bed type match
    if (criteria.preferredBedTypes?.includes(bed.type)) {
      score += 50
      reasons.push('Matches preferred bed type')
    }

    // Special requirements match
    const matchingRequirements = criteria.specialRequirements?.filter(req =>
      bed.features.includes(req)
    ) || []
    score += matchingRequirements.length * 10
    if (matchingRequirements.length > 0) {
      reasons.push(`Matches ${matchingRequirements.length} special requirements`)
    }

    // Location preference match
    if (criteria.floor && bed.floor === criteria.floor) {
      score += 20
      reasons.push('Matches preferred floor')
    }
    if (criteria.wing && bed.wing === criteria.wing) {
      score += 20
      reasons.push('Matches preferred wing')
    }

    return { value: score, reasons }
  }

  async processWaitlist(context: ServiceContext): Promise<void> {
    const waitlist = await this.waitlistRepository.findActive(context)
    const processed = new Set<string>()

    // Sort by priority and waiting time
    const sortedEntries = this.prioritizeWaitlist(waitlist)

    for (const entry of sortedEntries) {
      if (processed.has(entry.residentId)) continue

      const allocation = await this.findOptimalBed({
        careLevel: entry.careLevel,
        priority: entry.priority,
        preferredBedTypes: entry.preferredBedTypes,
        specialRequirements: entry.specialRequirements
      }, context)

      if (allocation.bed) {
        await this.bedService.assignResident(
          allocation.bed.id,
          entry.residentId,
          {
            admissionDate: new Date(),
            careLevel: entry.careLevel,
            specialRequirements: entry.specialRequirements
          },
          context
        )

        await this.waitlistRepository.updateStatus(
          entry.residentId,
          'PLACED',
          context
        )

        processed.add(entry.residentId)
      }
    }
  }

  private prioritizeWaitlist(entries: WaitlistEntry[]): WaitlistEntry[] {
    return entries.sort((a, b) => {
      // Priority level comparison
      const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff

      // If same priority, sort by waiting time
      return a.requestDate.getTime() - b.requestDate.getTime()
    })
  }

  async addToWaitlist(
    residentId: string,
    entry: Omit<WaitlistEntry, 'residentId' | 'requestDate' | 'status'>,
    context: ServiceContext
  ): Promise<WaitlistEntry> {
    // Check if resident is already on waitlist
    const existing = await this.waitlistRepository.findByResident(residentId, context)
    if (existing && existing.status === 'ACTIVE') {
      throw new BedError(
        'Resident is already on the waitlist',
        BedErrorCode.DUPLICATE_ENTRY
      )
    }

    return this.waitlistRepository.create({
      ...entry,
      residentId,
      requestDate: new Date(),
      status: 'ACTIVE'
    }, context)
  }
}


