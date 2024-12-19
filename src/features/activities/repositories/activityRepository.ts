/**
 * @fileoverview Activity repository with offline support and multi-tenant isolation
 * @version 1.0.0
 * @created 2024-12-13
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/db';
import { Activity, ActivityStatus } from '../types/models';
import { createOfflineStore } from '@/lib/offline/store';
import { SyncManager } from '@/lib/offline/sync';
import { TenantContext } from '@/lib/multi-tenant/context';
import { CacheManager } from '@/lib/cache';
import { logger } from '@/lib/logger';

const CACHE_TTL = 5 * 60; // 5 minutes
const offlineStore = createOfflineStore('activities');
const syncManager = new SyncManager('activities');
const cache = new CacheManager('activities');

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
        const offlineActivity = {
          ...activity,
          id: crypto.randomUUID(),
          status: ActivityStatus.PENDING_SYNC,
          lastSyncedAt: null,
        };
        await offlineStore.save(offlineActivity);
        syncManager.queueForSync(offlineActivity);
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
      const cached = await cache.get(`activity:${id}`);
      if (cached) return cached;

      // Check offline store
      const offline = await offlineStore.get(id);
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

        await offlineStore.save(updated);
        syncManager.queueForSync(updated);
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
        const allActivities = await offlineStore.getAll();
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


