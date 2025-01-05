import { describe, expect, test } from '@jest/globals';
import { SecurityService } from '@/lib/security';

describe('SecurityService', () => {
  let securityService: SecurityService;

  beforeEach(() => {
    securityService = new SecurityService();
  });

  test('should validate password strength', () => {
    expect(securityService.validatePassword('weak')).toBe(false);
    expect(securityService.validatePassword('StrongP@ssw0rd')).toBe(true);
  });

  test('should handle password hashing', async () => {
    const password = 'SecureP@ssw0rd';
    const hash = await securityService.hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(await securityService.verifyPassword(password, hash)).toBe(true);
  });

  test('should generate and verify tokens', () => {
    const payload = { userId: '123', role: 'admin' };
    const token = securityService.generateToken(payload);
    
    expect(token).toBeDefined();
    const verified = securityService.verifyToken(token);
    expect(verified).toMatchObject(payload);
  });

  test('should handle session management', () => {
    const sessionId = securityService.createSession({ userId: '123' });
    expect(securityService.validateSession(sessionId)).toBe(true);
    
    securityService.invalidateSession(sessionId);
    expect(securityService.validateSession(sessionId)).toBe(false);
  });

  test('should enforce rate limiting', async () => {
    const ip = '127.0.0.1';
    
    // Should allow initial requests
    for (let i = 0; i < 5; i++) {
      expect(await securityService.checkRateLimit(ip)).toBe(true);
    }
    
    // Should block excessive requests
    expect(await securityService.checkRateLimit(ip)).toBe(false);
  });

  test('should detect suspicious activities', () => {
    const activity = {
      userId: '123',
      action: 'login',
      ip: '127.0.0.1',
      timestamp: new Date(),
      userAgent: 'Mozilla/5.0'
    };

    expect(securityService.detectSuspiciousActivity(activity)).toBe(false);
  });
}); 