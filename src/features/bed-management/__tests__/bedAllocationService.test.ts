import { describe, expect, it, beforeEach, jest } from '@jest/globals'
import { BedAllocationService } from '../services/bedAllocationService'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import { UserContext } from '@/types/context'

// Mock prisma and cache
jest.mock('@/lib/prisma', () => ({
  prisma: {
    bed: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
    waitlistEntry: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }
}))

jest.mock('@/lib/cache', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn()
  }
}))

describe('BedAllocationService', () => {
  let service: BedAllocationService
  const mockContext: UserContext = {
    userId: 'user-1',
    careHomeId: 'care-home-1',
    tenantId: 'tenant-1',
    region: 'UK',
    language: 'en'
  }

  beforeEach(() => {
    service = BedAllocationService.getInstance()
    jest.clearAllMocks()
  })

  describe('findOptimalBed', () => {
    it('should return the most suitable bed based on criteria', async () => {
      const mockBeds = [
        {
          id: 'bed-1',
          name: 'Bed 1',
          type: 'STANDARD',
          status: 'AVAILABLE',
          careLevel: 'MEDIUM',
          features: ['ADJUSTABLE']
        },
        {
          id: 'bed-2',
          name: 'Bed 2',
          type: 'PREMIUM',
          status: 'AVAILABLE',
          careLevel: 'HIGH',
          features: ['ADJUSTABLE', 'BARIATRIC']
        }
      ]

      ;(prisma.bed.findMany as jest.Mock).mockResolvedValue(mockBeds)

      const result = await service.findOptimalBed(
        {
          careLevel: 'HIGH',
          priority: 'HIGH',
          specialRequirements: ['BARIATRIC']
        },
        mockContext
      )

      expect(result).toBeDefined()
      expect(result?.id).toBe('bed-2')
      expect(prisma.bed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            careHomeId: mockContext.careHomeId,
            status: 'AVAILABLE'
          })
        })
      )
    })

    it('should return null when no suitable bed is found', async () => {
      ;(prisma.bed.findMany as jest.Mock).mockResolvedValue([])

      const result = await service.findOptimalBed(
        {
          careLevel: 'HIGH',
          priority: 'HIGH',
          specialRequirements: ['BARIATRIC']
        },
        mockContext
      )

      expect(result).toBeNull()
    })
  })

  describe('addToWaitlist', () => {
    it('should create a new waitlist entry', async () => {
      const mockEntry = {
        id: 'waitlist-1',
        residentId: 'resident-1',
        priority: 'HIGH',
        status: 'ACTIVE'
      }

      ;(prisma.waitlistEntry.create as jest.Mock).mockResolvedValue(mockEntry)

      const result = await service.addToWaitlist(
        'resident-1',
        {
          priority: 'HIGH',
          careLevel: 'MEDIUM',
          preferredBedTypes: ['STANDARD'],
          specialRequirements: []
        },
        mockContext
      )

      expect(result).toBeDefined()
      expect(result.id).toBe('waitlist-1')
      expect(prisma.waitlistEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            residentId: 'resident-1',
            priority: 'HIGH'
          })
        })
      )
    })
  })

  describe('processWaitlist', () => {
    it('should process waitlist entries and allocate beds when available', async () => {
      const mockEntries = [
        {
          id: 'waitlist-1',
          residentId: 'resident-1',
          priority: 'HIGH',
          careLevel: 'MEDIUM',
          status: 'ACTIVE'
        }
      ]

      const mockBed = {
        id: 'bed-1',
        status: 'AVAILABLE',
        careLevel: 'MEDIUM'
      }

      ;(prisma.waitlistEntry.findMany as jest.Mock).mockResolvedValue(mockEntries)
      ;(prisma.bed.findMany as jest.Mock).mockResolvedValue([mockBed])
      ;(prisma.bed.update as jest.Mock).mockResolvedValue({ ...mockBed, status: 'RESERVED' })
      ;(prisma.waitlistEntry.update as jest.Mock).mockResolvedValue({ ...mockEntries[0], status: 'COMPLETED' })

      await service.processWaitlist(mockContext)

      expect(prisma.waitlistEntry.findMany).toHaveBeenCalled()
      expect(prisma.bed.update).toHaveBeenCalled()
      expect(prisma.waitlistEntry.update).toHaveBeenCalled()
    })
  })
})


