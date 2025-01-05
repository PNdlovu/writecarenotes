/**
 * @writecarenotes.com
 * @fileoverview Activity repository for managing care home activities with offline support
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Enterprise-grade repository for managing care home activities with full offline support,
 * multi-tenant isolation, and regulatory compliance. Implements caching strategies and
 * sync mechanisms for optimal performance across UK and Ireland care homes.
 */

import { prisma } from '@/lib/db';
import { Activity, ActivityStatus } from '../types/models';
import { OfflineService } from '@/lib/offline/offlineService';
import { TenantContext } from '@/lib/multi-tenant/context';
import { CacheService, CacheOptions } from '@/lib/cache';
import { logger } from '@/lib/logger';

const CACHE_TTL: CacheOptions = { ttl: 5 * 60 }; // 5 minutes
const cache = new CacheService<Activity>('activities');
const offlineService = new OfflineService<Activity>('activities');

export class ActivityRepository {
  constructor(private tenantContext: TenantContext) {}

  /**
   * Create a new activity with offline support
   */
  async create(activity: Omit<Activity, 'id'>): Promise<Activity> {
    try {
      if (navigator.onLine) {
        const result = await prisma.activity.create({
          data: {
            ...activity,
            organizationId: this.tenantContext.organizationId,
          },
        });
        await cache.set(`activity:${result.id}`, result, CACHE_TTL);
        return result;
      } else {
        const offlineActivity: Activity = {
          ...activity,
          id: crypto.randomUUID(),
          status: ActivityStatus.PENDING_SYNC,
          lastSyncedAt: null,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          organizationId: this.tenantContext.organizationId,
        };
        await offlineService.saveData(offlineActivity.id, offlineActivity);
        await offlineService.queueSync({
          type: 'CREATE',
          data: offlineActivity,
          id: offlineActivity.id
        });
        return offlineActivity;
      }
    } catch (error) {
      logger.error('Failed to create activity', { error, activity });
      throw error;
    }
  }

  /**
   * Find activity by ID with tenant isolation
   */
  async findById(id: string): Promise<Activity | null> {
    try {
      // Check cache first
      const cached = await cache.get<Activity>(`activity:${id}`);
      if (cached) return cached;

      // Check offline store
      const offline = await offlineService.getData(id);
      if (offline) return offline;

      // Fetch from database
      if (navigator.onLine) {
        const activity = await prisma.activity.findFirst({
          where: {
            id,
            organizationId: this.tenantContext.organizationId,
          },
          include: {
            participants: true,
            resources: true,
            outcomes: true,
          },
        });

        if (activity) {
          await cache.set(`activity:${id}`, activity, CACHE_TTL);
        }

        return activity;
      }

      return null;
    } catch (error) {
      logger.error('Failed to find activity', { error, id });
      throw error;
    }
  }

  /**
   * Update activity with offline support
   */
  async update(id: string, data: Partial<Activity>): Promise<Activity> {
    try {
      if (navigator.onLine) {
        const result = await prisma.activity.update({
          where: {
            id,
            organizationId: this.tenantContext.organizationId,
          },
          data: {
            ...data,
            version: { increment: 1 },
            updatedAt: new Date(),
          },
        });
        await cache.delete(`activity:${id}`);
        return result;
      } else {
        const activity = await this.findById(id);
        if (!activity) throw new Error('Activity not found');

        const updated = {
          ...activity,
          ...data,
          status: ActivityStatus.PENDING_SYNC,
          version: activity.version + 1,
          updatedAt: new Date(),
        };

        await offlineService.saveData(updated.id, updated);
        await offlineService.queueSync({
          type: 'UPDATE',
          data: updated,
          id: updated.id
        });
        return updated;
      }
    } catch (error) {
      logger.error('Failed to update activity', { error, id, data });
      throw error;
    }
  }

  /**
   * Query activities with filters and pagination
   */
  async query(params: {
    status?: ActivityStatus[];
    category?: string[];
    startDate?: Date;
    endDate?: Date;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Activity[]; total: number }> {
    try {
      const { page = 1, limit = 20 } = params;
      const skip = (page - 1) * limit;

      if (navigator.onLine) {
        const [items, total] = await Promise.all([
          prisma.activity.findMany({
            where: {
              organizationId: this.tenantContext.organizationId,
              status: params.status ? { in: params.status } : undefined,
              category: params.category ? { in: params.category } : undefined,
              startTime: params.startDate ? { gte: params.startDate } : undefined,
              endTime: params.endDate ? { lte: params.endDate } : undefined,
              OR: params.search
                ? [
                    { name: { contains: params.search, mode: 'insensitive' } },
                    { description: { contains: params.search, mode: 'insensitive' } },
                  ]
                : undefined,
            },
            include: {
              participants: true,
              resources: true,
            },
            skip,
            take: limit,
            orderBy: { startTime: 'desc' },
          }),
          prisma.activity.count({
            where: {
              organizationId: this.tenantContext.organizationId,
            },
          }),
        ]);

        return { items, total };
      } else {
        // Offline query from local store
        const allActivities = await offlineService.getAll();
        const filtered = allActivities.filter(
          (a) =>
            (!params.status || params.status.includes(a.status)) &&
            (!params.category || params.category.includes(a.category)) &&
            (!params.startDate || new Date(a.startTime) >= params.startDate) &&
            (!params.endDate || new Date(a.endTime) <= params.endDate) &&
            (!params.search ||
              a.name.toLowerCase().includes(params.search.toLowerCase()) ||
              a.description?.toLowerCase().includes(params.search.toLowerCase()))
        );

        return {
          items: filtered.slice(skip, skip + limit),
          total: filtered.length,
        };
      }
    } catch (error) {
      logger.error('Failed to query activities', { error, params });
      throw error;
    }
  }
}


