import { PayrollService } from '../services/payroll-service';
import { PayrollCalculator } from '../services/payroll-calculator';
import { RegionalPayrollConfig } from '../services/regional-config';
import { PayrollOfflineSync } from '../services/offline-sync';
import { IndexedDBStorage } from '@/lib/storage/indexed-db';
import { Region, TaxYear } from '../types';
import { TenantContext } from '@/lib/multi-tenant/types';
import { mock, MockProxy } from 'jest-mock-extended';

describe('PayrollService', () => {
  let payrollService: PayrollService;
  let mockTenantContext: MockProxy<TenantContext>;
  let mockStorage: MockProxy<IndexedDBStorage>;

  beforeEach(() => {
    mockTenantContext = mock<TenantContext>();
    mockStorage = mock<IndexedDBStorage>();

    mockTenantContext.tenant = {
      id: 'test-tenant',
      name: 'Test Tenant',
      region: Region.ENGLAND
    };

    payrollService = new PayrollService(mockTenantContext, mockStorage);
  });

  describe('calculatePayroll', () => {
    it('should calculate payroll and store result', async () => {
      const employeeId = 'emp-123';
      const grossPay = 50000;
      const region = Region.ENGLAND;
      const taxYear = TaxYear.Y2024_2025;

      const result = await payrollService.calculatePayroll(
        employeeId,
        grossPay,
        region,
        taxYear
      );

      expect(result).toBeDefined();
      expect(result.grossPay).toBe(grossPay);
      expect(result.netPay).toBeDefined();
      expect(result.deductions).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      const employeeId = 'emp-123';
      const grossPay = -1; // Invalid input

      await expect(
        payrollService.calculatePayroll(
          employeeId,
          grossPay,
          Region.ENGLAND,
          TaxYear.Y2024_2025
        )
      ).rejects.toThrow('Failed to calculate payroll');
    });
  });

  describe('getStoredPayroll', () => {
    it('should retrieve stored payroll data', async () => {
      const payrollId = 'test-payroll-123';
      const mockPayrollData = {
        id: payrollId,
        employeeId: 'emp-123',
        summary: {
          grossPay: 50000,
          netPay: 35000,
          deductions: []
        },
        region: Region.ENGLAND,
        taxYear: TaxYear.Y2024_2025,
        lastModified: Date.now()
      };

      mockStorage.get.mockResolvedValue(mockPayrollData);

      const result = await payrollService.getStoredPayroll(payrollId);

      expect(result).toEqual(mockPayrollData);
    });

    it('should return null for non-existent payroll', async () => {
      mockStorage.get.mockResolvedValue(null);

      const result = await payrollService.getStoredPayroll('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getTranslations', () => {
    it('should return translations for specified region', async () => {
      const mockTranslations = {
        salary: 'Salary',
        tax: 'Tax'
      };

      mockStorage.get.mockResolvedValue(mockTranslations);

      const result = await payrollService.getTranslations(Region.ENGLAND);

      expect(result).toEqual(mockTranslations);
    });
  });

  describe('syncChanges', () => {
    it('should process sync queue successfully', async () => {
      const syncPromise = payrollService.syncChanges();

      await expect(syncPromise).resolves.not.toThrow();
    });
  });

  describe('clearCache', () => {
    it('should clear all caches', async () => {
      mockStorage.clear.mockResolvedValue();

      await payrollService.clearCache();

      expect(mockStorage.clear).toHaveBeenCalled();
    });
  });
});
