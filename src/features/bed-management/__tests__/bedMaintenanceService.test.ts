import { describe, expect, it, beforeEach, jest } from '@jest/globals'
import { BedMaintenanceService } from '../services/bedMaintenanceService'
import { prisma } from '@/lib/prisma'
import { BedNotificationService } from '../services/bedNotificationService'
import { BedAuditService } from '../services/bedAuditService'
import { UserContext } from '@/types/context'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    bedMaintenance: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
    },
    bed: {
      update: jest.fn(),
      findUnique: jest.fn()
    }
  }
}))

jest.mock('../services/bedNotificationService', () => ({
  BedNotificationService: {
    getInstance: jest.fn(() => ({
      notifyMaintenanceDue: jest.fn()
    }))
  }
}))

jest.mock('../services/bedAuditService', () => ({
  BedAuditService: {
    getInstance: jest.fn(() => ({
      logAction: jest.fn()
    }))
  }
}))

describe('BedMaintenanceService', () => {
  let service: BedMaintenanceService
  const mockContext: UserContext = {
    userId: 'user-1',
    careHomeId: 'care-home-1',
    tenantId: 'tenant-1',
    region: 'UK',
    language: 'en'
  }

  beforeEach(() => {
    service = BedMaintenanceService.getInstance()
    jest.clearAllMocks()
  })

  describe('scheduleMaintenance', () => {
    it('should schedule maintenance for a bed', async () => {
      const mockBed = {
        id: 'bed-1',
        status: 'AVAILABLE'
      }

      const mockMaintenance = {
        id: 'maintenance-1',
        bedId: 'bed-1',
        type: 'ROUTINE',
        status: 'SCHEDULED'
      }

      ;(prisma.bed.findUnique as jest.Mock).mockResolvedValue(mockBed)
      ;(prisma.bedMaintenance.create as jest.Mock).mockResolvedValue(mockMaintenance)

      const result = await service.scheduleMaintenance(
        'bed-1',
        {
          type: 'ROUTINE',
          nextDue: new Date(),
          status: 'SCHEDULED'
        },
        mockContext
      )

      expect(result).toBeDefined()
      expect(result.id).toBe('maintenance-1')
      expect(prisma.bedMaintenance.create).toHaveBeenCalled()
      expect(BedAuditService.getInstance().logAction).toHaveBeenCalledWith(
        'MAINTENANCE_SCHEDULED',
        expect.any(Object),
        mockContext
      )
    })
  })

  describe('startMaintenance', () => {
    it('should start maintenance and update bed status', async () => {
      const mockBed = {
        id: 'bed-1',
        status: 'AVAILABLE'
      }

      const mockMaintenance = {
        id: 'maintenance-1',
        bedId: 'bed-1',
        status: 'SCHEDULED'
      }

      ;(prisma.bed.findUnique as jest.Mock).mockResolvedValue(mockBed)
      ;(prisma.bedMaintenance.findUnique as jest.Mock).mockResolvedValue(mockMaintenance)
      ;(prisma.bedMaintenance.update as jest.Mock).mockResolvedValue({
        ...mockMaintenance,
        status: 'IN_PROGRESS'
      })
      ;(prisma.bed.update as jest.Mock).mockResolvedValue({
        ...mockBed,
        status: 'MAINTENANCE'
      })

      const result = await service.startMaintenance('bed-1', mockContext)

      expect(result).toBeDefined()
      expect(prisma.bedMaintenance.update).toHaveBeenCalled()
      expect(prisma.bed.update).toHaveBeenCalled()
      expect(BedAuditService.getInstance().logAction).toHaveBeenCalledWith(
        'MAINTENANCE_STARTED',
        expect.any(Object),
        mockContext
      )
    })
  })

  describe('completeMaintenance', () => {
    it('should complete maintenance and restore bed status', async () => {
      const mockBed = {
        id: 'bed-1',
        status: 'MAINTENANCE'
      }

      const mockMaintenance = {
        id: 'maintenance-1',
        bedId: 'bed-1',
        status: 'IN_PROGRESS'
      }

      ;(prisma.bed.findUnique as jest.Mock).mockResolvedValue(mockBed)
      ;(prisma.bedMaintenance.findUnique as jest.Mock).mockResolvedValue(mockMaintenance)
      ;(prisma.bedMaintenance.update as jest.Mock).mockResolvedValue({
        ...mockMaintenance,
        status: 'COMPLETED'
      })
      ;(prisma.bed.update as jest.Mock).mockResolvedValue({
        ...mockBed,
        status: 'AVAILABLE'
      })

      const result = await service.completeMaintenance(
        'bed-1',
        ['No issues found'],
        'Routine maintenance completed',
        mockContext
      )

      expect(result).toBeDefined()
      expect(prisma.bedMaintenance.update).toHaveBeenCalled()
      expect(prisma.bed.update).toHaveBeenCalled()
      expect(BedAuditService.getInstance().logAction).toHaveBeenCalledWith(
        'MAINTENANCE_COMPLETED',
        expect.any(Object),
        mockContext
      )
    })
  })
})


