import { PayrollPerformanceAdapter } from '../payroll-performance';
import { TenantContext } from '@/lib/multi-tenant/types';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('PayrollPerformanceAdapter', () => {
  let adapter: PayrollPerformanceAdapter;
  let mockPrisma: jest.Mocked<PrismaClient>;
  const mockTenantContext: TenantContext = {
    tenant: {
      id: 'test-tenant-id',
      name: 'Test Tenant',
      settings: {
        defaultLanguage: 'en',
        defaultCurrency: 'GBP'
      }
    }
  };

  beforeEach(() => {
    mockPrisma = mockDeep<PrismaClient>();
    adapter = new PayrollPerformanceAdapter(mockTenantContext);
  });

  describe('getPayrollPeriods', () => {
    it('should fetch and cache payroll periods', async () => {
      const mockPeriods = [
        {
          id: '1',
          startDate: new Date(),
          endDate: new Date(),
          status: 'DRAFT',
          totalGross: 1000,
          totalNet: 800,
          totalTax: 150,
          totalNI: 50
        }
      ];

      mockPrisma.payrollPeriod.findMany.mockResolvedValueOnce(mockPeriods);

      const result1 = await adapter.getPayrollPeriods(mockPrisma);
      expect(result1).toEqual(mockPeriods);
      expect(mockPrisma.payrollPeriod.findMany).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await adapter.getPayrollPeriods(mockPrisma);
      expect(result2).toEqual(mockPeriods);
      expect(mockPrisma.payrollPeriod.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPayrollSettings', () => {
    it('should fetch and cache payroll settings', async () => {
      const mockSettings = {
        id: '1',
        organizationId: 'test-tenant-id',
        payPeriod: 'MONTHLY',
        taxYear: '2024-25'
      };

      mockPrisma.payrollSettings.findFirst.mockResolvedValueOnce(mockSettings);

      const result1 = await adapter.getPayrollSettings(mockPrisma);
      expect(result1).toEqual(mockSettings);
      expect(mockPrisma.payrollSettings.findFirst).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await adapter.getPayrollSettings(mockPrisma);
      expect(result2).toEqual(mockSettings);
      expect(mockPrisma.payrollSettings.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearCache', () => {
    it('should clear cache for specific tenant', async () => {
      const mockPeriods = [{ id: '1' }];
      const mockSettings = { id: '1' };

      mockPrisma.payrollPeriod.findMany.mockResolvedValue(mockPeriods);
      mockPrisma.payrollSettings.findFirst.mockResolvedValue(mockSettings);

      await adapter.getPayrollPeriods(mockPrisma);
      await adapter.getPayrollSettings(mockPrisma);

      adapter.clearCache();

      await adapter.getPayrollPeriods(mockPrisma);
      await adapter.getPayrollSettings(mockPrisma);

      expect(mockPrisma.payrollPeriod.findMany).toHaveBeenCalledTimes(2);
      expect(mockPrisma.payrollSettings.findFirst).toHaveBeenCalledTimes(2);
    });
  });

  describe('optimizeBulkCalculations', () => {
    it('should process items in batches', async () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const calculator = jest.fn().mockImplementation(item => 
        Promise.resolve({ ...item, calculated: true })
      );

      const results = await adapter.optimizeBulkCalculations(items, calculator, 20);

      expect(results).toHaveLength(100);
      expect(calculator).toHaveBeenCalledTimes(100);
      results.forEach(result => {
        expect(result.calculated).toBe(true);
      });
    });
  });
});
