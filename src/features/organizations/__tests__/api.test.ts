/**
 * @fileoverview Organization API endpoint tests
 * @version 1.0.0
 * @created 2024-03-21
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';
import { organizationService } from '../services/organizationService';
import { validateRequest } from '@/lib/validation';
import { getTenantContext } from '@/lib/tenant';

// Mock dependencies
jest.mock('../services/organizationService');
jest.mock('@/lib/validation');
jest.mock('@/lib/tenant');

describe('Organization API', () => {
  const mockContext = {
    tenantId: 'test-tenant',
    userId: 'test-user',
    region: 'en-GB',
    language: 'en'
  };

  const mockOrganization = {
    id: 'test-org',
    name: 'Test Organization',
    type: 'SINGLE_SITE',
    status: 'ACTIVE',
    settings: {
      security: {
        mfa: true,
        passwordPolicy: {
          minLength: 8,
          requireSpecialChars: true,
          requireNumbers: true,
          expiryDays: 90
        }
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getTenantContext as jest.Mock).mockResolvedValue(mockContext);
  });

  describe('GET /api/organizations', () => {
    it('should return a list of organizations', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          page: '1',
          limit: '10'
        }
      });

      (organizationService.listOrganizations as jest.Mock).mockResolvedValue({
        organizations: [mockOrganization],
        total: 1,
        page: 1,
        totalPages: 1
      });

      const response = await handleGetOrganizations(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.organizations).toHaveLength(1);
      expect(data.organizations[0]).toEqual(mockOrganization);
      expect(organizationService.listOrganizations).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10
        }),
        mockContext
      );
    });

    it('should handle filtering and sorting', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          status: 'ACTIVE',
          region: 'en-GB',
          type: 'SINGLE_SITE',
          search: 'test',
          sortBy: 'name',
          sortOrder: 'asc'
        }
      });

      await handleGetOrganizations(req as unknown as NextRequest);

      expect(organizationService.listOrganizations).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ACTIVE',
          region: 'en-GB',
          type: 'SINGLE_SITE',
          search: 'test',
          sortBy: 'name',
          sortOrder: 'asc'
        }),
        mockContext
      );
    });

    it('should handle errors gracefully', async () => {
      const { req, res } = createMocks({ method: 'GET' });

      (organizationService.listOrganizations as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await handleGetOrganizations(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch organizations');
    });
  });

  describe('POST /api/organizations', () => {
    const createOrgData = {
      name: 'New Organization',
      type: 'SINGLE_SITE',
      settings: {
        security: { mfa: true }
      }
    };

    it('should create a new organization', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: createOrgData
      });

      (validateRequest as jest.Mock).mockResolvedValue(true);
      (organizationService.createOrganization as jest.Mock).mockResolvedValue({
        ...mockOrganization,
        ...createOrgData
      });

      const response = await handleCreateOrganization(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe(createOrgData.name);
      expect(organizationService.createOrganization).toHaveBeenCalledWith(
        createOrgData,
        mockContext
      );
    });

    it('should validate request data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: createOrgData
      });

      await handleCreateOrganization(req as unknown as NextRequest);

      expect(validateRequest).toHaveBeenCalledWith(createOrgData);
    });

    it('should handle validation errors', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {}
      });

      (validateRequest as jest.Mock).mockRejectedValue(
        new Error('Name is required')
      );

      const response = await handleCreateOrganization(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name is required');
    });
  });

  describe('GET /api/organizations/[id]', () => {
    it('should return a single organization', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'test-org' }
      });

      (organizationService.getOrganization as jest.Mock).mockResolvedValue(
        mockOrganization
      );

      const response = await handleGetOrganization(req as unknown as NextRequest, {
        params: { id: 'test-org' }
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockOrganization);
      expect(organizationService.getOrganization).toHaveBeenCalledWith(
        'test-org',
        mockContext
      );
    });

    it('should handle not found errors', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'non-existent' }
      });

      (organizationService.getOrganization as jest.Mock).mockResolvedValue(null);

      const response = await handleGetOrganization(req as unknown as NextRequest, {
        params: { id: 'non-existent' }
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Organization not found');
    });
  });

  describe('PATCH /api/organizations/[id]', () => {
    const updateData = {
      name: 'Updated Organization',
      status: 'INACTIVE'
    };

    it('should update an organization', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { id: 'test-org' },
        body: updateData
      });

      (validateRequest as jest.Mock).mockResolvedValue(true);
      (organizationService.updateOrganization as jest.Mock).mockResolvedValue({
        ...mockOrganization,
        ...updateData
      });

      const response = await handleUpdateOrganization(req as unknown as NextRequest, {
        params: { id: 'test-org' }
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe(updateData.name);
      expect(data.status).toBe(updateData.status);
      expect(organizationService.updateOrganization).toHaveBeenCalledWith(
        'test-org',
        updateData,
        mockContext
      );
    });

    it('should validate update data', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { id: 'test-org' },
        body: updateData
      });

      await handleUpdateOrganization(req as unknown as NextRequest, {
        params: { id: 'test-org' }
      });

      expect(validateRequest).toHaveBeenCalledWith(updateData);
    });
  });

  describe('DELETE /api/organizations/[id]', () => {
    it('should delete an organization', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: 'test-org' }
      });

      const response = await handleDeleteOrganization(req as unknown as NextRequest, {
        params: { id: 'test-org' }
      });

      expect(response.status).toBe(204);
      expect(organizationService.deleteOrganization).toHaveBeenCalledWith(
        'test-org',
        mockContext
      );
    });

    it('should handle deletion errors', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: 'test-org' }
      });

      (organizationService.deleteOrganization as jest.Mock).mockRejectedValue(
        new Error('Cannot delete organization with active care homes')
      );

      const response = await handleDeleteOrganization(req as unknown as NextRequest, {
        params: { id: 'test-org' }
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete organization');
    });
  });

  describe('PATCH /api/organizations/[id]/settings', () => {
    const settingsData = {
      security: {
        mfa: false,
        passwordPolicy: {
          minLength: 10
        }
      }
    };

    it('should update organization settings', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { id: 'test-org' },
        body: settingsData
      });

      (validateRequest as jest.Mock).mockResolvedValue(true);
      (organizationService.updateSettings as jest.Mock).mockResolvedValue({
        ...mockOrganization,
        settings: {
          ...mockOrganization.settings,
          ...settingsData
        }
      });

      const response = await handleUpdateSettings(req as unknown as NextRequest, {
        params: { id: 'test-org' }
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.settings.security.mfa).toBe(false);
      expect(data.settings.security.passwordPolicy.minLength).toBe(10);
      expect(organizationService.updateSettings).toHaveBeenCalledWith(
        'test-org',
        settingsData,
        mockContext
      );
    });
  });

  describe('POST /api/organizations/[id]/care-homes', () => {
    it('should add a care home to an organization', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { id: 'test-org' },
        body: { careHomeId: 'test-care-home' }
      });

      (organizationService.addCareHome as jest.Mock).mockResolvedValue({
        ...mockOrganization,
        careHomes: ['test-care-home']
      });

      const response = await handleAddCareHome(req as unknown as NextRequest, {
        params: { id: 'test-org' }
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.careHomes).toContain('test-care-home');
      expect(organizationService.addCareHome).toHaveBeenCalledWith(
        'test-org',
        'test-care-home',
        mockContext
      );
    });

    it('should validate care home ID', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { id: 'test-org' },
        body: {}
      });

      const response = await handleAddCareHome(req as unknown as NextRequest, {
        params: { id: 'test-org' }
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Care home ID is required');
    });
  });

  describe('DELETE /api/organizations/[id]/care-homes/[careHomeId]', () => {
    it('should remove a care home from an organization', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: 'test-org', careHomeId: 'test-care-home' }
      });

      (organizationService.removeCareHome as jest.Mock).mockResolvedValue({
        ...mockOrganization,
        careHomes: []
      });

      const response = await handleRemoveCareHome(req as unknown as NextRequest, {
        params: { id: 'test-org', careHomeId: 'test-care-home' }
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.careHomes).toHaveLength(0);
      expect(organizationService.removeCareHome).toHaveBeenCalledWith(
        'test-org',
        'test-care-home',
        mockContext
      );
    });
  });
}); 