import { PayrollService } from '../payroll-service';
import { PayrollCalculator } from '../payroll-calculator';
import { HMRCAdapter } from '@/lib/financial/services/accounting/hmrc';
import { TenantContext } from '@/lib/multi-tenant/types';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

jest.mock('../payroll-calculator');
jest.mock('@/lib/financial/services/accounting/hmrc');

describe('PayrollService', () => {
  let payrollService: PayrollService;
  let mockCalculator: jest.Mocked<PayrollCalculator>;
  let mockHMRCAdapter: jest.Mocked<HMRCAdapter>;
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
    mockCalculator = mockDeep<PayrollCalculator>();
    mockHMRCAdapter = mockDeep<HMRCAdapter>();
    mockPrisma = mockDeep<PrismaClient>();

    payrollService = new PayrollService(
      mockCalculator,
      mockHMRCAdapter,
      mockTenantContext
    );
  });

  describe('createPayrollPeriod', () => {
    const mockSettings = {
      id: '1',
      payPeriod: 'MONTHLY',
      taxYear: '2024-25'
    };

    it('should create a new payroll period', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockCalculator.calculatePayrollTotals.mockResolvedValueOnce({
        totalGross: 10000,
        totalNet: 8000,
        totalTax: 1500,
        totalNI: 500
      });

      const result = await payrollService.createPayrollPeriod(
        startDate,
        endDate,
        mockSettings
      );

      expect(result).toBeDefined();
      expect(result.startDate).toEqual(startDate);
      expect(result.endDate).toEqual(endDate);
      expect(mockCalculator.calculatePayrollTotals).toHaveBeenCalled();
    });

    it('should validate date ranges', async () => {
      const startDate = new Date('2024-01-31');
      const endDate = new Date('2024-01-01');

      await expect(
        payrollService.createPayrollPeriod(startDate, endDate, mockSettings)
      ).rejects.toThrow('Invalid date range');
    });
  });

  describe('processPayroll', () => {
    const mockPeriod = {
      id: '1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      status: 'DRAFT'
    };

    it('should process payroll successfully', async () => {
      mockCalculator.calculateEmployeePayroll.mockResolvedValueOnce({
        success: true,
        calculations: []
      });

      mockHMRCAdapter.submitPayroll.mockResolvedValueOnce({
        success: true,
        submissionId: 'test-submission'
      });

      const result = await payrollService.processPayroll(mockPeriod);

      expect(result.success).toBe(true);
      expect(mockCalculator.calculateEmployeePayroll).toHaveBeenCalled();
      expect(mockHMRCAdapter.submitPayroll).toHaveBeenCalled();
    });

    it('should handle calculation errors', async () => {
      mockCalculator.calculateEmployeePayroll.mockRejectedValueOnce(
        new Error('Calculation failed')
      );

      const result = await payrollService.processPayroll(mockPeriod);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Calculation failed');
    });
  });

  describe('getPayrollSummary', () => {
    it('should return payroll summary for period', async () => {
      const periodId = '1';
      const mockSummary = {
        totalEmployees: 10,
        totalGross: 50000,
        totalNet: 40000,
        totalTax: 8000,
        totalNI: 2000
      };

      mockCalculator.calculatePayrollSummary.mockResolvedValueOnce(mockSummary);

      const result = await payrollService.getPayrollSummary(periodId);

      expect(result).toEqual(mockSummary);
      expect(mockCalculator.calculatePayrollSummary).toHaveBeenCalledWith(periodId);
    });
  });
});
