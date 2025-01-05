/**
 * @writecarenotes.com
 * @fileoverview Tests for OfflineService
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { OfflineService } from '../offlineService';
import { SyncStrategy, ErrorCode, OfflineError } from '../types';
import './setup';

interface TestData {
  id: string;
  name: string;
  timestamp: string;
  version?: number;
}

describe('OfflineService', () => {
  let service: OfflineService<TestData>;

  beforeEach(async () => {
    service = new OfflineService<TestData>('test-store');
    await service.init();
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      expect(service).toBeDefined();
    });

    test('should handle initialization errors', async () => {
      vi.spyOn(indexedDB, 'open').mockImplementation(() => {
        throw new Error('DB Error');
      });

      await expect(
        new OfflineService('test-store').init()
      ).rejects.toThrow(OfflineError);
    });
  });

  describe('Data Operations', () => {
    const testData: TestData = {
      id: '1',
      name: 'Test',
      timestamp: new Date().toISOString(),
    };

    test('should save data successfully', async () => {
      await service.saveData(testData.id, testData);
      const saved = await service.getData(testData.id);
      expect(saved).toEqual(testData);
    });

    test('should handle save errors', async () => {
      vi.spyOn(indexedDB, 'open').mockImplementation(() => {
        throw new Error('Save Error');
      });

      await expect(
        service.saveData(testData.id, testData)
      ).rejects.toThrow(OfflineError);
    });

    test('should get data successfully', async () => {
      await service.saveData(testData.id, testData);
      const data = await service.getData(testData.id);
      expect(data).toEqual(testData);
    });

    test('should return null for non-existent data', async () => {
      const data = await service.getData('non-existent');
      expect(data).toBeNull();
    });

    test('should get all data successfully', async () => {
      const testData2 = { ...testData, id: '2' };
      await service.saveData(testData.id, testData);
      await service.saveData(testData2.id, testData2);

      const allData = await service.getAll();
      expect(allData).toHaveLength(2);
      expect(allData).toEqual(expect.arrayContaining([testData, testData2]));
    });
  });

  describe('Sync Operations', () => {
    const testData: TestData = {
      id: '1',
      name: 'Test',
      timestamp: new Date().toISOString(),
    };

    beforeEach(() => {
      vi.spyOn(global, 'fetch').mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify({ data: testData })))
      );
    });

    test('should queue sync successfully', async () => {
      await service.queueSync({
        type: 'CREATE',
        id: testData.id,
        data: testData,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });

      const count = await service.getPendingSyncCount();
      expect(count).toBe(1);
    });

    test('should process sync queue successfully', async () => {
      await service.queueSync({
        type: 'CREATE',
        id: testData.id,
        data: testData,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });

      await service.processSyncQueue();
      const count = await service.getPendingSyncCount();
      expect(count).toBe(0);
    });

    test('should handle sync errors', async () => {
      vi.spyOn(global, 'fetch').mockImplementation(() =>
        Promise.reject(new Error('Network Error'))
      );

      await service.queueSync({
        type: 'CREATE',
        id: testData.id,
        data: testData,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });

      await service.processSyncQueue();
      const count = await service.getPendingSyncCount();
      expect(count).toBe(1);
    });
  });

  describe('Conflict Resolution', () => {
    const localData: TestData = {
      id: '1',
      name: 'Local',
      timestamp: new Date(Date.now() - 1000).toISOString(),
    };

    const serverData: TestData = {
      id: '1',
      name: 'Server',
      timestamp: new Date().toISOString(),
    };

    test('should resolve LAST_WRITE_WINS strategy', async () => {
      service = new OfflineService<TestData>('test-store', {
        syncStrategy: SyncStrategy.LAST_WRITE_WINS,
      });
      await service.init();

      vi.spyOn(global, 'fetch').mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify({ 
          conflict: true,
          data: serverData 
        })))
      );

      await service.saveData(localData.id, localData);
      await service.queueSync({
        type: 'UPDATE',
        id: localData.id,
        data: localData,
        timestamp: localData.timestamp,
        retryCount: 0,
      });

      await service.processSyncQueue();
      const resolved = await service.getData(localData.id);
      expect(resolved).toEqual(serverData);
    });

    test('should resolve SERVER_WINS strategy', async () => {
      service = new OfflineService<TestData>('test-store', {
        syncStrategy: SyncStrategy.SERVER_WINS,
      });
      await service.init();

      vi.spyOn(global, 'fetch').mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify({ 
          conflict: true,
          data: serverData 
        })))
      );

      await service.saveData(localData.id, localData);
      await service.queueSync({
        type: 'UPDATE',
        id: localData.id,
        data: localData,
        timestamp: localData.timestamp,
        retryCount: 0,
      });

      await service.processSyncQueue();
      const resolved = await service.getData(localData.id);
      expect(resolved).toEqual(serverData);
    });
  });

  describe('Error Handling', () => {
    test('should handle not initialized error', async () => {
      service = new OfflineService<TestData>('test-store');
      await expect(
        service.saveData('1', { id: '1', name: 'Test', timestamp: new Date().toISOString() })
      ).rejects.toThrow(new OfflineError(ErrorCode.NOT_INITIALIZED));
    });

    test('should handle quota exceeded error', async () => {
      const hugeData = {
        id: '1',
        name: 'A'.repeat(1024 * 1024 * 100), // 100MB
        timestamp: new Date().toISOString(),
      };

      await expect(
        service.saveData(hugeData.id, hugeData)
      ).rejects.toThrow(OfflineError);
    });
  });

  describe('Cleanup', () => {
    test('should cleanup resources on destroy', async () => {
      const spy = vi.spyOn(window, 'removeEventListener');
      await service.destroy();
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });
}); 