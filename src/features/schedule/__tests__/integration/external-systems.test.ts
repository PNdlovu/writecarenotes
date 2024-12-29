import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { HandoverTask } from '../../types/handover';
import { ExternalSystemService } from '../../services/external-system-service';
import { ComplianceService } from '../../services/compliance-service';
import { OfflineSyncService } from '../../services/offline-sync-service';

describe('External Systems Integration', () => {
  let externalSystemService: ExternalSystemService;
  let complianceService: ComplianceService;
  let offlineSyncService: OfflineSyncService;

  beforeEach(() => {
    externalSystemService = new ExternalSystemService();
    complianceService = new ComplianceService();
    offlineSyncService = new OfflineSyncService('test-tenant');
  });

  describe('Care Management System Integration', () => {
    it('should sync resident data with external CMS', async () => {
      const task: HandoverTask = {
        id: '1',
        handoverSessionId: 'session1',
        title: 'Medication Round',
        category: 'CLINICAL_CARE',
        activity: 'MEDICATION',
        status: 'COMPLETED',
        priority: 'HIGH',
        resident: {
          id: 'resident1',
          name: 'John Doe',
          dateOfBirth: '1945-01-01',
          preferences: ['NO_DAIRY'],
        },
      };

      const syncedData = await externalSystemService.syncWithCMS(task);
      expect(syncedData.success).toBeTruthy();
      expect(syncedData.externalId).toBeDefined();
    });

    it('should handle CMS sync failures gracefully', async () => {
      const task: HandoverTask = {
        id: '2',
        handoverSessionId: 'session2',
        title: 'Invalid Task',
        category: 'CLINICAL_CARE',
        status: 'PENDING',
        priority: 'LOW',
      };

      await expect(externalSystemService.syncWithCMS(task)).rejects.toThrow();
    });
  });

  describe('Electronic Medication Records Integration', () => {
    it('should sync medication tasks with eMAR system', async () => {
      const task: HandoverTask = {
        id: '3',
        handoverSessionId: 'session3',
        title: 'Administer Medication',
        category: 'CLINICAL_CARE',
        activity: 'MEDICATION',
        status: 'COMPLETED',
        priority: 'HIGH',
        regulatoryRequirements: {
          framework: 'CQC',
          standardRef: 'MED001',
          evidenceRequired: true,
        },
      };

      const syncResult = await externalSystemService.syncWithEMAR(task);
      expect(syncResult.success).toBeTruthy();
      expect(syncResult.emarReference).toBeDefined();
    });
  });

  describe('Staff Rota System Integration', () => {
    it('should validate staff availability with rota system', async () => {
      const task: HandoverTask = {
        id: '4',
        handoverSessionId: 'session4',
        title: 'Morning Care',
        category: 'PERSONAL_CARE',
        status: 'PENDING',
        priority: 'MEDIUM',
        assignedTo: {
          id: 'staff1',
          name: 'Jane Smith',
          qualifications: ['NVQ_Level_2'],
        },
      };

      const availability = await externalSystemService.checkStaffAvailability(
        task.assignedTo?.id,
        new Date()
      );
      expect(availability.available).toBeDefined();
    });
  });

  describe('Compliance System Integration', () => {
    it('should validate task compliance with external system', async () => {
      const task: HandoverTask = {
        id: '5',
        handoverSessionId: 'session5',
        title: 'Care Plan Review',
        category: 'CLINICAL_CARE',
        status: 'COMPLETED',
        priority: 'HIGH',
        regulatoryRequirements: {
          framework: 'CQC',
          standardRef: 'CP001',
          evidenceRequired: true,
        },
      };

      const complianceResult = await externalSystemService.validateCompliance(task);
      expect(complianceResult.compliant).toBeTruthy();
      expect(complianceResult.validationId).toBeDefined();
    });
  });

  describe('Offline Sync with External Systems', () => {
    it('should queue external system updates when offline', async () => {
      // Mock offline status
      Object.defineProperty(navigator, 'onLine', { value: false });

      const task: HandoverTask = {
        id: '6',
        handoverSessionId: 'session6',
        title: 'Offline Task',
        category: 'PERSONAL_CARE',
        status: 'COMPLETED',
        priority: 'LOW',
      };

      await offlineSyncService.saveTaskOffline(task);
      const pendingSync = await externalSystemService.getPendingSyncs();
      expect(pendingSync).toContain(task.id);
    });

    it('should sync queued updates when back online', async () => {
      // Mock online status
      Object.defineProperty(navigator, 'onLine', { value: true });

      const syncResult = await externalSystemService.syncQueuedUpdates();
      expect(syncResult.success).toBeTruthy();
      expect(syncResult.syncedCount).toBeGreaterThan(0);
    });
  });
});
