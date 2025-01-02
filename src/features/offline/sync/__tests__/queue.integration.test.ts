/**
 * @writecarenotes.com
 * @fileoverview Integration tests for offline queue system
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { OfflineQueue } from '../queue';
import { metrics } from '@/lib/metrics';
import { logEvent } from '@/utils/analytics';

// Mock dependencies
vi.mock('@/lib/metrics');
vi.mock('@/utils/analytics');

describe('OfflineQueue Integration', () => {
  let queue: OfflineQueue;

  beforeEach(() => {
    localStorage.clear();
    queue = new OfflineQueue({
      maxRetries: 3,
      storageKey: 'integration_test_queue',
      maxQueueSize: 100,
    });
    vi.clearAllMocks();
  });

  describe('Real-world Scenarios', () => {
    it('should handle large data payloads', async () => {
      // Create a large payload
      const largePayload = {
        type: 'large_data',
        payload: Array(1000).fill('test').join(''),
      };

      queue.enqueue(largePayload);
      
      const processed = vi.fn();
      await queue.processQueue(processed);
      
      expect(processed).toHaveBeenCalledWith(expect.objectContaining({
        type: 'large_data',
        payload: expect.any(String),
      }));
    });

    it('should handle concurrent operations', async () => {
      // Simulate concurrent enqueue operations
      const promises = Array(10).fill(null).map((_, i) => 
        queue.enqueue({ type: 'concurrent', payload: `data${i}` })
      );

      await Promise.all(promises);

      const stats = queue.getStats();
      expect(stats.total).toBe(10);
      expect(stats.pending).toBe(10);
    });

    it('should maintain order within same priority', async () => {
      const processed: string[] = [];
      const processor = async (action: any) => {
        processed.push(action.payload);
      };

      // Enqueue items with same priority
      queue.enqueue({ type: 'same_priority', payload: 'first' }, 1);
      queue.enqueue({ type: 'same_priority', payload: 'second' }, 1);
      queue.enqueue({ type: 'same_priority', payload: 'third' }, 1);

      await queue.processQueue(processor);

      expect(processed).toEqual(['first', 'second', 'third']);
    });

    it('should handle processor timeouts', async () => {
      const slowProcessor = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
      };

      queue.enqueue({ type: 'slow', payload: 'timeout_data' });
      
      // Process with timeout
      const processPromise = queue.processQueue(slowProcessor);
      
      await expect(processPromise).resolves.not.toThrow();
    });
  });

  describe('Error Recovery', () => {
    it('should recover from storage corruption', () => {
      // Corrupt the storage
      localStorage.setItem('integration_test_queue', 'invalid json');

      // Should not throw when creating new queue
      const newQueue = new OfflineQueue({
        storageKey: 'integration_test_queue',
      });

      const stats = newQueue.getStats();
      expect(stats.total).toBe(0);
    });

    it('should handle processor errors gracefully', async () => {
      const errorProcessor = async (action: any) => {
        if (action.payload === 'error') {
          throw new Error('Expected error');
        }
        return true;
      };

      queue.enqueue({ type: 'success', payload: 'success' });
      queue.enqueue({ type: 'error', payload: 'error' });
      queue.enqueue({ type: 'after', payload: 'after' });

      await queue.processQueue(errorProcessor);

      const stats = queue.getStats();
      expect(stats.failed).toBe(1);
      expect(stats.pending).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should handle batch processing efficiently', async () => {
      const start = performance.now();
      
      // Add 100 items
      for (let i = 0; i < 100; i++) {
        queue.enqueue({ type: 'batch', payload: `item${i}` });
      }

      const processed = vi.fn();
      await queue.processQueue(processed);
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(1000); // Should process 100 items in under 1s
      expect(processed).toHaveBeenCalledTimes(100);
    });

    it('should handle memory efficiently with large queues', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Add 1000 items
      for (let i = 0; i < 1000; i++) {
        queue.enqueue({ type: 'memory', payload: `item${i}` });
      }

      const processed = vi.fn();
      await queue.processQueue(processed);
      
      const memoryUsed = process.memoryUsage().heapUsed - initialMemory;
      expect(memoryUsed).toBeLessThan(5 * 1024 * 1024); // Should use less than 5MB additional memory
    });
  });

  describe('Analytics Integration', () => {
    it('should track all relevant metrics', async () => {
      queue.enqueue({ type: 'metrics', payload: 'test' });
      
      const processor = async () => {
        throw new Error('Test error');
      };

      await queue.processQueue(processor);

      expect(metrics.increment).toHaveBeenCalledWith('offline.queue.action_added');
      expect(metrics.increment).toHaveBeenCalledWith('offline.queue.action_failed');
      expect(logEvent).toHaveBeenCalledWith('action_processing_failed', expect.any(Object));
    });

    it('should include relevant data in analytics events', async () => {
      const timestamp = new Date().toISOString();
      
      queue.enqueue({ 
        type: 'analytics', 
        payload: 'test',
        metadata: { timestamp } 
      });

      await queue.processQueue(async () => {});

      expect(logEvent).toHaveBeenCalledWith(
        'action_processed',
        expect.objectContaining({
          timestamp: expect.any(String),
          actionId: expect.any(String),
          type: 'analytics'
        })
      );
    });
  });
});
