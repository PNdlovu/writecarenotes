import { prisma } from '@/lib/prisma'
import { UserContext } from '@/types/context'
import { AuditLogEntry, AuditableAction } from '../types/bed.types'

export class BedAuditService {
  private static instance: BedAuditService
  private constructor() {}

  public static getInstance(): BedAuditService {
    if (!BedAuditService.instance) {
      BedAuditService.instance = new BedAuditService()
    }
    return BedAuditService.instance
  }

  async logAction(
    action: AuditableAction,
    details: {
      bedId?: string
      residentId?: string
      transferId?: string
      maintenanceId?: string
      waitlistEntryId?: string
      before?: any
      after?: any
      metadata?: Record<string, any>
    },
    context: UserContext
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        action,
        bedId: details.bedId,
        residentId: details.residentId,
        transferId: details.transferId,
        maintenanceId: details.maintenanceId,
        waitlistEntryId: details.waitlistEntryId,
        performedById: context.userId,
        careHomeId: context.careHomeId,
        tenantId: context.tenantId,
        beforeState: details.before ? JSON.stringify(details.before) : null,
        afterState: details.after ? JSON.stringify(details.after) : null,
        metadata: details.metadata ? JSON.stringify(details.metadata) : null
      }
    })
  }

  async getAuditLog(
    filters: {
      bedId?: string
      residentId?: string
      action?: AuditableAction
      startDate?: Date
      endDate?: Date
    },
    context: UserContext,
    page = 1,
    pageSize = 20
  ): Promise<{
    entries: AuditLogEntry[]
    total: number
    page: number
    pageSize: number
  }> {
    const where = {
      careHomeId: context.careHomeId,
      ...(filters.bedId && { bedId: filters.bedId }),
      ...(filters.residentId && { residentId: filters.residentId }),
      ...(filters.action && { action: filters.action }),
      ...(filters.startDate && filters.endDate && {
        createdAt: {
          gte: filters.startDate,
          lte: filters.endDate
        }
      })
    }

    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          performedBy: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          bed: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          resident: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.auditLog.count({ where })
    ])

    return {
      entries: entries.map(entry => ({
        ...entry,
        beforeState: entry.beforeState ? JSON.parse(entry.beforeState) : null,
        afterState: entry.afterState ? JSON.parse(entry.afterState) : null,
        metadata: entry.metadata ? JSON.parse(entry.metadata) : null
      })),
      total,
      page,
      pageSize
    }
  }

  async getActionHistory(
    entityType: 'bed' | 'resident' | 'transfer' | 'maintenance' | 'waitlist',
    entityId: string,
    context: UserContext
  ): Promise<AuditLogEntry[]> {
    const whereClause = {
      careHomeId: context.careHomeId,
      [`${entityType}Id`]: entityId
    }

    const entries = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return entries.map(entry => ({
      ...entry,
      beforeState: entry.beforeState ? JSON.parse(entry.beforeState) : null,
      afterState: entry.afterState ? JSON.parse(entry.afterState) : null,
      metadata: entry.metadata ? JSON.parse(entry.metadata) : null
    }))
  }
}


