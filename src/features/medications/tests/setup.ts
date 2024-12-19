import { prisma } from '@/lib/db';
import { Cache } from '@/lib/cache';
import { Logger } from '@/lib/logger';

// Mock external services
jest.mock('@/lib/db', () => ({
  prisma: {
    medication: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    medicationAdministration: {
      findMany: jest.fn(),
      create: jest.fn()
    },
    tenant: {
      findUnique: jest.fn()
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn()
    }
  }
}));

jest.mock('@/lib/cache', () => ({
  Cache: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  }))
}));

jest.mock('@/lib/logger', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }))
}));

// Test data factories
export const createTestMedication = (overrides = {}) => ({
  id: 'med_123',
  name: 'Test Medication',
  dosage: '10mg',
  frequency: 'daily',
  active: true,
  residentId: 'resident_123',
  tenantId: 'tenant_123',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createTestAdministration = (overrides = {}) => ({
  id: 'admin_123',
  medicationId: 'med_123',
  administeredBy: 'user_123',
  scheduledTime: new Date(),
  actualTime: new Date(),
  status: 'COMPLETED',
  notes: 'Test notes',
  ...overrides
});

export const createTestTenant = (overrides = {}) => ({
  id: 'tenant_123',
  name: 'Test Care Home',
  subscriptionTier: 'professional',
  active: true,
  settings: {
    medicationSettings: {
      enableAIAnalytics: true,
      enableAdvancedSafety: true
    }
  },
  ...overrides
});

// Test utilities
export const clearMocks = () => {
  jest.clearAllMocks();
};

export const expectAuditLog = (expectedData: any) => {
  expect(prisma.auditLog.create).toHaveBeenCalledWith({
    data: expect.objectContaining(expectedData)
  });
};

export const mockPrismaResponse = (model: string, method: string, response: any) => {
  prisma[model][method].mockResolvedValueOnce(response);
};

export const mockCacheResponse = (response: any) => {
  const cache = new Cache();
  cache.get.mockResolvedValueOnce(response);
  return cache;
};

// Test middleware
export const mockAuthenticatedRequest = (overrides = {}) => ({
  user: {
    id: 'user_123',
    tenantId: 'tenant_123',
    role: 'CARE_STAFF',
    permissions: ['VIEW_MEDICATIONS', 'ADMINISTER_MEDICATIONS']
  },
  ...overrides
});

export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Setup and teardown helpers
export const setupTestDatabase = async () => {
  // Add any test database setup logic
};

export const teardownTestDatabase = async () => {
  // Add any test database teardown logic
};

// Performance testing utilities
export const measureExecutionTime = async (fn: () => Promise<any>) => {
  const start = process.hrtime();
  await fn();
  const [seconds, nanoseconds] = process.hrtime(start);
  return seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
};


