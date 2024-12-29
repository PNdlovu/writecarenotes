import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
import { ActivitySyncService } from '../services/sync-service';
import { setupTestData, clearTestData, testOrg, testCareHome, testUser } from './setup';
import { ActivityStatus, ActivityType } from '../types';

describe('ActivitySyncService', () => {
  let syncService: ActivitySyncService;

  beforeEach(async () => {
    await setupTestData();
    syncService = new ActivitySyncService(testOrg.id, testCareHome.id);
    // Clear offline store
    await syncService.clearOfflineData();
  });

  afterEach(async () => {
    await clearTestData();
  });

  test('enqueues and processes pending changes', async () => {
    const newActivity = {
      id: 'test-activity-1',
      title: 'Test Activity',
      description: 'Test Description',
      type: ActivityType.PHYSICAL,
      status: ActivityStatus.SCHEDULED,
      startTime: new Date(),
      endTime: new Date(),
      organizationId: testOrg.id,
      careHomeId: testCareHome.id
    };

    // Enqueue change
    await syncService.enqueuePendingChange('create', newActivity.id, newActivity);

    // Check pending changes
    const pendingChanges = await syncService.getPendingChanges();
    expect(pendingChanges).toHaveLength(1);
    expect(pendingChanges[0]).toMatchObject({
      type: 'create',
      id: newActivity.id,
      data: newActivity
    });

    // Process changes
    await syncService.syncPendingChanges();

    // Verify changes were processed
    const remainingChanges = await syncService.getPendingChanges();
    expect(remainingChanges).toHaveLength(0);
  });

  test('handles offline storage limits', async () => {
    const activities = Array.from({ length: 1100 }, (_, i) => ({
      id: `test-activity-${i}`,
      title: `Test Activity ${i}`,
      type: ActivityType.PHYSICAL,
      status: ActivityStatus.SCHEDULED,
      startTime: new Date(),
      endTime: new Date(),
      organizationId: testOrg.id,
      careHomeId: testCareHome.id
    }));

    // Save activities offline
    await syncService.saveOfflineActivities(activities);

    // Check storage limits were enforced
    const storedActivities = await syncService.getOfflineActivities();
    expect(storedActivities.length).toBeLessThanOrEqual(1000);
  });

  test('handles conflict resolution', async () => {
    const activity = {
      id: 'conflict-test-activity',
      title: 'Original Title',
      type: ActivityType.PHYSICAL,
      status: ActivityStatus.SCHEDULED,
      startTime: new Date(),
      endTime: new Date(),
      organizationId: testOrg.id,
      careHomeId: testCareHome.id,
      version: 1
    };

    // Save original activity
    await syncService.saveOfflineActivities([activity]);

    // Create conflicting changes
    const localChange = {
      ...activity,
      title: 'Local Title',
      version: 1
    };

    const serverChange = {
      ...activity,
      title: 'Server Title',
      version: 2
    };

    // Simulate local change
    await syncService.enqueuePendingChange('update', activity.id, localChange);

    // Simulate server change
    jest.spyOn(syncService['api'], 'getActivity').mockResolvedValue(serverChange);

    // Sync changes
    await syncService.syncPendingChanges();

    // Server version should win due to higher version number
    const syncedActivity = await syncService.getOfflineActivity(activity.id);
    expect(syncedActivity?.title).toBe('Server Title');
  });

  test('retries failed operations', async () => {
    const activity = {
      id: 'retry-test-activity',
      title: 'Test Activity',
      type: ActivityType.PHYSICAL,
      status: ActivityStatus.SCHEDULED,
      startTime: new Date(),
      endTime: new Date(),
      organizationId: testOrg.id,
      careHomeId: testCareHome.id
    };

    // Mock API to fail first time
    let attempts = 0;
    jest.spyOn(syncService['api'], 'createActivity').mockImplementation(async () => {
      attempts++;
      if (attempts === 1) throw new Error('Network error');
      return activity;
    });

    // Enqueue change
    await syncService.enqueuePendingChange('create', activity.id, activity);

    // First sync attempt should fail
    await syncService.syncPendingChanges();
    const pendingAfterFirst = await syncService.getPendingChanges();
    expect(pendingAfterFirst).toHaveLength(1);

    // Second sync attempt should succeed
    await syncService.syncPendingChanges();
    const pendingAfterSecond = await syncService.getPendingChanges();
    expect(pendingAfterSecond).toHaveLength(0);
  });
});
