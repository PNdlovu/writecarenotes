import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OrganizationAnalyticsRepository } from '../../repositories/analyticsRepository'
import { prisma } from '@/lib/prisma'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    careHome: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    resident: {
      count: vi.fn(),
    },
    staff: {
      count: vi.fn(),
    },
    compliance: {
      findMany: vi.fn(),
    },
    organizationMetricsSnapshot: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('OrganizationAnalyticsRepository', () => {
  let repository: OrganizationAnalyticsRepository

  beforeEach(() => {
    repository = new OrganizationAnalyticsRepository()
    vi.clearAllMocks()
  })

  describe('getOrganizationMetrics', () => {
    it('should return organization metrics', async () => {
      // Mock data
      vi.mocked(prisma.careHome.count).mockResolvedValue(5)
      vi.mocked(prisma.resident.count).mockResolvedValue(100)
      vi.mocked(prisma.staff.count).mockResolvedValue(50)
      vi.mocked(prisma.careHome.findMany).mockResolvedValue([
        { currentOccupancy: 80, capacity: 100 },
        { currentOccupancy: 90, capacity: 100 },
      ])
      vi.mocked(prisma.compliance.findMany).mockResolvedValue([
        { score: 90 },
        { score: 80 },
      ])

      const result = await repository.getOrganizationMetrics('org-1')

      expect(result).toEqual({
        totalCareHomes: 5,
        totalResidents: 100,
        totalStaff: 50,
        averageOccupancy: 85,
        complianceScore: 85,
      })
    })
  })

  describe('getCareHomeMetrics', () => {
    it('should return metrics for all care homes', async () => {
      const mockCareHomes = [
        {
          id: 'ch-1',
          name: 'Care Home 1',
          currentOccupancy: 80,
          capacity: 100,
          _count: {
            residents: 80,
            staff: 40,
          },
          compliance: {
            score: 90,
          },
        },
      ]

      vi.mocked(prisma.careHome.findMany).mockResolvedValue(mockCareHomes)

      const result = await repository.getCareHomeMetrics('org-1')

      expect(result).toEqual([
        {
          careHomeId: 'ch-1',
          careHomeName: 'Care Home 1',
          metrics: {
            residents: 80,
            staff: 40,
            occupancy: 80,
            compliance: 90,
          },
        },
      ])
    })
  })

  describe('getHistoricalMetrics', () => {
    it('should return historical metrics within date range', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')
      const mockMetrics = [
        {
          date: new Date('2024-01-15'),
          metrics: {
            totalCareHomes: 5,
            totalResidents: 100,
            averageOccupancy: 85,
            complianceScore: 90,
          },
        },
      ]

      vi.mocked(prisma.organizationMetricsSnapshot.findMany).mockResolvedValue(
        mockMetrics
      )

      const result = await repository.getHistoricalMetrics(
        'org-1',
        startDate,
        endDate
      )

      expect(result).toEqual(mockMetrics)
      expect(prisma.organizationMetricsSnapshot.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-1',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
      })
    })
  })

  describe('saveMetricsSnapshot', () => {
    it('should save metrics snapshot', async () => {
      const metrics = {
        totalCareHomes: 5,
        totalResidents: 100,
        totalStaff: 50,
        averageOccupancy: 85,
        complianceScore: 90,
      }

      await repository.saveMetricsSnapshot('org-1', metrics)

      expect(prisma.organizationMetricsSnapshot.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-1',
          date: expect.any(Date),
          metrics: metrics,
        },
      })
    })
  })

  describe('getComplianceBreakdown', () => {
    it('should return compliance breakdown', async () => {
      const mockComplianceRecords = [
        {
          categories: [
            { name: 'Safety', score: 90 },
            { name: 'Care', score: 85 },
          ],
          risks: [
            { name: 'Fire Safety', count: 2 },
            { name: 'Medication', count: 1 },
          ],
          history: [
            { date: new Date(), score: 90 },
            { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), score: 85 },
          ],
        },
      ]

      vi.mocked(prisma.compliance.findMany).mockResolvedValue(mockComplianceRecords)

      const result = await repository.getComplianceBreakdown('org-1')

      expect(result).toHaveProperty('categoryScores')
      expect(result).toHaveProperty('riskAreas')
      expect(result).toHaveProperty('trendsLastMonth')
      expect(result.trendsLastMonth).toHaveProperty('improvement')
      expect(result.trendsLastMonth).toHaveProperty('decline')
      expect(result.trendsLastMonth).toHaveProperty('unchanged')
    })
  })
})


