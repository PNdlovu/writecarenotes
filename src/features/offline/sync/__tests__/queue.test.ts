/**
 * @writecarenotes.com
 * @fileoverview Tests for offline queue system
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { OfflineQueue } from '../queue';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock metrics
vi.mock('@/lib/metrics', () => ({
  metrics: {
    increment: vi.fn(),
  },
}));

// Mock analytics
vi.mock('@/utils/analytics', () => ({
  logEvent: vi.fn(),
}));

describe('OfflineQueue', () => {
  let queue: OfflineQueue;

  beforeEach(() => {
    localStorageMock.clear();
    queue = new OfflineQueue({
      maxRetries: 3,
      storageKey: 'test_queue',
      maxQueueSize: 5,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Queue Management', () => {
    it('should initialize with empty queue', () => {
      const stats = queue.getStats();
      expect(stats.total).toBe(0);
      expect(stats.pending).toBe(0);
    });

    it('should enqueue items with correct priority', () => {
      queue.enqueue({ type: 'high', payload: 'data1' }, 2);
      queue.enqueue({ type: 'low', payload: 'data2' }, 1);
      queue.enqueue({ type: 'medium', payload: 'data3' }, 1);

      const stats = queue.getStats();
      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(3);
    });

    it('should respect maxQueueSize limit', () => {
      // Queue size is set to 5 in beforeEach
      for (let i = 0; i < 6; i++) {
        try {
          queue.enqueue({ type: 'test', payload: `data${i}` });
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect((e as Error).message).toBe('Queue size limit reached');
          expect(queue.getStats().total).toBe(5);
          return;
        }
      }
      fail('Should have thrown queue size limit error');
    });
  });

  describe('Queue Processing', () => {
    it('should process items in priority order', async () => {
      const processed: string[] = [];
      const processor = async (action: any) => {
        processed.push(action.payload);
      };

      queue.enqueue({ type: 'low', payload: 'low1' }, 0);
      queue.enqueue({ type: 'high', payload: 'high1' }, 2);
      queue.enqueue({ type: 'medium', payload: 'medium1' }, 1);

      await queue.processQueue(processor);

      expect(processed).toEqual(['high1', 'medium1', 'low1']);
    });

    it('should handle processor failures and retry', async () => {
      let attempts = 0;
      const processor = async () => {
        attempts++;
        if (attempts <= 2) {
          throw new Error('Processing failed');
        }
      };

      queue.enqueue({ type: 'test', payload: 'retry-data' });
      await queue.processQueue(processor);

      const stats = queue.getStats();
      expect(attempts).toBe(3);
      expect(stats.failed).toBe(0);
      expect(stats.pending).toBe(0);
    });

    it('should mark as failed after max retries', async () => {
      const processor = async () => {
        throw new Error('Always fail');
      };

      queue.enqueue({ type: 'test', payload: 'fail-data' });
      await queue.processQueue(processor);

      const stats = queue.getStats();
      expect(stats.failed).toBe(1);
      expect(stats.pending).toBe(0);
    });
  });

  describe('Persistence', () => {
    it('should persist queue to localStorage', () => {
      queue.enqueue({ type: 'test', payload: 'persist-data' });
      
      // Create new instance with same storage key
      const newQueue = new OfflineQueue({
        storageKey: 'test_queue',
      });

      const stats = newQueue.getStats();
      expect(stats.total).toBe(1);
      expect(stats.pending).toBe(1);
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage full');
      });

      // Should not throw when storage fails
      queue.enqueue({ type: 'test', payload: 'data' });
      
      const stats = queue.getStats();
      expect(stats.total).toBe(1);
    });
  });

  describe('Queue Stats', () => {
    it('should track queue statistics accurately', async () => {
      const processor = async (action: any) => {
        if (action.payload === 'fail') {
          throw new Error('Processing failed');
        }
      };

      queue.enqueue({ type: 'success', payload: 'success' });
      queue.enqueue({ type: 'fail', payload: 'fail' });
      queue.enqueue({ type: 'pending', payload: 'pending' });

      await queue.processQueue(processor);

      const stats = queue.getStats();
      expect(stats).toEqual({
        total: 3,
        pending: 1,
        processing: 0,
        failed: 1,
      });
    });
  });

  describe('Error Handling', () => {
    it('should log errors and metrics', async () => {
      const { metrics } = await import('@/lib/metrics');
      const { logEvent } = await import('@/utils/analytics');

      const processor = async () => {
        throw new Error('Test error');
      };

      queue.enqueue({ type: 'test', payload: 'error-data' });
      await queue.processQueue(processor);

      expect(metrics.increment).toHaveBeenCalledWith('offline.queue.action_failed');
      expect(logEvent).toHaveBeenCalledWith('action_processing_failed', expect.any(Object));
    });
  });
});
