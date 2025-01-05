/**
 * WriteCareNotes.com
 * @fileoverview Organization Repository
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { prisma } from '@/lib/prisma'
import { 
  Organization, 
  OrganizationSettings, 
  OrganizationStatus,
  OrganizationStats,
  ComplianceFramework,
  OrganizationQueryParams
} from '../types/organization.types'
import { Prisma, Region } from '@prisma/client'
import { TenantContext } from '@/lib/tenant'
import { ApiError } from '@/lib/errors'

export class OrganizationRepository {
  async findById(id: string, context: TenantContext): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { 
        id,
        tenantId: context.tenantId
      },
      include: {
        careHomes: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        complianceFrameworks: true,
        subscription: true,
      },
    })
  }

  async findBySlug(slug: string, context: TenantContext): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { 
        slug,
        tenantId: context.tenantId
      },
      include: {
        careHomes: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        complianceFrameworks: true,
        subscription: true,
      },
    })
  }

  async create(data: {
    tenantId: string
    name: string
    slug: string
    type: string
    region: Region
    regulatoryBody: string
    settings: OrganizationSettings
    status?: OrganizationStatus
    contactDetails: Organization['contactDetails']
    complianceFrameworks: ComplianceFramework[]
    metadata: {
      createdAt: Date
      updatedAt: Date
      createdBy: string
      updatedBy: string
      version: number
    }
  }): Promise<Organization> {
    return prisma.organization.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        slug: data.slug,
        type: data.type,
        region: data.region,
        regulatoryBody: data.regulatoryBody,
        settings: data.settings as Prisma.JsonObject,
        status: data.status || OrganizationStatus.ACTIVE,
        contactDetails: data.contactDetails as Prisma.JsonObject,
        complianceFrameworks: {
          create: data.complianceFrameworks
        },
        metadata: data.metadata as Prisma.JsonObject,
      },
      include: {
        careHomes: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        complianceFrameworks: true,
        subscription: true,
      },
    })
  }

  async update(
    id: string, 
    data: Partial<Organization>, 
    context: TenantContext
  ): Promise<Organization> {
    return prisma.organization.update({
      where: { 
        id,
        tenantId: context.tenantId
      },
      data: {
        name: data.name,
        type: data.type,
        region: data.region,
        regulatoryBody: data.regulatoryBody,
        settings: data.settings as Prisma.JsonObject,
        status: data.status,
        contactDetails: data.contactDetails as Prisma.JsonObject,
        metadata: data.metadata as Prisma.JsonObject,
        complianceFrameworks: data.complianceFrameworks ? {
          deleteMany: {},
          create: data.complianceFrameworks
        } : undefined,
      },
      include: {
        careHomes: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        complianceFrameworks: true,
        subscription: true,
      },
    })
  }

  async delete(id: string, context: TenantContext): Promise<void> {
    await prisma.organization.delete({
      where: { 
        id,
        tenantId: context.tenantId
      },
    })
  }

  async findAll(params: OrganizationQueryParams & {
    tenantId: string
    skip?: number
    take?: number
  }): Promise<Organization[]> {
    const { tenantId, skip, take, status, region, type, search, sortBy, sortOrder } = params

    const where: Prisma.OrganizationWhereInput = {
      tenantId,
      status,
      region,
      type,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    return prisma.organization.findMany({
      where,
      skip,
      take,
      include: {
        careHomes: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        complianceFrameworks: true,
        subscription: true,
      },
      orderBy: sortBy ? {
        [sortBy]: sortOrder || 'asc',
      } : {
        createdAt: 'desc',
      },
    })
  }

  async count(params: {
    tenantId: string
    status?: OrganizationStatus
    region?: Region
    type?: string
    search?: string
  }): Promise<number> {
    const { tenantId, status, region, type, search } = params

    const where: Prisma.OrganizationWhereInput = {
      tenantId,
      status,
      region,
      type,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    return prisma.organization.count({ where })
  }

  async addCareHome(
    organizationId: string, 
    careHomeId: string, 
    context: TenantContext
  ): Promise<Organization> {
    return prisma.organization.update({
      where: { 
        id: organizationId,
        tenantId: context.tenantId
      },
      data: {
        careHomes: {
          connect: { id: careHomeId },
        },
      },
      include: {
        careHomes: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        complianceFrameworks: true,
        subscription: true,
      },
    })
  }

  async removeCareHome(
    organizationId: string, 
    careHomeId: string, 
    context: TenantContext
  ): Promise<Organization> {
    return prisma.organization.update({
      where: { 
        id: organizationId,
        tenantId: context.tenantId
      },
      data: {
        careHomes: {
          disconnect: { id: careHomeId },
        },
      },
      include: {
        careHomes: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        complianceFrameworks: true,
        subscription: true,
      },
    })
  }

  async updateSettings(
    id: string, 
    settings: OrganizationSettings, 
    context: TenantContext
  ): Promise<Organization> {
    return prisma.organization.update({
      where: { 
        id,
        tenantId: context.tenantId
      },
      data: {
        settings: settings as Prisma.JsonObject,
      },
      include: {
        careHomes: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        complianceFrameworks: true,
        subscription: true,
      },
    })
  }

  async updateComplianceFrameworks(
    id: string, 
    frameworks: ComplianceFramework[], 
    context: TenantContext
  ): Promise<Organization> {
    return prisma.organization.update({
      where: { 
        id,
        tenantId: context.tenantId
      },
      data: {
        complianceFrameworks: {
          deleteMany: {},
          create: frameworks
        },
      },
      include: {
        careHomes: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        complianceFrameworks: true,
        subscription: true,
      },
    })
  }

  async getStats(id: string, context: TenantContext): Promise<OrganizationStats> {
    const organization = await prisma.organization.findUnique({
      where: { 
        id,
        tenantId: context.tenantId
      },
      include: {
        careHomes: {
          include: {
            residents: true,
            staff: true,
          },
        },
        complianceFrameworks: true,
      },
    })

    if (!organization) {
      throw new ApiError('Organization not found', 404)
    }

    const [
      residentCount,
      staffCount,
      incidentCount,
      medicationCount,
      assessmentCount,
      complaintCount,
      financialStats,
      satisfactionStats,
    ] = await Promise.all([
      prisma.resident.count({
        where: { organizationId: id },
      }),
      prisma.staff.count({
        where: { organizationId: id },
      }),
      prisma.incident.count({
        where: { organizationId: id },
      }),
      prisma.medication.count({
        where: { organizationId: id },
      }),
      prisma.assessment.count({
        where: { organizationId: id },
      }),
      prisma.complaint.count({
        where: { organizationId: id },
      }),
      prisma.financialRecord.aggregate({
        where: { organizationId: id },
        _sum: {
          revenue: true,
          expenses: true,
          outstanding: true,
        },
      }),
      prisma.satisfactionSurvey.aggregate({
        where: { organizationId: id },
        _avg: {
          residentScore: true,
          staffScore: true,
          careQualityScore: true,
        },
      }),
    ])

    const totalCareHomes = organization.careHomes.length
    const totalCapacity = organization.careHomes.reduce((sum, home) => sum + home.capacity, 0)
    const currentOccupancy = organization.careHomes.reduce((sum, home) => sum + home.residents.length, 0)
    const occupancyRate = totalCapacity > 0 ? (currentOccupancy / totalCapacity) * 100 : 0

    const complianceScore = organization.complianceFrameworks.reduce(
      (sum, framework) => sum + framework.requirements.filter(r => r.status === 'COMPLIANT').length,
      0
    ) / organization.complianceFrameworks.reduce(
      (sum, framework) => sum + framework.requirements.length,
      0
    ) * 100

    return {
      overview: {
        totalCareHomes,
        totalResidents: residentCount,
        totalStaff: staffCount,
        occupancyRate,
        complianceScore,
      },
      compliance: {
        overallScore: complianceScore,
        byFramework: organization.complianceFrameworks.reduce((acc, framework) => ({
          ...acc,
          [framework.name]: framework.requirements.filter(r => r.status === 'COMPLIANT').length / framework.requirements.length * 100,
        }), {}),
        criticalIssues: organization.complianceFrameworks.reduce(
          (sum, framework) => sum + framework.requirements.filter(r => r.status === 'NON_COMPLIANT' && r.priority === 'CRITICAL').length,
          0
        ),
        upcomingDeadlines: organization.complianceFrameworks.reduce(
          (sum, framework) => sum + framework.requirements.filter(r => r.dueDate && new Date(r.dueDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length,
          0
        ),
      },
      financial: {
        revenue: financialStats._sum.revenue || 0,
        expenses: financialStats._sum.expenses || 0,
        outstanding: financialStats._sum.outstanding || 0,
        projectedRevenue: (financialStats._sum.revenue || 0) * 1.1, // Simple projection
      },
      operational: {
        staffingLevel: (staffCount / residentCount) * 100,
        incidentCount,
        medicationErrors: medicationCount,
        complaintCount,
      },
      quality: {
        residentSatisfaction: satisfactionStats._avg.residentScore || 0,
        staffSatisfaction: satisfactionStats._avg.staffScore || 0,
        careQualityScore: satisfactionStats._avg.careQualityScore || 0,
        inspectionRating: organization.careHomes[0]?.lastInspectionRating || 'PENDING',
      },
    }
  }
}


