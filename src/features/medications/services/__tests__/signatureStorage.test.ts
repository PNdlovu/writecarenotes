import { signatureStorage } from '../signatureStorage';
import { SignatureVerification } from '../../types/verification';

// Mock data
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

describe('SignatureStorageService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('storeSignature', () => {
    it('should encrypt and store signature', async () => {
      const id = await signatureStorage.storeSignature(mockSignature);

      expect(id).toBe(mockSignature.id);
      expect(localStorage.getItem(`signature_${id}`)).toBeTruthy();
    });

    it('should handle encryption errors', async () => {
      const invalidSignature = { ...mockSignature, signatureData: null };

      await expect(
        signatureStorage.storeSignature(invalidSignature as SignatureVerification)
      ).rejects.toThrow('Failed to store signature securely');
    });
  });

  describe('retrieveSignature', () => {
    it('should retrieve and decrypt signature', async () => {
      // First store the signature
      await signatureStorage.storeSignature(mockSignature);

      // Then retrieve it
      const retrievedData = await signatureStorage.retrieveSignature(mockSignature.id);

      expect(retrievedData).toBe(mockSignature.signatureData);
    });

    it('should handle missing signatures', async () => {
      await expect(
        signatureStorage.retrieveSignature('non-existent-id')
      ).rejects.toThrow('Signature not found');
    });
  });

  describe('deleteSignature', () => {
    it('should delete stored signature', async () => {
      // First store the signature
      await signatureStorage.storeSignature(mockSignature);

      // Then delete it
      await signatureStorage.deleteSignature(mockSignature.id);

      expect(
        localStorage.getItem(`signature_${mockSignature.id}`)
      ).toBeNull();
    });
  });

  describe('validateSignature', () => {
    it('should return true for valid signatures', async () => {
      // First store the signature
      await signatureStorage.storeSignature(mockSignature);

      const isValid = await signatureStorage.validateSignature(mockSignature.id);

      expect(isValid).toBe(true);
    });

    it('should return false for invalid signatures', async () => {
      const isValid = await signatureStorage.validateSignature('non-existent-id');

      expect(isValid).toBe(false);
    });
  });
});


