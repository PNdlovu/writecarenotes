/**
 * Tenant Repository
 * Handles all database operations for tenant management
 */
import { prisma } from '@/lib/prisma'
import { Tenant, TenantSettings, TenantStatus } from '../types/tenant.types'
import { OrganizationError, OrganizationErrorCode } from '../types/errors'

interface RepositoryContext {
  userId: string
  tenantId: string
}

export class TenantRepository {
  private static instance: TenantRepository

  private constructor() {}

  static getInstance(): TenantRepository {
    if (!TenantRepository.instance) {
      TenantRepository.instance = new TenantRepository()
    }
    return TenantRepository.instance
  }

  async getTenant(id: string): Promise<Tenant> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id },
        include: {
          settings: true,
          organizations: true,
        },
      })

      if (!tenant) {
        throw new OrganizationError(
          `Tenant not found: ${id}`,
          OrganizationErrorCode.NOT_FOUND
        )
      }

      return tenant
    } catch (error) {
      throw new OrganizationError(
        `Failed to fetch tenant: ${error.message}`,
        OrganizationErrorCode.DATABASE_ERROR
      )
    }
  }

  async createTenant(
    name: string,
    settings: TenantSettings,
    context: RepositoryContext
  ): Promise<Tenant> {
    try {
      return await prisma.tenant.create({
        data: {
          name,
          status: 'ACTIVE' as TenantStatus,
          settings: {
            create: settings,
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: context.userId,
            updatedBy: context.userId,
          },
        },
        include: {
          settings: true,
          organizations: true,
        },
      })
    } catch (error) {
      throw new OrganizationError(
        `Failed to create tenant: ${error.message}`,
        OrganizationErrorCode.DATABASE_ERROR
      )
    }
  }

  async updateTenant(
    id: string,
    updates: Partial<Tenant>,
    context: RepositoryContext
  ): Promise<Tenant> {
    try {
      return await prisma.tenant.update({
        where: { id },
        data: {
          ...updates,
          metadata: {
            updatedAt: new Date(),
            updatedBy: context.userId,
          },
        },
        include: {
          settings: true,
          organizations: true,
        },
      })
    } catch (error) {
      throw new OrganizationError(
        `Failed to update tenant: ${error.message}`,
        OrganizationErrorCode.DATABASE_ERROR
      )
    }
  }

  async updateTenantSettings(
    id: string,
    settings: Partial<TenantSettings>,
    context: RepositoryContext
  ): Promise<TenantSettings> {
    try {
      return await prisma.tenantSettings.update({
        where: { tenantId: id },
        data: {
          ...settings,
          metadata: {
            updatedAt: new Date(),
            updatedBy: context.userId,
          },
        },
      })
    } catch (error) {
      throw new OrganizationError(
        `Failed to update tenant settings: ${error.message}`,
        OrganizationErrorCode.DATABASE_ERROR
      )
    }
  }

  async getTenantOrganizations(id: string): Promise<string[]> {
    try {
      const result = await prisma.tenant.findUnique({
        where: { id },
        select: {
          organizations: {
            select: { id: true },
          },
        },
      })

      return result?.organizations.map(org => org.id) || []
    } catch (error) {
      throw new OrganizationError(
        `Failed to fetch tenant organizations: ${error.message}`,
        OrganizationErrorCode.DATABASE_ERROR
      )
    }
  }

  async addOrganizationToTenant(
    tenantId: string,
    organizationId: string,
    context: RepositoryContext
  ): Promise<void> {
    try {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          organizations: {
            connect: { id: organizationId },
          },
          metadata: {
            updatedAt: new Date(),
            updatedBy: context.userId,
          },
        },
      })
    } catch (error) {
      throw new OrganizationError(
        `Failed to add organization to tenant: ${error.message}`,
        OrganizationErrorCode.DATABASE_ERROR
      )
    }
  }

  async removeOrganizationFromTenant(
    tenantId: string,
    organizationId: string,
    context: RepositoryContext
  ): Promise<void> {
    try {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          organizations: {
            disconnect: { id: organizationId },
          },
          metadata: {
            updatedAt: new Date(),
            updatedBy: context.userId,
          },
        },
      })
    } catch (error) {
      throw new OrganizationError(
        `Failed to remove organization from tenant: ${error.message}`,
        OrganizationErrorCode.DATABASE_ERROR
      )
    }
  }
}


