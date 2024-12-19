import { Organization, OrganizationSettings, OrganizationStatus } from '../types/organization.types'
import { OrganizationRepository } from '../repositories/organizationRepository'
import { slugify } from '@/lib/utils'

export class OrganizationService {
  private repository: OrganizationRepository

  constructor() {
    this.repository = new OrganizationRepository()
  }

  async getOrganization(identifier: string): Promise<Organization | null> {
    // Try to find by ID first
    const orgById = await this.repository.findById(identifier)
    if (orgById) return orgById

    // If not found by ID, try by slug
    return this.repository.findBySlug(identifier)
  }

  async createOrganization(data: {
    name: string
    settings: OrganizationSettings
    contactDetails: Organization['contactDetails']
  }): Promise<Organization> {
    const slug = slugify(data.name)
    
    // Check if organization with same slug exists
    const existing = await this.repository.findBySlug(slug)
    if (existing) {
      throw new Error('Organization with similar name already exists')
    }

    return this.repository.create({
      name: data.name,
      slug,
      settings: data.settings,
      status: OrganizationStatus.ACTIVE,
      contactDetails: data.contactDetails,
    })
  }

  async updateOrganization(
    id: string,
    data: Partial<Organization>
  ): Promise<Organization> {
    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new Error('Organization not found')
    }

    // If name is being updated, update slug as well
    if (data.name) {
      const newSlug = slugify(data.name)
      const slugExists = await this.repository.findBySlug(newSlug)
      if (slugExists && slugExists.id !== id) {
        throw new Error('Organization with similar name already exists')
      }
      data.slug = newSlug
    }

    return this.repository.update(id, data)
  }

  async deleteOrganization(id: string): Promise<void> {
    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new Error('Organization not found')
    }

    if (existing.careHomes.length > 0) {
      throw new Error('Cannot delete organization with active care homes')
    }

    await this.repository.delete(id)
  }

  async listOrganizations(params?: {
    page?: number
    limit?: number
    status?: OrganizationStatus
  }): Promise<{
    organizations: Organization[]
    total: number
    page: number
    totalPages: number
  }> {
    const page = params?.page || 1
    const limit = params?.limit || 10
    const skip = (page - 1) * limit

    const [organizations, total] = await Promise.all([
      this.repository.findAll({
        skip,
        take: limit,
        status: params?.status,
      }),
      this.repository.count({
        status: params?.status,
      }),
    ])

    return {
      organizations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async addCareHome(organizationId: string, careHomeId: string): Promise<Organization> {
    const organization = await this.repository.findById(organizationId)
    if (!organization) {
      throw new Error('Organization not found')
    }

    return this.repository.addCareHome(organizationId, careHomeId)
  }

  async removeCareHome(organizationId: string, careHomeId: string): Promise<Organization> {
    const organization = await this.repository.findById(organizationId)
    if (!organization) {
      throw new Error('Organization not found')
    }

    const careHome = organization.careHomes.find(ch => ch.id === careHomeId)
    if (!careHome) {
      throw new Error('Care home not found in organization')
    }

    return this.repository.removeCareHome(organizationId, careHomeId)
  }

  async updateSettings(id: string, settings: OrganizationSettings): Promise<Organization> {
    const organization = await this.repository.findById(id)
    if (!organization) {
      throw new Error('Organization not found')
    }

    return this.repository.updateSettings(id, settings)
  }
}


