import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { HandoverTask } from '../types/handover';
import { enterpriseHandoverService } from '../services/enterprise-handover-service';
import { HandoverSecurityService } from '../services/handover-security';

describe('Handover Management Module', () => {
  let handoverService: typeof enterpriseHandoverService;
  let securityService: HandoverSecurityService;

  beforeEach(() => {
    handoverService = enterpriseHandoverService;
    securityService = new HandoverSecurityService();
  });

  describe('Regional Requirements', () => {
    it('should validate CQC requirements for England', async () => {
      const task: HandoverTask = {
        id: '1',
        handoverSessionId: 'session1',
        title: 'Test Task',
        category: 'CLINICAL_CARE',
        status: 'PENDING',
        priority: 'HIGH',
        createdById: 'user1',
        createdBy: { id: 'user1', name: 'Test User' },
        createdAt: new Date(),
        updatedAt: new Date(),
        regionSpecific: {
          region: 'ENGLAND',
          regulatoryBody: 'CQC',
        },
      };

      const isValid = await handoverService.validateRegulatoryCriteria(task, 'ENGLAND');
      expect(isValid).toBe(true);
    });

    it('should validate Ofsted requirements for children\'s homes', async () => {
      const task: HandoverTask = {
        id: '2',
        handoverSessionId: 'session1',
        title: 'Education Support',
        category: 'CHILDRENS_CARE',
        status: 'PENDING',
        priority: 'HIGH',
        createdById: 'user1',
        createdBy: { id: 'user1', name: 'Test User' },
        createdAt: new Date(),
        updatedAt: new Date(),
        regulatoryRequirements: {
          framework: 'Ofsted',
          standardRef: 'EDU001',
          evidenceRequired: true,
        },
      };

      const isValid = await handoverService.validateChildrensHomeTask(task);
      expect(isValid).toBe(true);
    });
  });

  describe('Offline Support', () => {
    it('should save tasks offline when network is unavailable', async () => {
      const task: HandoverTask = {
        id: '3',
        handoverSessionId: 'session1',
        title: 'Offline Task',
        category: 'PERSONAL_CARE',
        status: 'PENDING',
        priority: 'MEDIUM',
        createdById: 'user1',
        createdBy: { id: 'user1', name: 'Test User' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await handoverService.saveTaskOffline(task);
      // Verify task is saved locally
      const savedTask = await handoverService['db'].get(`task_${task.id}`);
      expect(savedTask).toBeDefined();
      expect(savedTask.offlineSync.status).toBe('PENDING');
    });

    it('should sync offline tasks when network becomes available', async () => {
      // Mock network status
      jest.spyOn(handoverService['networkStatus'], 'isOnline', 'get')
        .mockReturnValue(true);

      await handoverService.syncOfflineTasks();
      // Verify sync status
      const tasks = await handoverService['db'].getAll();
      tasks.forEach(task => {
        expect(task.offlineSync.status).toBe('SYNCED');
      });
    });
  });

  describe('Security & Compliance', () => {
    it('should encrypt sensitive resident data', async () => {
      const task: HandoverTask = {
        id: '4',
        handoverSessionId: 'session1',
        title: 'Sensitive Task',
        category: 'CLINICAL_CARE',
        status: 'PENDING',
        priority: 'HIGH',
        createdById: 'user1',
        createdBy: { id: 'user1', name: 'Test User' },
        createdAt: new Date(),
        updatedAt: new Date(),
        resident: {
          id: 'resident1',
          name: 'John Doe',
          dateOfBirth: '1990-01-01',
          preferences: ['preference1', 'preference2'],
        },
      };

      const encryptedTask = await securityService.encryptSensitiveData(task);
      expect(encryptedTask.resident.dateOfBirth).not.toBe('1990-01-01');
      expect(typeof encryptedTask.resident.dateOfBirth).toBe('string');
    });

    it('should validate GDPR compliance', async () => {
      const task: HandoverTask = {
        id: '5',
        handoverSessionId: 'session1',
        title: 'GDPR Task',
        category: 'PERSONAL_CARE',
        status: 'PENDING',
        priority: 'MEDIUM',
        createdById: 'user1',
        createdBy: { id: 'user1', name: 'Test User' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const isCompliant = await securityService.validateGDPRCompliance(task);
      expect(isCompliant).toBe(true);
    });
  });
});
