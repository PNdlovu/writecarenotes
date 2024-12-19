import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OrganizationRepository } from '../../repositories/organizationRepository'
import { prisma } from '@/lib/prisma'
import { OrganizationStatus } from '../../types/organization.types'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    organization: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}))

describe('OrganizationRepository', () => {
  let repository: OrganizationRepository

  beforeEach(() => {
    repository = new OrganizationRepository()
    vi.clearAllMocks()
  })

  describe('findById', () => {
    it('should find organization by id', async () => {
      const mockOrg = { id: '1', name: 'Test Org' }
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg)

      const result = await repository.findById('1')
      expect(result).toEqual(mockOrg)
      expect(prisma.organization.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { careHomes: true },
      })
    })
  })

  describe('findBySlug', () => {
    it('should find organization by slug', async () => {
      const mockOrg = { id: '1', slug: 'test-org' }
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg)

      const result = await repository.findBySlug('test-org')
      expect(result).toEqual(mockOrg)
      expect(prisma.organization.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-org' },
        include: { careHomes: true },
      })
    })
  })

  describe('create', () => {
    it('should create organization with correct data', async () => {
      const mockData = {
        name: 'Test Org',
        slug: 'test-org',
        settings: { theme: { primaryColor: '#000000' } },
        status: OrganizationStatus.ACTIVE,
        contactDetails: { email: 'test@test.com' },
      }
      const mockOrg = { id: '1', ...mockData }
      vi.mocked(prisma.organization.create).mockResolvedValue(mockOrg)

      const result = await repository.create(mockData)
      expect(result).toEqual(mockOrg)
      expect(prisma.organization.create).toHaveBeenCalledWith({
        data: mockData,
        include: { careHomes: true },
      })
    })
  })

  describe('update', () => {
    it('should update organization with correct data', async () => {
      const mockData = {
        name: 'Updated Org',
        settings: { theme: { primaryColor: '#ffffff' } },
      }
      const mockOrg = { id: '1', ...mockData }
      vi.mocked(prisma.organization.update).mockResolvedValue(mockOrg)

      const result = await repository.update('1', mockData)
      expect(result).toEqual(mockOrg)
      expect(prisma.organization.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: mockData,
        include: { careHomes: true },
      })
    })
  })

  describe('delete', () => {
    it('should delete organization by id', async () => {
      await repository.delete('1')
      expect(prisma.organization.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      })
    })
  })

  describe('findAll', () => {
    it('should find all organizations with pagination', async () => {
      const mockOrgs = [{ id: '1' }, { id: '2' }]
      vi.mocked(prisma.organization.findMany).mockResolvedValue(mockOrgs)

      const result = await repository.findAll({ skip: 0, take: 10 })
      expect(result).toEqual(mockOrgs)
      expect(prisma.organization.findMany).toHaveBeenCalledWith({
        where: { status: undefined },
        skip: 0,
        take: 10,
        include: { careHomes: true },
      })
    })

    it('should filter by status', async () => {
      const mockOrgs = [{ id: '1', status: OrganizationStatus.ACTIVE }]
      vi.mocked(prisma.organization.findMany).mockResolvedValue(mockOrgs)

      const result = await repository.findAll({
        status: OrganizationStatus.ACTIVE,
      })
      expect(result).toEqual(mockOrgs)
      expect(prisma.organization.findMany).toHaveBeenCalledWith({
        where: { status: OrganizationStatus.ACTIVE },
        skip: undefined,
        take: undefined,
        include: { careHomes: true },
      })
    })
  })

  describe('count', () => {
    it('should count organizations', async () => {
      vi.mocked(prisma.organization.count).mockResolvedValue(5)

      const result = await repository.count()
      expect(result).toBe(5)
      expect(prisma.organization.count).toHaveBeenCalledWith({
        where: { status: undefined },
      })
    })

    it('should count organizations with status filter', async () => {
      vi.mocked(prisma.organization.count).mockResolvedValue(3)

      const result = await repository.count({
        status: OrganizationStatus.ACTIVE,
      })
      expect(result).toBe(3)
      expect(prisma.organization.count).toHaveBeenCalledWith({
        where: { status: OrganizationStatus.ACTIVE },
      })
    })
  })
})


