import { PendingChange } from '../types';

export class BatchStrategy {
  private readonly maxBatchSize: number = 50;
  private readonly maxBatchDelay: number = 5000; // 5 seconds

  /**
   * Group changes into batches for efficient syncing
   */
  groupIntoBatches(changes: PendingChange[]): PendingChange[][] {
    const batches: PendingChange[][] = [];
    let currentBatch: PendingChange[] = [];
    let lastTimestamp = 0;

    for (const change of changes) {
      // Start a new batch if:
      // 1. Current batch is at max size
      // 2. Time gap between changes is too large
      if (
        currentBatch.length >= this.maxBatchSize ||
        (lastTimestamp > 0 && change.timestamp - lastTimestamp > this.maxBatchDelay)
      ) {
        if (currentBatch.length > 0) {
          batches.push([...currentBatch]);
          currentBatch = [];
        }
      }

      currentBatch.push(change);
      lastTimestamp = change.timestamp;
    }

    // Add the last batch if not empty
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  /**
   * Prioritize changes based on type and entity
   */
  prioritizeChanges(changes: PendingChange[]): PendingChange[] {
    return [...changes].sort((a, b) => {
      // Prioritize creates before updates before deletes
      const typeOrder = {
        create: 0,
        update: 1,
        delete: 2,
      };

      const typeComparison = typeOrder[a.type] - typeOrder[b.type];
      if (typeComparison !== 0) return typeComparison;

      // Then sort by timestamp
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Optimize changes by merging redundant operations
   */
  optimizeChanges(changes: PendingChange[]): PendingChange[] {
    const changeMap = new Map<string, PendingChange>();

    for (const change of changes) {
      const key = `${change.entity}-${change.data.id}`;
      const existingChange = changeMap.get(key);

      if (!existingChange) {
        changeMap.set(key, change);
        continue;
      }

      // If there's a delete after a create/update, just keep the delete
      if (change.type === 'delete') {
        changeMap.set(key, change);
        continue;
      }

      // If there's an update after a create, merge the data
      if (existingChange.type === 'create' && change.type === 'update') {
        changeMap.set(key, {
          ...existingChange,
          data: { ...existingChange.data, ...change.data },
          timestamp: change.timestamp,
        });
        continue;
      }

      // For multiple updates, keep the latest
      if (existingChange.type === 'update' && change.type === 'update') {
        changeMap.set(key, {
          ...change,
          data: { ...existingChange.data, ...change.data },
        });
      }
    }

    return Array.from(changeMap.values());
  }
}
