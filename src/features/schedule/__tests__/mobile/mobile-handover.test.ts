import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { HandoverTask } from '../../types/handover';
import { MobileHandoverService } from '../../services/mobile-handover-service';
import { OfflineSyncService } from '../../services/offline-sync-service';

describe('Mobile Handover Features', () => {
  let mobileService: MobileHandoverService;
  let offlineSyncService: OfflineSyncService;

  beforeEach(() => {
    mobileService = new MobileHandoverService();
    offlineSyncService = new OfflineSyncService('test-tenant');
  });

  describe('Mobile UI Adaptation', () => {
    it('should adapt task view for mobile screen', () => {
      const task: HandoverTask = {
        id: '1',
        handoverSessionId: 'session1',
        title: 'Mobile Task',
        category: 'PERSONAL_CARE',
        status: 'PENDING',
        priority: 'HIGH',
      };

      const mobileView = mobileService.adaptTaskForMobile(task);
      expect(mobileView.compactTitle).toBeDefined();
      expect(mobileView.priorityIcon).toBeDefined();
      expect(mobileView.touchFriendly).toBeTruthy();
    });

    it('should provide touch-optimized controls', () => {
      const controls = mobileService.getTouchControls();
      expect(controls.minTouchArea).toBeGreaterThanOrEqual(44); // iOS minimum
      expect(controls.spacing).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Offline Capabilities', () => {
    it('should work offline with local storage', async () => {
      const task: HandoverTask = {
        id: '2',
        handoverSessionId: 'session2',
        title: 'Offline Mobile Task',
        category: 'CLINICAL_CARE',
        status: 'PENDING',
        priority: 'MEDIUM',
      };

      await mobileService.saveTaskLocally(task);
      const savedTask = await mobileService.getLocalTask(task.id);
      expect(savedTask).toBeDefined();
      expect(savedTask.id).toBe(task.id);
    });

    it('should handle image uploads offline', async () => {
      const mockImage = new Blob(['mock-image'], { type: 'image/jpeg' });
      const taskId = '3';

      await mobileService.queueImageUpload(taskId, mockImage);
      const pendingUploads = await mobileService.getPendingUploads();
      expect(pendingUploads).toContain(taskId);
    });
  });

  describe('Mobile Performance', () => {
    it('should lazy load task images', async () => {
      const task: HandoverTask = {
        id: '4',
        handoverSessionId: 'session4',
        title: 'Task with Images',
        category: 'PERSONAL_CARE',
        status: 'PENDING',
        priority: 'LOW',
      };

      const optimizedTask = await mobileService.optimizeImagesForMobile(task);
      expect(optimizedTask.lazyLoadEnabled).toBeTruthy();
      expect(optimizedTask.thumbnailUrl).toBeDefined();
    });

    it('should implement infinite scrolling', async () => {
      const page1 = await mobileService.getTasksPage(1);
      expect(page1.tasks.length).toBeLessThanOrEqual(20);
      expect(page1.hasMore).toBeDefined();
    });
  });

  describe('Mobile-Specific Features', () => {
    it('should support barcode scanning', async () => {
      const mockBarcode = '123456789';
      const scanResult = await mobileService.scanBarcode();
      expect(scanResult.success).toBeTruthy();
      expect(scanResult.code).toBeDefined();
    });

    it('should support voice notes', async () => {
      const mockAudio = new Blob(['mock-audio'], { type: 'audio/mp3' });
      const taskId = '5';

      const recordingResult = await mobileService.recordVoiceNote(taskId, mockAudio);
      expect(recordingResult.success).toBeTruthy();
      expect(recordingResult.duration).toBeDefined();
    });

    it('should provide offline maps', async () => {
      const location = { lat: 51.5074, lng: -0.1278 };
      const offlineMap = await mobileService.getOfflineMap(location);
      expect(offlineMap.cached).toBeTruthy();
      expect(offlineMap.lastUpdated).toBeDefined();
    });
  });

  describe('Push Notifications', () => {
    it('should handle push notifications', async () => {
      const mockToken = 'mock-fcm-token';
      const registration = await mobileService.registerPushNotifications(mockToken);
      expect(registration.success).toBeTruthy();
      expect(registration.deviceId).toBeDefined();
    });

    it('should queue notifications when offline', async () => {
      const notification = {
        taskId: '6',
        type: 'TASK_UPDATE',
        priority: 'HIGH',
      };

      await mobileService.queueNotification(notification);
      const pendingNotifications = await mobileService.getPendingNotifications();
      expect(pendingNotifications).toContain(notification);
    });
  });
});
