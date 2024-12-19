/**
 * @fileoverview Medication Service Tests
 * @version 1.0.0
 * @created 2024-03-22
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { MedicationService } from '../medicationService';
import { db } from '@/lib/db';
import type { Medication, Administration } from '../../types';

// Mock IndexedDB
const indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};

const IDBRequest = {
  result: {},
  error: null,
  onerror: null as any,
  onsuccess: null as any,
  onupgradeneeded: null as any,
};

const mockStore = {
  put: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(),
  delete: vi.fn(),
};

const mockTransaction = {
  objectStore: vi.fn().mockReturnValue(mockStore),
};

// Mock fetch
global.fetch = vi.fn();

describe('MedicationService', () => {
  let service: MedicationService;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup IndexedDB mock
    (global as any).indexedDB = indexedDB;
    indexedDB.open.mockReturnValue(IDBRequest);

    // Setup fetch mock
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    service = new MedicationService();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createMedication', () => {
    const mockMedication: Omit<Medication, 'id'> = {
      name: 'Test Medication',
      dosage: '10mg',
      route: 'Oral',
      type: 'REGULAR',
      status: 'ACTIVE',
      currentStock: 100,
      residentId: '123',
    };

    it('should create a medication and add to sync queue', async () => {
      // Setup
      mockStore.put.mockResolvedValue(undefined);

      // Execute
      const result = await service.createMedication(mockMedication);

      // Verify
      expect(result).toMatchObject({
        ...mockMedication,
        id: expect.any(String),
      });

      // Verify sync queue
      expect(mockStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CREATE',
          entityType: 'medication',
          data: result,
        })
      );
    });

    it('should handle offline creation', async () => {
      // Setup
      (global as any).navigator.onLine = false;
      mockStore.put.mockResolvedValue(undefined);

      // Execute
      const result = await service.createMedication(mockMedication);

      // Verify
      expect(result).toMatchObject({
        ...mockMedication,
        id: expect.any(String),
      });

      // Verify data is stored locally
      expect(mockStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          ...result,
        })
      );
    });

    it('should handle creation errors', async () => {
      // Setup
      mockStore.put.mockRejectedValue(new Error('Storage error'));

      // Execute & Verify
      await expect(service.createMedication(mockMedication)).rejects.toThrow(
        'Failed to create medication'
      );
    });
  });

  describe('syncQueuedChanges', () => {
    const mockQueueItem = {
      id: '123',
      type: 'CREATE',
      entityType: 'medication',
      data: {
        id: '456',
        name: 'Test Med',
      },
      timestamp: new Date().toISOString(),
      version: 1,
      retryCount: 0,
      status: 'PENDING',
    };

    it('should process sync queue successfully', async () => {
      // Setup
      mockStore.getAll.mockResolvedValue([mockQueueItem]);
      mockStore.get.mockResolvedValue(null); // No server data exists
      mockStore.put.mockResolvedValue(undefined);

      // Execute
      await service.syncQueuedChanges();

      // Verify
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/medications/456',
        expect.any(Object)
      );
      expect(mockStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockQueueItem.id,
          status: 'RESOLVED',
        })
      );
    });

    it('should handle sync conflicts', async () => {
      // Setup
      const serverData = {
        id: '456',
        name: 'Different Name',
        version: 2,
      };

      mockStore.getAll.mockResolvedValue([mockQueueItem]);
      mockStore.get.mockResolvedValue(serverData);

      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => serverData,
      });

      // Execute
      await service.syncQueuedChanges();

      // Verify conflict handling
      expect(mockStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockQueueItem.id,
          status: 'FAILED',
          conflicts: expect.any(Array),
        })
      );
    });

    it('should handle sync errors', async () => {
      // Setup
      mockStore.getAll.mockResolvedValue([mockQueueItem]);
      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      // Execute
      await service.syncQueuedChanges();

      // Verify error handling
      expect(mockStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockQueueItem.id,
          status: 'FAILED',
          retryCount: 1,
        })
      );
    });
  });

  describe('offline support', () => {
    it('should queue changes when offline', async () => {
      // Setup
      (global as any).navigator.onLine = false;
      const mockMedication = {
        name: 'Test Med',
        dosage: '10mg',
      };

      // Execute
      await service.createMedication(mockMedication);

      // Verify
      expect(mockStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CREATE',
          entityType: 'medication',
        })
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should sync when coming online', async () => {
      // Setup
      const mockQueueItems = [
        {
          id: '123',
          type: 'CREATE',
          entityType: 'medication',
          data: { name: 'Test Med' },
          status: 'PENDING',
        },
      ];
      mockStore.getAll.mockResolvedValue(mockQueueItems);

      // Simulate coming online
      const onlineEvent = new Event('online');
      window.dispatchEvent(onlineEvent);

      // Verify sync was triggered
      expect(mockStore.getAll).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle database initialization errors', async () => {
      // Setup
      indexedDB.open.mockImplementation(() => {
        throw new Error('DB initialization failed');
      });

      // Execute & Verify
      await expect(service.createMedication({} as any)).rejects.toThrow(
        'Failed to create medication'
      );
    });

    it('should handle network errors', async () => {
      // Setup
      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      // Execute & Verify
      await expect(service.syncQueuedChanges()).resolves.not.toThrow();
      expect(mockStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'FAILED',
        })
      );
    });

    it('should handle validation errors', async () => {
      // Setup
      const invalidMedication = {
        // Missing required fields
      };

      // Execute & Verify
      await expect(service.createMedication(invalidMedication as any)).rejects.toThrow();
    });
  });

  describe('performance', () => {
    it('should handle large sync queues efficiently', async () => {
      // Setup
      const largeQueue = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        type: 'CREATE',
        entityType: 'medication',
        data: { name: `Med ${i}` },
        status: 'PENDING',
      }));

      mockStore.getAll.mockResolvedValue(largeQueue);

      // Execute
      const start = Date.now();
      await service.syncQueuedChanges();
      const duration = Date.now() - start;

      // Verify performance
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
}); 


