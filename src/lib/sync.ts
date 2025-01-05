/**
 * @fileoverview Sync Queue Utility
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import type { SyncQueueItem } from '@/features/medications/types';

// Add item to sync queue
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'status' | 'retryCount' | 'createdAt' | 'updatedAt'>): Promise<SyncQueueItem> {
  const syncItem: SyncQueueItem = {
    id: uuidv4(),
    ...item,
    status: 'PENDING',
    retryCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return await db.syncQueue.create({
    data: syncItem,
  });
}

// Process sync queue
export async function processSyncQueue(options: {
  batchSize?: number;
  maxRetries?: number;
  retryDelay?: number;
} = {}): Promise<void> {
  const {
    batchSize = 10,
    maxRetries = 3,
    retryDelay = 5000,
  } = options;

  try {
    // Get pending items
    const pendingItems = await db.syncQueue.findMany({
      where: {
        status: 'PENDING',
        retryCount: {
          lt: maxRetries,
        },
      },
      take: batchSize,
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Process items in parallel
    await Promise.all(
      pendingItems.map(async (item) => {
        try {
          // Mark as processing
          await db.syncQueue.update({
            where: { id: item.id },
            data: {
              status: 'PROCESSING',
              updatedAt: new Date().toISOString(),
            },
          });

          // Process based on entity type and operation
          switch (item.entityType) {
            case 'medication':
              await processMedicationSync(item);
              break;
            case 'administration':
              await processAdministrationSync(item);
              break;
            case 'review':
              await processReviewSync(item);
              break;
            // Add more entity types as needed
            default:
              throw new Error(`Unknown entity type: ${item.entityType}`);
          }

          // Mark as completed
          await db.syncQueue.update({
            where: { id: item.id },
            data: {
              status: 'COMPLETED',
              updatedAt: new Date().toISOString(),
            },
          });
        } catch (error) {
          // Handle failure
          await db.syncQueue.update({
            where: { id: item.id },
            data: {
              status: 'FAILED',
              error: error instanceof Error ? error.message : 'Unknown error',
              retryCount: item.retryCount + 1,
              updatedAt: new Date().toISOString(),
            },
          });

          // Schedule retry if not exceeded max retries
          if (item.retryCount < maxRetries - 1) {
            setTimeout(() => processSyncQueue(options), retryDelay);
          }
        }
      })
    );
  } catch (error) {
    console.error('Failed to process sync queue:', error);
    throw error;
  }
}

// Process medication sync
async function processMedicationSync(item: SyncQueueItem): Promise<void> {
  switch (item.type) {
    case 'CREATE':
      await db.medication.create({
        data: item.data,
      });
      break;
    case 'UPDATE':
      await db.medication.update({
        where: { id: item.data.id },
        data: item.data,
      });
      break;
    case 'DELETE':
      await db.medication.delete({
        where: { id: item.data.id },
      });
      break;
  }
}

// Process administration sync
async function processAdministrationSync(item: SyncQueueItem): Promise<void> {
  switch (item.type) {
    case 'CREATE':
      await db.administration.create({
        data: item.data,
      });
      break;
    case 'UPDATE':
      await db.administration.update({
        where: { id: item.data.id },
        data: item.data,
      });
      break;
    case 'DELETE':
      await db.administration.delete({
        where: { id: item.data.id },
      });
      break;
  }
}

// Process review sync
async function processReviewSync(item: SyncQueueItem): Promise<void> {
  switch (item.type) {
    case 'CREATE':
      await db.medicationReview.create({
        data: item.data,
      });
      break;
    case 'UPDATE':
      await db.medicationReview.update({
        where: { id: item.data.id },
        data: item.data,
      });
      break;
    case 'DELETE':
      await db.medicationReview.delete({
        where: { id: item.data.id },
      });
      break;
  }
}

// Export sync queue processor
export const syncQueue = {
  add: addToSyncQueue,
  process: processSyncQueue,
}; 


