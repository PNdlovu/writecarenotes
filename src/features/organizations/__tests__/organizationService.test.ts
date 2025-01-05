import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { OrganizationService } from '../services/organizationService'
import { OrganizationRepository } from '../database/repositories/organizationRepository'
import { Organization, OrganizationType, OrganizationStatus } from '../types/organization.types'
import { OrganizationError, OrganizationErrorCode } from '../types/errors'

// Mock the repository
jest.mock('../database/repositories/organizationRepository')

describe('OrganizationService', () => {
  let service: OrganizationService
  let mockRepository: jest.Mocked<OrganizationRepository>

  const mockContext = {
    userId: 'test-user',
    tenantId: 'test-tenant',
    region: 'en-GB',
    language: 'en'
  }

  const mockOrganization: Organization = {
    id: 'test-org',
    tenantId: 'test-tenant',
    name: 'Test Organization',
    type: 'CARE_HOME_GROUP' as OrganizationType,
    status: 'ACTIVE' as OrganizationStatus,
    settings: {
      security: {
        mfa: true,
        passwordPolicy: {
          minLength: 8,
          requireSpecialChars: true,
          requireNumbers: true,
          expiryDays: 90
        },
        ipWhitelist: [],
        sessionTimeout: 30
      },
      regional: {
        primaryRegion: 'en-GB',
        supportedRegions: ['en-GB'],
        primaryLanguage: 'en',
        supportedLanguages: ['en'],
        timezone: 'Europe/London',
        dateFormat: 'DD/MM/YYYY',
        currencyCode: 'GBP'
      },
      branding: {
        colors: {
          primary: '#000000',
          secondary: '#ffffff'
        }
      }
    },
    contactDetails: {
      email: 'test@example.com',
      phone: '1234567890',
      address: {
        line1: '123 Test St',
        city: 'Test City',
        county: 'Test County',
        postcode: 'TE1 1ST',
        country: 'United Kingdom'
      }
    },
    compliance: {
      gdprContact: 'gdpr@example.com',
      dataProtectionOfficer: 'dpo@example.com',
      regulatoryBody: 'CQC',
      licenses: []
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'test-user',
      updatedBy: 'test-user',
      version: 1
    }
  }

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Setup mock repository
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getInstance: jest.fn()
    } as unknown as jest.Mocked<OrganizationRepository>

    OrganizationRepository.getInstance = jest.fn().mockReturnValue(mockRepository)
    service = OrganizationService.getInstance()
  })

  describe('getOrganization', () => {
    it('should return organization when found', async () => {
      mockRepository.findById.mockResolvedValue(mockOrganization)

      const result = await service.getOrganization('test-org', mockContext)
      
      expect(result).toEqual(mockOrganization)
      expect(mockRepository.findById).toHaveBeenCalledWith('test-org', {
        userId: mockContext.userId,
        tenantId: mockContext.tenantId
      })
    })

    it('should throw NOT_FOUND when organization does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(
        service.getOrganization('non-existent', mockContext)
      ).rejects.toThrow(
        new OrganizationError(
          'Organization not found: non-existent',
          OrganizationErrorCode.NOT_FOUND
        )
      )
    })
  })

  describe('updateOrganization', () => {
    it('should update organization successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockOrganization)
      mockRepository.update.mockResolvedValue(mockOrganization)

      const updateData = {
        ...mockOrganization,
        name: 'Updated Name'
      }

      await service.updateOrganization(updateData, mockContext)

      expect(mockRepository.update).toHaveBeenCalledWith(
        updateData,
        {
          userId: mockContext.userId,
          tenantId: mockContext.tenantId
        }
      )
    })

    it('should throw error when updating non-existent organization', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(
        service.updateOrganization(mockOrganization, mockContext)
      ).rejects.toThrow(
        new OrganizationError(
          'Organization not found: test-org',
          OrganizationErrorCode.NOT_FOUND
        )
      )
    })
  })
})


