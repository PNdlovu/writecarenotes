import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { OrganizationOfflineService } from '../services/offlineService'
import { OrganizationOfflineStore } from '../lib/offline/organizationOfflineStore'
import { OrganizationService } from '../services/organizationService'
import { Organization } from '../types/organization.types'

// Mock dependencies
jest.mock('../lib/offline/organizationOfflineStore')
jest.mock('../services/organizationService')

describe('OrganizationOfflineService', () => {
  let service: OrganizationOfflineService
  let mockStore: jest.Mocked<OrganizationOfflineStore>
  let mockOnlineService: jest.Mocked<OrganizationService>

  const mockOrganization: Organization = {
    id: 'test-org',
    name: 'Test Organization',
    // ... other required fields
  } as Organization

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup mock store
    mockStore = {
      initialize: jest.fn(),
      getOrganization: jest.fn(),
      saveOrganization: jest.fn(),
      updateOrganization: jest.fn(),
      getPendingSyncs: jest.fn(),
      getInstance: jest.fn()
    } as unknown as jest.Mocked<OrganizationOfflineStore>

    // Setup mock online service
    mockOnlineService = {
      getOrganization: jest.fn(),
      updateOrganization: jest.fn(),
      getInstance: jest.fn()
    } as unknown as jest.Mocked<OrganizationService>

    OrganizationOfflineStore.getInstance = jest.fn().mockReturnValue(mockStore)
    OrganizationService.getInstance = jest.fn().mockReturnValue(mockOnlineService)

    // Get service instance
    service = OrganizationOfflineService.getInstance()
  })

  describe('getOrganization', () => {
    beforeEach(() => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: true
      })
    })

    it('should fetch from online service when online', async () => {
      mockOnlineService.getOrganization.mockResolvedValue(mockOrganization)

      const result = await service.getOrganization('test-org')

      expect(result).toEqual(mockOrganization)
      expect(mockOnlineService.getOrganization).toHaveBeenCalled()
      expect(mockStore.saveOrganization).toHaveBeenCalledWith(mockOrganization)
    })

    it('should fetch from offline store when offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: false
      })

      mockStore.getOrganization.mockResolvedValue(mockOrganization)

      const result = await service.getOrganization('test-org')

      expect(result).toEqual(mockOrganization)
      expect(mockStore.getOrganization).toHaveBeenCalled()
      expect(mockOnlineService.getOrganization).not.toHaveBeenCalled()
    })

    it('should fallback to offline store when online fetch fails', async () => {
      mockOnlineService.getOrganization.mockRejectedValue(new Error('Network error'))
      mockStore.getOrganization.mockResolvedValue(mockOrganization)

      const result = await service.getOrganization('test-org')

      expect(result).toEqual(mockOrganization)
      expect(mockOnlineService.getOrganization).toHaveBeenCalled()
      expect(mockStore.getOrganization).toHaveBeenCalled()
    })
  })

  describe('syncWithServer', () => {
    it('should sync pending changes when online', async () => {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: true
      })

      mockStore.getPendingSyncs.mockResolvedValue([
        { id: 'test-org', operation: 'update' }
      ])
      mockStore.getOrganization.mockResolvedValue(mockOrganization)
      mockOnlineService.updateOrganization.mockResolvedValue(undefined)

      await service.syncWithServer()

      expect(mockStore.getPendingSyncs).toHaveBeenCalled()
      expect(mockOnlineService.updateOrganization).toHaveBeenCalled()
    })

    it('should not sync when offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: false
      })

      await service.syncWithServer()

      expect(mockStore.getPendingSyncs).not.toHaveBeenCalled()
      expect(mockOnlineService.updateOrganization).not.toHaveBeenCalled()
    })
  })

  describe('resolveConflict', () => {
    it('should resolve to local version', async () => {
      mockStore.getOrganization.mockResolvedValue(mockOrganization)
      mockOnlineService.getOrganization.mockResolvedValue({
        ...mockOrganization,
        name: 'Different Name'
      })

      await service.resolveConflict('test-org', 'local')

      expect(mockOnlineService.updateOrganization).toHaveBeenCalledWith(
        mockOrganization,
        expect.any(Object)
      )
    })

    it('should resolve to remote version', async () => {
      const remoteOrg = { ...mockOrganization, name: 'Remote Name' }
      mockStore.getOrganization.mockResolvedValue(mockOrganization)
      mockOnlineService.getOrganization.mockResolvedValue(remoteOrg)

      await service.resolveConflict('test-org', 'remote')

      expect(mockStore.updateOrganization).toHaveBeenCalledWith(remoteOrg)
    })
  })
})


