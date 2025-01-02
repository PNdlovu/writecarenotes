/**
 * @writecarenotes.com
 * @fileoverview Unit tests for offline queue system
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { OfflineQueue } from '../offline-queue';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock crypto.randomUUID
const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
global.crypto = {
  ...global.crypto,
  randomUUID: () => mockUUID,
};

describe('OfflineQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('initializes with empty queue', () => {
    const queue = new OfflineQueue();
    expect(queue.getStats()).toEqual({
      total: 0,
      pending: 0,
      processing: 0,
      failed: 0,
    });
  });

  it('loads existing queue from storage', () => {
    const storedQueue = [{
      id: '1',
      type: 'test',
      payload: { data: 'test' },
      timestamp: '2025-01-01T00:00:00.000Z',
      priority: 0,
      retryCount: 0,
      status: 'pending',
    }];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedQueue));

    const queue = new OfflineQueue();
    expect(queue.getStats().total).toBe(1);
  });

  it('enqueues actions correctly', () => {
    const queue = new OfflineQueue();
    const action = {
      type: 'test',
      payload: { data: 'test' },
      priority: 1,
    };

    queue.enqueue(action);

    expect(queue.getStats()).toEqual({
      total: 1,
      pending: 1,
      processing: 0,
      failed: 0,
    });
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it('respects max queue size', () => {
    const queue = new OfflineQueue({ maxQueueSize: 1 });
    queue.enqueue({
      type: 'test1',
      payload: { data: 'test1' },
      priority: 0,
    });

    expect(() => {
      queue.enqueue({
        type: 'test2',
        payload: { data: 'test2' },
        priority: 0,
      });
    }).toThrow('Queue size limit reached');
  });

  it('processes queue in priority order', async () => {
    const queue = new OfflineQueue();
    const processed: string[] = [];
    const processor = jest.fn(async (action) => {
      processed.push(action.type);
    });

    queue.enqueue({
      type: 'low',
      payload: {},
      priority: 0,
    });

    queue.enqueue({
      type: 'high',
      payload: {},
      priority: 1,
    });

    await queue.processQueue(processor);

    expect(processed).toEqual(['high', 'low']);
  });

  it('handles processing failures and retries', async () => {
    const queue = new OfflineQueue({ maxRetries: 2 });
    const processor = jest.fn().mockRejectedValue(new Error('Test error'));

    queue.enqueue({
      type: 'test',
      payload: {},
      priority: 0,
    });

    await queue.processQueue(processor);
    const stats = queue.getStats();

    expect(stats.pending).toBe(1);
    expect(processor).toHaveBeenCalledTimes(1);

    await queue.processQueue(processor);
    await queue.processQueue(processor);

    expect(queue.getStats().failed).toBe(1);
  });

  it('clears queue correctly', () => {
    const queue = new OfflineQueue();
    queue.enqueue({
      type: 'test',
      payload: {},
      priority: 0,
    });

    expect(queue.getStats().total).toBe(1);

    queue.clear();

    expect(queue.getStats().total).toBe(0);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('offline_queue', '[]');
  });
});
