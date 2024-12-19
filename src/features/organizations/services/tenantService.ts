/**
 * Tenant Service
 * Handles business logic for tenant management
 */
import { 
  Tenant,
  TenantSettings,
  TenantType,
  TenantStatus 
} from '../types/tenant.types'
import { TenantRepository } from '../repositories/tenantRepository'
import { OrganizationService } from './organizationService'
import { OrganizationError, OrganizationErrorCode } from '../types/errors'

interface ServiceContext {
  userId: string
  tenantId: string
  region: string
  language: string
}

export class TenantService {
  private static instance: TenantService
  private repository: TenantRepository
  private organizationService: OrganizationService

  private constructor() {
    this.repository = TenantRepository.getInstance()
    this.organizationService = OrganizationService.getInstance()
  }

  static getInstance(): TenantService {
    if (!TenantService.instance) {
      TenantService.instance = new TenantService()
    }
    return TenantService.instance
  }

  async getTenant(id: string): Promise<Tenant> {
    return this.repository.getTenant(id)
  }

  async createTenant(
    name: string,
    type: TenantType,
    settings: TenantSettings,
    context: ServiceContext
  ): Promise<Tenant> {
    // Validate tenant data
    this.validateTenantData(name, type, settings)

    // Create tenant with default settings
    const tenant = await this.repository.createTenant(
      name,
      this.getDefaultSettings(settings),
      {
        userId: context.userId,
        tenantId: context.tenantId,
      }
    )

    return tenant
  }

  async updateTenant(
    id: string,
    updates: Partial<Tenant>,
    context: ServiceContext
  ): Promise<Tenant> {
    // Validate updates
    if (updates.name) {
      this.validateTenantName(updates.name)
    }

    return this.repository.updateTenant(
      id,
      updates,
      {
        userId: context.userId,
        tenantId: context.tenantId,
      }
    )
  }

  async updateTenantSettings(
    id: string,
    settings: Partial<TenantSettings>,
    context: ServiceContext
  ): Promise<TenantSettings> {
    // Validate settings
    this.validateTenantSettings(settings)

    return this.repository.updateTenantSettings(
      id,
      settings,
      {
        userId: context.userId,
        tenantId: context.tenantId,
      }
    )
  }

  async changeTenantStatus(
    id: string,
    status: TenantStatus,
    context: ServiceContext
  ): Promise<void> {
    const tenant = await this.getTenant(id)

    // Handle status-specific logic
    switch (status) {
      case 'SUSPENDED':
        await this.handleTenantSuspension(tenant, context)
        break
      case 'DELETED':
        await this.handleTenantDeletion(tenant, context)
        break
      case 'ACTIVE':
        await this.handleTenantActivation(tenant, context)
        break
    }

    await this.repository.updateTenant(
      id,
      { status },
      {
        userId: context.userId,
        tenantId: context.tenantId,
      }
    )
  }

  async addOrganizationToTenant(
    tenantId: string,
    organizationId: string,
    context: ServiceContext
  ): Promise<void> {
    // Verify organization exists
    const organization = await this.organizationService.getOrganization(
      organizationId,
      context
    )

    if (!organization) {
      throw new OrganizationError(
        'Organization not found',
        OrganizationErrorCode.NOT_FOUND
      )
    }

    await this.repository.addOrganizationToTenant(
      tenantId,
      organizationId,
      {
        userId: context.userId,
        tenantId: context.tenantId,
      }
    )
  }

  async removeOrganizationFromTenant(
    tenantId: string,
    organizationId: string,
    context: ServiceContext
  ): Promise<void> {
    const tenant = await this.getTenant(tenantId)
    
    // Prevent removing the last organization
    const organizations = await this.repository.getTenantOrganizations(tenantId)
    if (organizations.length === 1) {
      throw new OrganizationError(
        'Cannot remove the last organization from a tenant',
        OrganizationErrorCode.VALIDATION_ERROR
      )
    }

    await this.repository.removeOrganizationFromTenant(
      tenantId,
      organizationId,
      {
        userId: context.userId,
        tenantId: context.tenantId,
      }
    )
  }

  private validateTenantData(
    name: string,
    type: TenantType,
    settings: TenantSettings
  ): void {
    this.validateTenantName(name)
    this.validateTenantType(type)
    this.validateTenantSettings(settings)
  }

  private validateTenantName(name: string): void {
    if (!name || name.length < 3) {
      throw new OrganizationError(
        'Tenant name must be at least 3 characters long',
        OrganizationErrorCode.VALIDATION_ERROR
      )
    }
  }

  private validateTenantType(type: TenantType): void {
    const validTypes: TenantType[] = ['ENTERPRISE', 'HEALTHCARE', 'GOVERNMENT', 'EDUCATION']
    if (!validTypes.includes(type)) {
      throw new OrganizationError(
        'Invalid tenant type',
        OrganizationErrorCode.VALIDATION_ERROR
      )
    }
  }

  private validateTenantSettings(settings: Partial<TenantSettings>): void {
    // Add validation logic for settings
    // This would be extensive validation based on business rules
  }

  private getDefaultSettings(overrides: Partial<TenantSettings>): TenantSettings {
    const defaults: TenantSettings = {
      security: {
        mfa: {
          required: true,
          methods: ['APP', 'SMS'],
        },
        passwordPolicy: {
          minLength: 12,
          requireSpecialChars: true,
          requireNumbers: true,
          requireUppercase: true,
          expiryDays: 90,
          preventReuse: 5,
        },
        ipRestrictions: {
          enabled: false,
          allowedIPs: [],
          allowedRanges: [],
        },
        sessionPolicy: {
          maxConcurrentSessions: 5,
          sessionTimeout: 60,
          requireDeviceApproval: false,
        },
      },
      compliance: {
        dataRetention: {
          enabled: true,
          retentionPeriod: 365,
          archiveEnabled: true,
          archivePeriod: 730,
        },
        audit: {
          enabled: true,
          detailedLogging: true,
          retentionPeriod: 365,
        },
        gdpr: {
          enabled: true,
          dpoEmail: '',
          dataProcessingAgreement: '',
          thirdPartyProcessors: [],
        },
      },
      branding: {
        enabled: false,
        colors: {
          primary: '#007AFF',
          secondary: '#5856D6',
          accent: '#FF2D55',
        },
        emailTemplates: {
          enabled: false,
        },
      },
      notifications: {
        email: {
          enabled: true,
          providers: ['DEFAULT'],
          defaultFrom: 'noreply@writecarenotes.com',
        },
        sms: {
          enabled: false,
          providers: [],
          defaultFrom: '',
        },
        webhooks: {
          enabled: false,
          endpoints: [],
        },
      },
      integrations: {
        enabled: false,
        active: [],
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: '',
        updatedBy: '',
      },
    }

    return { ...defaults, ...overrides }
  }

  private async handleTenantSuspension(
    tenant: Tenant,
    context: ServiceContext
  ): Promise<void> {
    // Implement suspension logic
    // e.g., disable access, send notifications, etc.
  }

  private async handleTenantDeletion(
    tenant: Tenant,
    context: ServiceContext
  ): Promise<void> {
    // Implement deletion logic
    // e.g., archive data, cleanup resources, etc.
  }

  private async handleTenantActivation(
    tenant: Tenant,
    context: ServiceContext
  ): Promise<void> {
    // Implement activation logic
    // e.g., restore access, send notifications, etc.
  }
}


