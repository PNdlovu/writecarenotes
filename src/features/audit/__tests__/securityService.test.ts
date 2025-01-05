/**
 * @fileoverview Tests for security service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { SecurityService } from '../services/securityService';
import { SecurityOptions, ExportField } from '../types/export.types';

describe('SecurityService', () => {
  let service: SecurityService;
  const testData = Buffer.from('Test data for encryption');
  const testPassword = 'TestPassword123!';

  beforeEach(() => {
    // Reset singleton instance
    (SecurityService as any).instance = null;
    service = SecurityService.getInstance();
  });

  describe('Encryption', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const encrypted = await service.encryptData(testData, testPassword);
      const decrypted = await service.decryptData(encrypted, testPassword);

      expect(decrypted.toString()).toBe(testData.toString());
    });

    it('should fail decryption with wrong password', async () => {
      const encrypted = await service.encryptData(testData, testPassword);
      await expect(
        service.decryptData(encrypted, 'WrongPassword123!')
      ).rejects.toThrow();
    });

    it('should generate different encrypted data for same input', async () => {
      const encrypted1 = await service.encryptData(testData, testPassword);
      const encrypted2 = await service.encryptData(testData, testPassword);

      expect(encrypted1).not.toEqual(encrypted2);
    });
  });

  describe('Sensitive Data Masking', () => {
    const testFields: ExportField[] = [
      { key: 'id', label: 'ID', include: true },
      { key: 'name', label: 'Name', include: true, sensitive: true },
      { key: 'email', label: 'Email', include: true, sensitive: true },
    ];

    const testObject = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
    };

    it('should mask sensitive fields', () => {
      const options: SecurityOptions = {
        sensitiveFieldMask: 'XXXXX',
      };

      const masked = service.maskSensitiveData(testObject, testFields, options);

      expect(masked.id).toBe('123');
      expect(masked.name).toBe('XXXXX');
      expect(masked.email).toBe('XXXXX');
    });

    it('should handle arrays of objects', () => {
      const options: SecurityOptions = {
        sensitiveFieldMask: 'XXXXX',
      };

      const testArray = [testObject, testObject];
      const masked = service.maskSensitiveData(testArray, testFields, options);

      expect(masked).toHaveLength(2);
      masked.forEach(item => {
        expect(item.id).toBe('123');
        expect(item.name).toBe('XXXXX');
        expect(item.email).toBe('XXXXX');
      });
    });

    it('should use default mask if not provided', () => {
      const options: SecurityOptions = {};
      const masked = service.maskSensitiveData(testObject, testFields, options);

      expect(masked.name).toBe('XXXXX');
    });
  });

  describe('PDF Security Options', () => {
    it('should generate correct PDF security options', () => {
      const options: SecurityOptions = {
        password: 'TestPass123',
        allowPrinting: true,
        allowCopying: false,
        allowModifying: false,
      };

      const pdfOptions = service.getPDFSecurityOptions(options);

      expect(pdfOptions.userPassword).toBe('TestPass123');
      expect(pdfOptions.ownerPassword).toBeDefined();
      expect(pdfOptions.permissions.printing).toBe('highResolution');
      expect(pdfOptions.permissions.copying).toBe(false);
      expect(pdfOptions.permissions.modifying).toBe(false);
    });

    it('should disable printing when not allowed', () => {
      const options: SecurityOptions = {
        password: 'TestPass123',
        allowPrinting: false,
      };

      const pdfOptions = service.getPDFSecurityOptions(options);
      expect(pdfOptions.permissions.printing).toBe('none');
    });
  });

  describe('Validation', () => {
    it('should validate security options correctly', () => {
      const validOptions: SecurityOptions = {
        encrypt: true,
        password: 'ValidPassword123!',
      };

      expect(() => service.validateSecurityOptions(validOptions)).not.toThrow();
    });

    it('should require password when encryption is enabled', () => {
      const invalidOptions: SecurityOptions = {
        encrypt: true,
      };

      expect(() => service.validateSecurityOptions(invalidOptions)).toThrow(
        'Password is required when encryption is enabled'
      );
    });

    it('should validate password length', () => {
      const invalidOptions: SecurityOptions = {
        encrypt: true,
        password: 'short',
      };

      expect(() => service.validateSecurityOptions(invalidOptions)).toThrow(
        'Password must be at least 8 characters long'
      );
    });

    it('should validate expiration date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const invalidOptions: SecurityOptions = {
        encrypt: true,
        password: 'ValidPassword123!',
        expiresAt: pastDate,
      };

      expect(() => service.validateSecurityOptions(invalidOptions)).toThrow(
        'Expiration date must be in the future'
      );
    });
  });

  describe('Digital Signature', () => {
    it('should generate consistent signatures for same data', async () => {
      const signature1 = await service.generateSignature(testData);
      const signature2 = await service.generateSignature(testData);

      expect(signature1).toBe(signature2);
    });

    it('should generate different signatures for different data', async () => {
      const signature1 = await service.generateSignature(testData);
      const signature2 = await service.generateSignature(Buffer.from('Different data'));

      expect(signature1).not.toBe(signature2);
    });

    it('should generate valid hex string', async () => {
      const signature = await service.generateSignature(testData);
      expect(signature).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('Expiration', () => {
    it('should correctly identify expired exports', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const options: SecurityOptions = {
        expiresAt: pastDate,
      };

      expect(service.hasExpired(options)).toBe(true);
    });

    it('should correctly identify non-expired exports', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const options: SecurityOptions = {
        expiresAt: futureDate,
      };

      expect(service.hasExpired(options)).toBe(false);
    });

    it('should handle undefined expiration', () => {
      const options: SecurityOptions = {};
      expect(service.hasExpired(options)).toBe(false);
    });
  });
}); 


