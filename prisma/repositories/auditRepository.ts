/**
 * @fileoverview Audit Repository for tracking system changes
 * @version 1.0.0
 */

import { prisma } from '@/lib/prisma';
import type { 
  AuditEvent, 
  AuditEventType,
  AuditFilters,
  AuditSummary 
} from '@/features/audit/types/audit.types';

export class AuditRepository {
  async createEvent(data: Omit<AuditEvent, 'id' | 'createdAt'>): Promise<AuditEvent> {
    return await prisma.auditEvent.create({
      data: {
        ...data,
        createdAt: new Date().toISOString()
      }
    });
  }

  async getEvent(id: string): Promise<AuditEvent | null> {
    return await prisma.auditEvent.findUnique({
      where: { id },
      include: {
        user: true,
        careHome: true
      }
    });
  }

  async getEvents(filters?: AuditFilters): Promise<AuditEvent[]> {
    const where: any = {};

    if (filters) {
      if (filters.eventType) where.eventType = filters.eventType;
      if (filters.userId) where.userId = filters.userId;
      if (filters.careHomeId) where.careHomeId = filters.careHomeId;
      if (filters.entityType) where.entityType = filters.entityType;
      if (filters.entityId) where.entityId = filters.entityId;
      if (filters.startDate) where.createdAt = { gte: filters.startDate };
      if (filters.endDate) where.createdAt = { ...where.createdAt, lte: filters.endDate };
      if (filters.searchTerm) {
        where.OR = [
          { description: { contains: filters.searchTerm, mode: 'insensitive' } },
          { details: { contains: filters.searchTerm, mode: 'insensitive' } },
          { user: { 
            OR: [
              { firstName: { contains: filters.searchTerm, mode: 'insensitive' } },
              { lastName: { contains: filters.searchTerm, mode: 'insensitive' } }
            ]
          }}
        ];
      }
    }

    return await prisma.auditEvent.findMany({
      where,
      include: {
        user: true,
        careHome: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getEventsByEntity(entityType: string, entityId: string): Promise<AuditEvent[]> {
    return await prisma.auditEvent.findMany({
      where: {
        entityType,
        entityId
      },
      include: {
        user: true,
        careHome: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getEventsByUser(userId: string, filters?: AuditFilters): Promise<AuditEvent[]> {
    const where: any = { userId };

    if (filters) {
      if (filters.eventType) where.eventType = filters.eventType;
      if (filters.careHomeId) where.careHomeId = filters.careHomeId;
      if (filters.entityType) where.entityType = filters.entityType;
      if (filters.startDate) where.createdAt = { gte: filters.startDate };
      if (filters.endDate) where.createdAt = { ...where.createdAt, lte: filters.endDate };
    }

    return await prisma.auditEvent.findMany({
      where,
      include: {
        user: true,
        careHome: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getEventsByCareHome(careHomeId: string, filters?: AuditFilters): Promise<AuditEvent[]> {
    const where: any = { careHomeId };

    if (filters) {
      if (filters.eventType) where.eventType = filters.eventType;
      if (filters.userId) where.userId = filters.userId;
      if (filters.entityType) where.entityType = filters.entityType;
      if (filters.startDate) where.createdAt = { gte: filters.startDate };
      if (filters.endDate) where.createdAt = { ...where.createdAt, lte: filters.endDate };
    }

    return await prisma.auditEvent.findMany({
      where,
      include: {
        user: true,
        careHome: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAuditSummary(careHomeId: string, period: 'day' | 'week' | 'month'): Promise<AuditSummary> {
    const startDate = new Date();
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const events = await prisma.auditEvent.groupBy({
      by: ['eventType'],
      where: {
        careHomeId,
        createdAt: { gte: startDate.toISOString() }
      },
      _count: true
    });

    const userActivity = await prisma.auditEvent.groupBy({
      by: ['userId'],
      where: {
        careHomeId,
        createdAt: { gte: startDate.toISOString() }
      },
      _count: true
    });

    const entityChanges = await prisma.auditEvent.groupBy({
      by: ['entityType'],
      where: {
        careHomeId,
        createdAt: { gte: startDate.toISOString() }
      },
      _count: true
    });

    return {
      eventCounts: events.reduce((acc, curr) => ({
        ...acc,
        [curr.eventType]: curr._count
      }), {} as { [key in AuditEventType]: number }),
      userActivityCount: userActivity.length,
      entityChangeCount: entityChanges.reduce((sum, curr) => sum + curr._count, 0),
      period
    };
  }

  async deleteEvents(filters: AuditFilters): Promise<number> {
    const where: any = {};

    if (filters.eventType) where.eventType = filters.eventType;
    if (filters.userId) where.userId = filters.userId;
    if (filters.careHomeId) where.careHomeId = filters.careHomeId;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.startDate) where.createdAt = { gte: filters.startDate };
    if (filters.endDate) where.createdAt = { ...where.createdAt, lte: filters.endDate };

    const result = await prisma.auditEvent.deleteMany({ where });
    return result.count;
  }
}
