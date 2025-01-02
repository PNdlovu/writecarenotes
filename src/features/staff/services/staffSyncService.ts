/**
 * @writecarenotes.com
 * @fileoverview Service for handling offline synchronization of staff data
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { prisma } from '@/lib/prisma';
import { isBefore, addMinutes } from 'date-fns';

interface SyncResult {
  success: boolean;
  error?: string;
  conflictResolution?: {
    entityType: string;
    entityId: string;
    serverVersion: number;
    clientVersion: number;
  };
}

export class StaffSyncService {
  private static readonly SYNC_LOCK_TIMEOUT = 5; // minutes
  private static readonly MAX_RETRY_COUNT = 3;

  /**
   * Process offline changes in the queue
   */
  static async processSyncQueue(organizationId: string): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    // Get pending changes ordered by creation date
    const pendingChanges = await prisma.staffOfflineChange.findMany({
      where: {
        status: 'PENDING',
        staff: {
          organizationId
        },
        retryCount: {
          lt: this.MAX_RETRY_COUNT
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        staff: true
      }
    });

    for (const change of pendingChanges) {
      try {
        // Check if entity is locked for sync
        const isLocked = await this.isEntityLocked(change.entityType, change.entityId);
        if (isLocked) {
          continue;
        }

        // Lock the entity
        await this.lockEntityForSync(change.entityType, change.entityId);

        // Process the change
        const result = await this.processChange(change);
        results.push(result);

        // Update change status
        await prisma.staffOfflineChange.update({
          where: { id: change.id },
          data: {
            status: result.success ? 'SYNCED' : 'FAILED',
            syncedAt: result.success ? new Date() : null,
            retryCount: change.retryCount + 1,
            errorLog: result.error
          }
        });

        // Release the lock
        await this.releaseEntityLock(change.entityType, change.entityId);
      } catch (error) {
        console.error(`Error processing change ${change.id}:`, error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Process a single change
   */
  private static async processChange(change: any): Promise<SyncResult> {
    // Verify entity version to detect conflicts
    const currentVersion = await this.getEntityVersion(change.entityType, change.entityId);
    const changeVersion = change.changes.version;

    if (currentVersion > changeVersion) {
      return {
        success: false,
        error: 'Version conflict detected',
        conflictResolution: {
          entityType: change.entityType,
          entityId: change.entityId,
          serverVersion: currentVersion,
          clientVersion: changeVersion
        }
      };
    }

    // Apply the change based on type
    switch (change.changeType) {
      case 'CREATE':
        await this.applyCreate(change);
        break;
      case 'UPDATE':
        await this.applyUpdate(change);
        break;
      case 'DELETE':
        await this.applyDelete(change);
        break;
      default:
        throw new Error(`Unknown change type: ${change.changeType}`);
    }

    return { success: true };
  }

  /**
   * Lock an entity for synchronization
   */
  private static async lockEntityForSync(entityType: string, entityId: string): Promise<void> {
    await prisma.syncLock.create({
      data: {
        entityType,
        entityId,
        lockedAt: new Date()
      }
    });
  }

  /**
   * Check if an entity is locked
   */
  private static async isEntityLocked(entityType: string, entityId: string): Promise<boolean> {
    const lock = await prisma.syncLock.findUnique({
      where: {
        entityType_entityId: {
          entityType,
          entityId
        }
      }
    });

    if (!lock) {
      return false;
    }

    // Check if lock has expired
    const lockTimeout = addMinutes(lock.lockedAt, this.SYNC_LOCK_TIMEOUT);
    if (isBefore(lockTimeout, new Date())) {
      await this.releaseEntityLock(entityType, entityId);
      return false;
    }

    return true;
  }

  /**
   * Release an entity lock
   */
  private static async releaseEntityLock(entityType: string, entityId: string): Promise<void> {
    await prisma.syncLock.delete({
      where: {
        entityType_entityId: {
          entityType,
          entityId
        }
      }
    });
  }

  /**
   * Get current version of an entity
   */
  private static async getEntityVersion(entityType: string, entityId: string): Promise<number> {
    const entity = await prisma[entityType].findUnique({
      where: { id: entityId },
      select: { version: true }
    });
    return entity?.version ?? 0;
  }

  /**
   * Apply create operation
   */
  private static async applyCreate(change: any): Promise<void> {
    const { entityType, changes } = change;
    await prisma[entityType].create({
      data: {
        ...changes,
        version: 1,
        syncStatus: 'SYNCED',
        lastSyncedAt: new Date()
      }
    });
  }

  /**
   * Apply update operation
   */
  private static async applyUpdate(change: any): Promise<void> {
    const { entityType, entityId, changes } = change;
    await prisma[entityType].update({
      where: { id: entityId },
      data: {
        ...changes,
        version: { increment: 1 },
        syncStatus: 'SYNCED',
        lastSyncedAt: new Date()
      }
    });
  }

  /**
   * Apply delete operation
   */
  private static async applyDelete(change: any): Promise<void> {
    const { entityType, entityId } = change;
    await prisma[entityType].delete({
      where: { id: entityId }
    });
  }
} 