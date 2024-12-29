import { NotificationService } from '../../services/notification-service';
import { mockTask, mockStaff } from '../utils/test-helpers';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  const mockEmailService = {
    send: jest.fn(),
  };
  const mockSmsService = {
    send: jest.fn(),
  };
  const mockPushService = {
    send: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    notificationService = new NotificationService(
      mockEmailService,
      mockSmsService,
      mockPushService
    );
  });

  describe('initialize', () => {
    it('loads rules and preferences on initialization', async () => {
      await notificationService.initialize();
      
      const rules = notificationService.getRules();
      expect(rules).toHaveLength(1);
      expect(rules[0].name).toBe('High Priority Task Assignment');
    });
  });

  describe('rule management', () => {
    it('adds new notification rule', async () => {
      const newRule = {
        name: 'Test Rule',
        eventType: 'TASK_CREATED',
        conditions: [
          {
            field: 'status',
            operator: 'equals' as const,
            value: 'PENDING',
          },
        ],
        actions: [
          {
            type: 'IMMEDIATE',
            channel: 'EMAIL',
            template: 'TASK_CREATED',
            recipients: ['assignee'],
          },
        ],
        enabled: true,
      };

      const rule = await notificationService.addRule(newRule);
      expect(rule.id).toBeDefined();
      expect(rule.name).toBe('Test Rule');
    });

    it('updates existing rule', async () => {
      const rules = notificationService.getRules();
      const ruleId = rules[0].id;

      await notificationService.updateRule(ruleId, {
        name: 'Updated Rule',
      });

      const updatedRules = notificationService.getRules();
      expect(updatedRules[0].name).toBe('Updated Rule');
    });

    it('deletes rule', async () => {
      const rules = notificationService.getRules();
      const ruleId = rules[0].id;

      await notificationService.deleteRule(ruleId);
      
      const remainingRules = notificationService.getRules();
      expect(remainingRules).toHaveLength(0);
    });
  });

  describe('preference management', () => {
    const userId = 'user-1';
    const preferences = {
      channels: {
        email: true,
        sms: false,
        push: true,
      },
      frequency: 'IMMEDIATE',
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:00',
      },
    };

    it('updates user preferences', async () => {
      await notificationService.updatePreferences(userId, preferences);
      
      const savedPreferences = notificationService.getPreferences(userId);
      expect(savedPreferences).toEqual(preferences);
    });

    it('respects quiet hours when sending notifications', async () => {
      await notificationService.updatePreferences(userId, preferences);

      // Mock current time to be during quiet hours
      const mockDate = new Date('2024-01-01T23:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      // Trigger a notification
      const event = new CustomEvent('handover:event', {
        detail: {
          type: 'TASK_ASSIGNED',
          data: {
            ...mockTask,
            priority: 'HIGH',
            assignedTo: { ...mockStaff, id: userId },
          },
        },
      });
      window.dispatchEvent(event);

      expect(mockEmailService.send).not.toHaveBeenCalled();
      expect(mockPushService.send).not.toHaveBeenCalled();
    });
  });

  describe('notification handling', () => {
    it('sends notifications based on rules', async () => {
      // Initialize with default rules
      await notificationService.initialize();

      // Trigger a high priority task assignment
      const event = new CustomEvent('handover:event', {
        detail: {
          type: 'TASK_ASSIGNED',
          data: {
            ...mockTask,
            priority: 'HIGH',
            assignedTo: mockStaff,
          },
        },
      });
      window.dispatchEvent(event);

      expect(mockEmailService.send).toHaveBeenCalledWith(
        mockStaff.id,
        expect.any(String)
      );
      expect(mockPushService.send).toHaveBeenCalledWith(
        mockStaff.id,
        expect.any(String)
      );
    });

    it('evaluates conditions correctly', async () => {
      await notificationService.initialize();

      // Trigger a low priority task assignment (shouldn't notify)
      const event = new CustomEvent('handover:event', {
        detail: {
          type: 'TASK_ASSIGNED',
          data: {
            ...mockTask,
            priority: 'LOW',
            assignedTo: mockStaff,
          },
        },
      });
      window.dispatchEvent(event);

      expect(mockEmailService.send).not.toHaveBeenCalled();
      expect(mockPushService.send).not.toHaveBeenCalled();
    });

    it('handles template rendering', async () => {
      await notificationService.initialize();

      const taskName = 'Critical Task';
      const event = new CustomEvent('handover:event', {
        detail: {
          type: 'TASK_ASSIGNED',
          data: {
            ...mockTask,
            name: taskName,
            priority: 'HIGH',
            assignedTo: mockStaff,
          },
        },
      });
      window.dispatchEvent(event);

      expect(mockEmailService.send).toHaveBeenCalledWith(
        mockStaff.id,
        expect.stringContaining(taskName)
      );
    });
  });
});
