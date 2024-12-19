import { prisma } from '@/lib/prisma'
import { Organization, OrganizationSettings, OrganizationStatus } from '../types/organization.types'
import { Prisma } from '@prisma/client'

export class OrganizationRepository {
  async findById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { id },
      include: {
        careHomes: true,
      },
    })
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { slug },
      include: {
        careHomes: true,
      },
    })
  }

  async create(data: {
    name: string
    slug: string
    settings: OrganizationSettings
    status?: OrganizationStatus
    contactDetails: Organization['contactDetails']
  }): Promise<Organization> {
    return prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        settings: data.settings as Prisma.JsonObject,
        status: data.status || OrganizationStatus.ACTIVE,
        contactDetails: data.contactDetails as Prisma.JsonObject,
      },
      include: {
        careHomes: true,
      },
    })
  }

  async update(id: string, data: Partial<Organization>): Promise<Organization> {
    return prisma.organization.update({
      where: { id },
      data: {
        name: data.name,
        settings: data.settings as Prisma.JsonObject,
        status: data.status,
        contactDetails: data.contactDetails as Prisma.JsonObject,
      },
      include: {
        careHomes: true,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.organization.delete({
      where: { id },
    })
  }

  async findAll(params?: {
    skip?: number
    take?: number
    status?: OrganizationStatus
  }): Promise<Organization[]> {
    return prisma.organization.findMany({
      where: {
        status: params?.status,
      },
      skip: params?.skip,
      take: params?.take,
      include: {
        careHomes: true,
      },
    })
  }

  async count(params?: {
    status?: OrganizationStatus
  }): Promise<number> {
    return prisma.organization.count({
      where: {
        status: params?.status,
      },
    })
  }

  async addCareHome(organizationId: string, careHomeId: string): Promise<Organization> {
    return prisma.organization.update({
      where: { id: organizationId },
      data: {
        careHomes: {
          connect: { id: careHomeId },
        },
      },
      include: {
        careHomes: true,
      },
    })
  }

  async removeCareHome(organizationId: string, careHomeId: string): Promise<Organization> {
    return prisma.organization.update({
      where: { id: organizationId },
      data: {
        careHomes: {
          disconnect: { id: careHomeId },
        },
      },
      include: {
        careHomes: true,
      },
    })
  }

  async updateSettings(id: string, settings: OrganizationSettings): Promise<Organization> {
    return prisma.organization.update({
      where: { id },
      data: {
        settings: settings as Prisma.JsonObject,
      },
      include: {
        careHomes: true,
      },
    })
  }
}


