/**
 * @writecarenotes.com
 * @fileoverview Schedule offline sync service tests
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Test suite for the schedule offline sync service.
 * Validates offline data management and sync functionality.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ScheduleOfflineService } from '../services/offline-sync-service';
import type { ScheduleData, ScheduleConfig } from '../types';

describe('ScheduleOfflineService', () => {
  let service: ScheduleOfflineService;

  beforeEach(() => {
    service = new ScheduleOfflineService();
  });

  test('should initialize successfully', async () => {
    await expect(service.initialize()).resolves.not.toThrow();
  });

  test('should save schedule data', async () => {
    const data: ScheduleData = {
      id: '123',
      title: 'Test Schedule',
      startDate: new Date(),
      endDate: new Date(),
      status: 'active'
    };

    await expect(service.saveSchedule(data)).resolves.not.toThrow();
  });

  test('should retrieve schedule data', async () => {
    const data: ScheduleData = {
      id: '123',
      title: 'Test Schedule',
      startDate: new Date(),
      endDate: new Date(),
      status: 'active'
    };

    await service.saveSchedule(data);
    const retrieved = await service.getSchedule('123');
    expect(retrieved).toEqual(data);
  });

  test('should get all schedules', async () => {
    const data1: ScheduleData = {
      id: '123',
      title: 'Test Schedule 1',
      startDate: new Date(),
      endDate: new Date(),
      status: 'active'
    };

    const data2: ScheduleData = {
      id: '456',
      title: 'Test Schedule 2',
      startDate: new Date(),
      endDate: new Date(),
      status: 'active'
    };

    await service.saveSchedule(data1);
    await service.saveSchedule(data2);

    const all = await service.getAllSchedules();
    expect(all).toHaveLength(2);
    expect(all).toContainEqual(data1);
    expect(all).toContainEqual(data2);
  });

  test('should sync schedules', async () => {
    await expect(service.syncSchedules()).resolves.not.toThrow();
  });

  test('should manage schedule config', async () => {
    const config: ScheduleConfig = {
      autoSync: true,
      syncInterval: 5000,
      maxRetries: 3
    };

    await service.updateScheduleConfig(config);
    const retrieved = await service.getScheduleConfig();
    expect(retrieved).toEqual(config);
  });
});
