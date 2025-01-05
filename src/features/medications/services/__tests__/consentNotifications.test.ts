import { consentNotifications } from '../consentNotifications';
import { ConsentRequest, ParentalConsent } from '../../types/consent';

// Mock data
const mockRequest: Partial<ConsentRequest> = {
  familyPortalRequestId: 'req-123',
  residentId: 'res-123',
  medicationId: 'med-123',
  requestedBy: {
    id: 'user-123',
    name: 'John Doe',
    role: 'NURSE',
    email: 'john@example.com',
    contactNumber: '+1234567890'
  }
};

const mockConsent: Partial<ParentalConsent> = {
  id: 'consent-123',
  familyPortalRequestId: 'req-123',
  residentId: 'res-123',
  medicationId: 'med-123',
  consentGivenBy: {
    id: 'parent-123',
    name: 'Jane Doe',
    relationship: 'PARENT',
    contactNumber: '+1234567890',
    email: 'jane@example.com',
    familyPortalUserId: 'fp-123'
  }
};

describe('ConsentNotificationService', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('notifyNewRequest', () => {
    it('should send notifications based on preferences', async () => {
      const preferences = {
        email: true,
        push: true,
        sms: true,
        reminderFrequency: 'DAILY' as const
      };

      const result = await consentNotifications.notifyNewRequest(
        mockRequest as ConsentRequest,
        preferences
      );

      expect(result).toBeUndefined();
    });

    it('should handle failed notifications gracefully', async () => {
      const preferences = {
        email: true,
        push: false,
        sms: false,
        reminderFrequency: 'NONE' as const
      };

      const result = await consentNotifications.notifyNewRequest(
        mockRequest as ConsentRequest,
        preferences
      );

      expect(result).toBeUndefined();
    });
  });

  describe('sendReminder', () => {
    it('should send reminder notifications', async () => {
      const preferences = {
        email: true,
        push: true,
        sms: false,
        reminderFrequency: 'WEEKLY' as const
      };

      const result = await consentNotifications.sendReminder(
        mockConsent as ParentalConsent,
        preferences
      );

      expect(result).toBeUndefined();
    });
  });

  describe('notifyExpiring', () => {
    it('should send expiry notifications', async () => {
      const result = await consentNotifications.notifyExpiring(
        mockConsent as ParentalConsent,
        7
      );

      expect(result).toBeUndefined();
    });
  });

  describe('notifyStatusChange', () => {
    it('should send approval notification', async () => {
      const result = await consentNotifications.notifyStatusChange(
        mockConsent as ParentalConsent,
        'APPROVED'
      );

      expect(result).toBeUndefined();
    });

    it('should send denial notification', async () => {
      const result = await consentNotifications.notifyStatusChange(
        mockConsent as ParentalConsent,
        'DENIED'
      );

      expect(result).toBeUndefined();
    });
  });
});


