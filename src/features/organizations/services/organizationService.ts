/**
 * WriteCareNotes.com
 * @fileoverview Organization Management Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import type { 
  Organization, 
  OrganizationSettings, 
  OrganizationStatus,
  OrganizationType,
  Region,
  RegulatoryBody,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationQueryParams,
  OrganizationStats,
  ComplianceFramework
} from '../types/organization.types';
import { OrganizationRepository } from '../repositories/organizationRepository';
import { slugify } from '@/lib/utils';
import { ApiError } from '@/lib/errors';
import { auditService } from '@/lib/audit';
import { offlineSync } from '@/lib/offline';
import { validateRegionalCompliance } from '@/lib/compliance';
import { TenantContext } from '@/lib/tenant';
import { DatabaseError } from '@/lib/errors';

export class OrganizationService {
  private static instance: OrganizationService;
  private repository: OrganizationRepository;

  private constructor() {
    this.repository = new OrganizationRepository();
  }

  public static getInstance(): OrganizationService {
    if (!OrganizationService.instance) {
      OrganizationService.instance = new OrganizationService();
    }
    return OrganizationService.instance;
  }

  /**
   * Get organization by ID or slug with tenant context
   */
  async getOrganization(identifier: string, context: TenantContext): Promise<Organization | null> {
    try {
      // Try to find by ID first
      const orgById = await this.repository.findById(identifier, context);
      if (orgById) return orgById;

      // If not found by ID, try by slug
      return this.repository.findBySlug(identifier, context);
    } catch (error) {
      throw ApiError.internal('Failed to fetch organization');
    }
  }

  /**
   * Create a new organization with compliance validation
   */
  async createOrganization(
    data: CreateOrganizationInput,
    context: TenantContext
  ): Promise<Organization> {
    try {
      const slug = slugify(data.name);
      
      // Check if organization with same slug exists in tenant
      const existing = await this.repository.findBySlug(slug, context);
      if (existing) {
        throw ApiError.conflict('Organization with similar name already exists');
      }

      // Validate regional compliance
      const complianceValidation = await validateRegionalCompliance({
        type: data.type,
        region: data.region,
        regulatoryBody: data.regulatoryBody,
        settings: data.settings
      });

      if (!complianceValidation.valid) {
        throw ApiError.badRequest(`Compliance validation failed: ${complianceValidation.errors.join(', ')}`);
      }

      // Create organization
      const organization = await this.repository.create({
        tenantId: context.tenantId,
        name: data.name,
        slug,
        type: data.type,
        region: data.region,
        regulatoryBody: data.regulatoryBody,
        settings: data.settings,
        status: OrganizationStatus.PENDING,
        contactDetails: data.contactDetails,
        complianceFrameworks: complianceValidation.frameworks,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: context.userId,
          updatedBy: context.userId,
          version: 1
        }
      });

      // Record audit with tenant context
      await auditService.log({
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'ORGANIZATION_CREATED',
        details: {
          organizationId: organization.id,
          organizationName: organization.name,
          type: organization.type,
          region: organization.region,
        },
      });

      // Trigger offline sync
      await offlineSync.queueSync({
        type: 'ORGANIZATION',
        action: 'CREATE',
        data: organization,
        context
      });

      return organization;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal('Failed to create organization');
    }
  }

  /**
   * Update organization with compliance validation
   */
  async updateOrganization(
    id: string,
    data: UpdateOrganizationInput,
    context: TenantContext
  ): Promise<Organization> {
    try {
      const existing = await this.repository.findById(id, context);
      if (!existing) {
        throw ApiError.notFound('Organization not found');
      }

      // If name is being updated, update slug as well
      let slug = existing.slug;
      if (data.name) {
        slug = slugify(data.name);
        const slugExists = await this.repository.findBySlug(slug, context);
        if (slugExists && slugExists.id !== id) {
          throw ApiError.conflict('Organization with similar name already exists');
        }
      }

      // Validate regional compliance if relevant fields are being updated
      if (data.region || data.regulatoryBody || data.type || data.settings) {
        const complianceValidation = await validateRegionalCompliance({
          type: data.type || existing.type,
          region: data.region || existing.region,
          regulatoryBody: data.regulatoryBody || existing.regulatoryBody,
          settings: { ...existing.settings, ...data.settings }
        });

        if (!complianceValidation.valid) {
          throw ApiError.badRequest(`Compliance validation failed: ${complianceValidation.errors.join(', ')}`);
        }

        data.complianceFrameworks = complianceValidation.frameworks;
      }

      // Update organization
      const organization = await this.repository.update(id, {
        ...data,
        slug,
        metadata: {
          ...existing.metadata,
          updatedAt: new Date(),
          updatedBy: context.userId,
          version: existing.metadata.version + 1
        }
      }, context);

      // Record audit
      await auditService.log({
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'ORGANIZATION_UPDATED',
        details: {
          organizationId: organization.id,
          updates: data,
        },
      });

      // Trigger offline sync
      await offlineSync.queueSync({
        type: 'ORGANIZATION',
        action: 'UPDATE',
        data: organization,
        context
      });

      return organization;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal('Failed to update organization');
    }
  }

  /**
   * Delete organization with cascade checks
   */
  async deleteOrganization(id: string, context: TenantContext): Promise<void> {
    try {
      const organization = await this.repository.findById(id, context);
      if (!organization) {
        throw ApiError.notFound('Organization not found');
      }

      // Check for active care homes
      if (organization.careHomes.length > 0) {
        throw ApiError.conflict('Cannot delete organization with active care homes');
      }

      // Check for active subscriptions
      if (organization.subscription?.status === 'ACTIVE') {
        throw ApiError.conflict('Cannot delete organization with active subscription');
      }

      // Delete organization
      await this.repository.delete(id, context);

      // Record audit
      await auditService.log({
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'ORGANIZATION_DELETED',
        details: {
          organizationId: id,
          organizationName: organization.name,
        },
      });

      // Trigger offline sync
      await offlineSync.queueSync({
        type: 'ORGANIZATION',
        action: 'DELETE',
        data: { id },
        context
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal('Failed to delete organization');
    }
  }

  /**
   * List organizations with advanced filtering and tenant context
   */
  async listOrganizations(
    params: OrganizationQueryParams,
    context: TenantContext
  ): Promise<{
    organizations: Organization[]
    total: number
    page: number
    totalPages: number
  }> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;
      const skip = (page - 1) * limit;

      const [organizations, total] = await Promise.all([
        this.repository.findAll({
          ...params,
          skip,
          take: limit,
          tenantId: context.tenantId
        }),
        this.repository.count({
          ...params,
          tenantId: context.tenantId
        }),
      ]);

      return {
        organizations,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw ApiError.internal('Failed to fetch organizations');
    }
  }

  /**
   * Get comprehensive organization statistics
   */
  async getOrganizationStats(id: string, context: TenantContext): Promise<OrganizationStats> {
    try {
      const organization = await this.repository.findById(id, context);
      if (!organization) {
        throw ApiError.notFound('Organization not found');
      }

      const stats = await this.repository.getStats(id, context);
      return stats;
    } catch (error) {
      throw ApiError.internal('Failed to fetch organization statistics');
    }
  }

  /**
   * Manage compliance frameworks
   */
  async updateComplianceFrameworks(
    id: string, 
    frameworks: ComplianceFramework[],
    context: TenantContext
  ): Promise<Organization> {
    try {
      const organization = await this.repository.findById(id, context);
      if (!organization) {
        throw ApiError.notFound('Organization not found');
      }

      // Validate frameworks against regional requirements
      const validation = await validateRegionalCompliance({
        type: organization.type,
        region: organization.region,
        regulatoryBody: organization.regulatoryBody,
        frameworks
      });

      if (!validation.valid) {
        throw ApiError.badRequest(`Compliance validation failed: ${validation.errors.join(', ')}`);
      }

      // Update frameworks
      const result = await this.repository.updateComplianceFrameworks(id, frameworks, context);

      // Record audit
      await auditService.log({
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'COMPLIANCE_FRAMEWORKS_UPDATED',
        details: {
          organizationId: id,
          frameworks: frameworks.map(f => f.id),
        },
      });

      return result;
    } catch (error) {
      throw ApiError.internal('Failed to update compliance frameworks');
    }
  }

  /**
   * Manage care homes with compliance checks
   */
  async addCareHome(
    organizationId: string, 
    careHomeId: string, 
    context: TenantContext
  ): Promise<Organization> {
    try {
      const organization = await this.repository.findById(organizationId, context);
      if (!organization) {
        throw ApiError.notFound('Organization not found');
      }

      // Check organization limits based on subscription
      const currentCareHomes = organization.careHomes.length;
      const maxCareHomes = organization.subscription.features.includes('UNLIMITED_CARE_HOMES') 
        ? Infinity 
        : 10; // Default limit

      if (currentCareHomes >= maxCareHomes) {
        throw ApiError.forbidden('Care home limit reached for current subscription plan');
      }

      const result = await this.repository.addCareHome(organizationId, careHomeId, context);

      // Record audit
      await auditService.log({
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'CARE_HOME_ADDED',
        details: {
          organizationId,
          careHomeId,
        },
      });

      // Trigger offline sync
      await offlineSync.queueSync({
        type: 'ORGANIZATION',
        action: 'ADD_CARE_HOME',
        data: { organizationId, careHomeId },
        context
      });

      return result;
    } catch (error) {
      throw ApiError.internal('Failed to add care home');
    }
  }

  async removeCareHome(
    organizationId: string, 
    careHomeId: string, 
    context: TenantContext
  ): Promise<Organization> {
    try {
      const organization = await this.repository.findById(organizationId, context);
      if (!organization) {
        throw ApiError.notFound('Organization not found');
      }

      const careHome = organization.careHomes.find(ch => ch.id === careHomeId);
      if (!careHome) {
        throw ApiError.notFound('Care home not found in organization');
      }

      const result = await this.repository.removeCareHome(organizationId, careHomeId, context);

      // Record audit
      await auditService.log({
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'CARE_HOME_REMOVED',
        details: {
          organizationId,
          careHomeId,
        },
      });

      // Trigger offline sync
      await offlineSync.queueSync({
        type: 'ORGANIZATION',
        action: 'REMOVE_CARE_HOME',
        data: { organizationId, careHomeId },
        context
      });

      return result;
    } catch (error) {
      throw ApiError.internal('Failed to remove care home');
    }
  }

  /**
   * Update organization settings with validation
   */
  async updateSettings(
    id: string, 
    settings: OrganizationSettings, 
    context: TenantContext
  ): Promise<Organization> {
    try {
      const organization = await this.repository.findById(id, context);
      if (!organization) {
        throw ApiError.notFound('Organization not found');
      }

      // Validate settings against regional requirements
      const validation = await validateRegionalCompliance({
        type: organization.type,
        region: organization.region,
        regulatoryBody: organization.regulatoryBody,
        settings
      });

      if (!validation.valid) {
        throw ApiError.badRequest(`Settings validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await this.repository.updateSettings(id, settings, context);

      // Record audit
      await auditService.log({
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'SETTINGS_UPDATED',
        details: {
          organizationId: id,
          settings,
        },
      });

      // Trigger offline sync
      await offlineSync.queueSync({
        type: 'ORGANIZATION',
        action: 'UPDATE_SETTINGS',
        data: { id, settings },
        context
      });

      return result;
    } catch (error) {
      throw ApiError.internal('Failed to update settings');
    }
  }

  async validateCompliance(organizationId: string, context: TenantContext): Promise<void> {
    const organization = await this.getOrganization(organizationId, context);
    if (!organization) {
      throw new DatabaseError('Organization not found');
    }
    
    // Add compliance validation logic here
  }
}

export const organizationService = OrganizationService.getInstance();


