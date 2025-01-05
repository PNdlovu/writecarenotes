import { describe, expect, it, beforeEach, jest } from '@jest/globals'
import { BedTransferService } from '../services/bedTransferService'
import { prisma } from '@/lib/prisma'
import { BedNotificationService } from '../services/bedNotificationService'
import { BedAuditService } from '../services/bedAuditService'
import { UserContext } from '@/types/context'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    bedTransfer: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
    bed: {
      findUnique: jest.fn(),
      update: jest.fn()
    }
  }
}))

jest.mock('../services/bedNotificationService', () => ({
  BedNotificationService: {
    getInstance: jest.fn(() => ({
      notifyTransferRequest: jest.fn()
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

describe('BedTransferService', () => {
  let service: BedTransferService
  const mockContext: UserContext = {
    userId: 'user-1',
    careHomeId: 'care-home-1',
    tenantId: 'tenant-1',
    region: 'UK',
    language: 'en'
  }

  beforeEach(() => {
    service = BedTransferService.getInstance()
    jest.clearAllMocks()
  })

  describe('requestTransfer', () => {
    it('should create a transfer request', async () => {
      const mockSourceBed = {
        id: 'bed-1',
        status: 'OCCUPIED',
        residentId: 'resident-1'
      }

      const mockTargetBed = {
        id: 'bed-2',
        status: 'AVAILABLE'
      }

      const mockTransfer = {
        id: 'transfer-1',
        sourceBedId: 'bed-1',
        targetBedId: 'bed-2',
        status: 'PENDING'
      }

      ;(prisma.bed.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockSourceBed)
        .mockResolvedValueOnce(mockTargetBed)
      ;(prisma.bedTransfer.create as jest.Mock).mockResolvedValue(mockTransfer)

      const result = await service.requestTransfer(
        'bed-1',
        'bed-2',
        'MEDICAL',
        'Need specialized equipment',
        mockContext
      )

      expect(result).toBeDefined()
      expect(result.id).toBe('transfer-1')
      expect(prisma.bedTransfer.create).toHaveBeenCalled()
      expect(BedNotificationService.getInstance().notifyTransferRequest).toHaveBeenCalled()
      expect(BedAuditService.getInstance().logAction).toHaveBeenCalledWith(
        'TRANSFER_REQUESTED',
        expect.any(Object),
        mockContext
      )
    })
  })

  describe('approveTransfer', () => {
    it('should approve a transfer request', async () => {
      const mockTransfer = {
        id: 'transfer-1',
        sourceBedId: 'bed-1',
        targetBedId: 'bed-2',
        status: 'PENDING'
      }

      ;(prisma.bedTransfer.findUnique as jest.Mock).mockResolvedValue(mockTransfer)
      ;(prisma.bedTransfer.update as jest.Mock).mockResolvedValue({
        ...mockTransfer,
        status: 'APPROVED'
      })

      const result = await service.approveTransfer(
        'transfer-1',
        'Approved for transfer',
        mockContext
      )

      expect(result).toBeDefined()
      expect(result.status).toBe('APPROVED')
      expect(prisma.bedTransfer.update).toHaveBeenCalled()
      expect(BedAuditService.getInstance().logAction).toHaveBeenCalledWith(
        'TRANSFER_APPROVED',
        expect.any(Object),
        mockContext
      )
    })
  })

  describe('executeTransfer', () => {
    it('should execute an approved transfer', async () => {
      const mockTransfer = {
        id: 'transfer-1',
        sourceBedId: 'bed-1',
        targetBedId: 'bed-2',
        status: 'APPROVED',
        residentId: 'resident-1'
      }

      const mockSourceBed = {
        id: 'bed-1',
        status: 'OCCUPIED',
        residentId: 'resident-1'
      }

      const mockTargetBed = {
        id: 'bed-2',
        status: 'AVAILABLE'
      }

      ;(prisma.bedTransfer.findUnique as jest.Mock).mockResolvedValue(mockTransfer)
      ;(prisma.bed.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockSourceBed)
        .mockResolvedValueOnce(mockTargetBed)
      ;(prisma.bed.update as jest.Mock)
        .mockResolvedValueOnce({ ...mockSourceBed, status: 'AVAILABLE', residentId: null })
        .mockResolvedValueOnce({ ...mockTargetBed, status: 'OCCUPIED', residentId: 'resident-1' })
      ;(prisma.bedTransfer.update as jest.Mock).mockResolvedValue({
        ...mockTransfer,
        status: 'COMPLETED'
      })

      const result = await service.executeTransfer('transfer-1', mockContext)

      expect(result).toBeDefined()
      expect(result.status).toBe('COMPLETED')
      expect(prisma.bed.update).toHaveBeenCalledTimes(2)
      expect(prisma.bedTransfer.update).toHaveBeenCalled()
      expect(BedAuditService.getInstance().logAction).toHaveBeenCalledWith(
        'TRANSFER_COMPLETED',
        expect.any(Object),
        mockContext
      )
    })
  })
})


