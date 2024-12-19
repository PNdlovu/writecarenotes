import { test, expect } from '@jest/globals';
import { SecurityService } from '../../services/securityService';
import { AuditService } from '../../services/auditService';
import { mockOrganization } from '../../__mocks__/organization.mock';
import { encrypt, decrypt } from '@/lib/crypto';

describe('Organization Security Tests', () => {
  let securityService: SecurityService;
  let auditService: AuditService;

  beforeEach(() => {
    securityService = new SecurityService();
    auditService = new AuditService();
  });

  test('should enforce password policies', async () => {
    const weakPassword = 'password123';
    const strongPassword = 'P@ssw0rd!2023';

    await expect(
      securityService.enforcePasswordPolicy({ password: weakPassword })
    ).rejects.toThrow('Password does not meet security requirements');

    await expect(
      securityService.enforcePasswordPolicy({ password: strongPassword })
    ).resolves.not.toThrow();
  });

  test('should handle PII data correctly', async () => {
    const sensitiveData = {
      name: 'John Doe',
      email: 'john@example.com',
      ssn: '123-45-6789'
    };

    const piiFields = [
      { name: 'email', type: 'encrypt' },
      { name: 'ssn', type: 'mask' }
    ];

    const processed = await securityService.handlePiiData(sensitiveData, piiFields);

    // Email should be encrypted
    expect(processed.email).not.toBe(sensitiveData.email);
    expect(await decrypt(processed.email)).toBe(sensitiveData.email);

    // SSN should be masked
    expect(processed.ssn).toBe('1XXXXX789');

    // Name should remain unchanged
    expect(processed.name).toBe(sensitiveData.name);
  });

  test('should maintain audit log integrity', async () => {
    const event = {
      type: 'organization.updated',
      organizationId: 'org_123',
      action: 'update_settings',
      changes: { name: 'New Name' }
    };

    await auditService.logEvent(event);

    const logs = await auditService.getAuditLog('org_123');
    const lastLog = logs[0];

    expect(lastLog.type).toBe(event.type);
    expect(lastLog.changes).toEqual(event.changes);
    expect(lastLog.timestamp).toBeDefined();
    expect(lastLog.userId).toBeDefined();
  });

  test('should prevent unauthorized data access', async () => {
    const unauthorized = {
      userId: 'user_123',
      roles: ['viewer']
    };

    await expect(
      securityService.enforceDataAccessPolicy(unauthorized, 'CONFIDENTIAL')
    ).rejects.toThrow('Unauthorized access');
  });

  test('should detect security breaches', async () => {
    const suspiciousActivity = {
      userId: 'user_123',
      attempts: 5,
      timeWindow: 300, // 5 minutes
      ipAddress: '192.168.1.1'
    };

    const result = await securityService.detectSecurityBreach(suspiciousActivity);
    expect(result.threatLevel).toBe('high');
    expect(result.action).toBe('block');
  });
});


