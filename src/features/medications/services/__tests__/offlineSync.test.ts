import { offlineSync } from '../offlineSync';
import { ParentalConsent } from '../../types/consent';
import { SignatureVerification } from '../../types/verification';

// Mock data
const mockConsent: Partial<ParentalConsent> = {
  id: 'consent-123',
  residentId: 'res-123',
  medicationId: 'med-123',
  status: 'PENDING',
  familyPortalRequestId: 'fp-123',
  familyPortalStatus: 'PENDING_REVIEW'
};

const mockSignature: SignatureVerification = {
  id: 'sig-123',
  type: 'PARENTAL_CONSENT',
  method: 'SIGNATURE',
  signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  verifiedAt: '2024-12-09T22:32:37Z',
  verifiedBy: {
    id: 'user-123',
    name: 'Jane Doe',
    role: 'PARENT'
  }
};

describe('OfflineSyncService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('queueConsentForSync', () => {
    it('should add consent to sync queue', async () => {
      await offlineSync.queueConsentForSync(mockConsent as ParentalConsent);

      const status = await offlineSync.getStatus();
      expect(status.pendingItems).toBe(1);
    });

    it('should handle multiple consent items', async () => {
      await offlineSync.queueConsentForSync(mockConsent as ParentalConsent);
      await offlineSync.queueConsentForSync({
        ...mockConsent,
        id: 'consent-456'
      } as ParentalConsent);

      const status = await offlineSync.getStatus();
      expect(status.pendingItems).toBe(2);
    });
  });

  describe('queueSignatureForSync', () => {
    it('should add signature to sync queue', async () => {
      await offlineSync.queueSignatureForSync(
        mockSignature,
        mockConsent.id as string
      );

      const status = await offlineSync.getStatus();
      expect(status.pendingItems).toBe(1);
    });
  });

  describe('getStatus', () => {
    it('should return correct sync status', async () => {
      // Add some items to queue
      await offlineSync.queueConsentForSync(mockConsent as ParentalConsent);
      await offlineSync.queueSignatureForSync(
        mockSignature,
        mockConsent.id as string
      );

      const status = await offlineSync.getStatus();
      expect(status).toEqual({
        pendingItems: 2,
        failedItems: 0,
        inProgress: false
      });
    });
  });

  describe('retryFailedItems', () => {
    it('should reset failed items for retry', async () => {
      // First add and process some items
      await offlineSync.queueConsentForSync(mockConsent as ParentalConsent);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Retry failed items
      await offlineSync.retryFailedItems();

      const status = await offlineSync.getStatus();
      expect(status.failedItems).toBe(0);
    });
  });

  // Test sync event handling
  describe('sync events', () => {
    it('should emit sync events', async () => {
      const eventHandler = jest.fn();
      window.addEventListener('consentSync', eventHandler);

      await offlineSync.queueConsentForSync(mockConsent as ParentalConsent);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(eventHandler).toHaveBeenCalled();

      window.removeEventListener('consentSync', eventHandler);
    });
  });
});


