import { PayrollCalculator } from '../payroll-calculator';
import { RegionalPayrollConfig } from '../regional-config';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

jest.mock('../regional-config');

describe('PayrollCalculator', () => {
  let calculator: PayrollCalculator;
  let mockRegionalConfig: jest.Mocked<RegionalPayrollConfig>;
  let mockPrisma: jest.Mocked<PrismaClient>;
  const tenantId = 'test-tenant-id';

  beforeEach(() => {
    mockRegionalConfig = mockDeep<RegionalPayrollConfig>();
    mockPrisma = mockDeep<PrismaClient>();
    calculator = new PayrollCalculator('en-GB', tenantId);
  });

  describe('calculateEmployeePayroll', () => {
    const mockEmployee = {
      id: '1',
      salary: 50000,
      taxCode: '1250L',
      niCategory: 'A'
    };

    beforeEach(() => {
      mockRegionalConfig.getTaxRates.mockResolvedValue({
        personalAllowance: 12570,
        bands: [
          { name: 'Basic rate', rate: 20, threshold: 12571 },
          { name: 'Higher rate', rate: 40, threshold: 50271 }
        ]
      });

      mockRegionalConfig.getNIRates.mockResolvedValue({
        primaryThreshold: 1048,
        upperEarningsLimit: 4189,
        primaryRate: 12,
        upperRate: 2
      });
    });

    it('should calculate correct tax and NI deductions', async () => {
      const result = await calculator.calculateEmployeePayroll(mockEmployee);

      expect(result).toEqual(expect.objectContaining({
        grossPay: 4166.67, // £50,000 / 12
        taxableIncome: 3125.00, // (£50,000 - £12,570) / 12
        incomeTax: 625.00, // 20% of taxable income
        nationalInsurance: expect.any(Number),
        netPay: expect.any(Number)
      }));
    });

    it('should handle tax code modifiers', async () => {
      const employeeWithModifier = {
        ...mockEmployee,
        taxCode: 'K500'
      };

      const result = await calculator.calculateEmployeePayroll(employeeWithModifier);
      expect(result.taxableIncome).toBeGreaterThan(result.grossPay);
    });

    it('should apply correct NI category rates', async () => {
      const employeeWithDiffCategory = {
        ...mockEmployee,
        niCategory: 'B'
      };

      const result = await calculator.calculateEmployeePayroll(employeeWithDiffCategory);
      expect(result.nationalInsurance).toBeLessThan(
        (await calculator.calculateEmployeePayroll(mockEmployee)).nationalInsurance
      );
    });
  });

  describe('calculatePayrollTotals', () => {
    const mockEmployees = [
      { id: '1', salary: 30000 },
      { id: '2', salary: 45000 },
      { id: '3', salary: 60000 }
    ];

    it('should calculate totals for all employees', async () => {
      mockPrisma.employee.findMany.mockResolvedValue(mockEmployees);

      const result = await calculator.calculatePayrollTotals(mockPrisma);

      expect(result).toEqual(expect.objectContaining({
        totalGross: expect.any(Number),
        totalNet: expect.any(Number),
        totalTax: expect.any(Number),
        totalNI: expect.any(Number)
      }));

      expect(result.totalGross).toBeGreaterThan(result.totalNet);
    });

    it('should handle empty employee list', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([]);

      const result = await calculator.calculatePayrollTotals(mockPrisma);

      expect(result).toEqual({
        totalGross: 0,
        totalNet: 0,
        totalTax: 0,
        totalNI: 0
      });
    });
  });

  describe('calculatePayrollSummary', () => {
    const periodId = '1';
    const mockTransactions = [
      { amount: 1000, type: 'SALARY' },
      { amount: 200, type: 'BONUS' },
      { amount: -150, type: 'TAX' },
      { amount: -50, type: 'NI' }
    ];

    it('should generate correct summary', async () => {
      mockPrisma.payrollTransaction.findMany.mockResolvedValue(mockTransactions);

      const result = await calculator.calculatePayrollSummary(periodId);

      expect(result).toEqual(expect.objectContaining({
        totalGross: 1200,
        totalDeductions: 200,
        totalNet: 1000,
        transactionCount: 4
      }));
    });

    it('should categorize transactions correctly', async () => {
      mockPrisma.payrollTransaction.findMany.mockResolvedValue(mockTransactions);

      const result = await calculator.calculatePayrollSummary(periodId);

      expect(result.categories).toEqual(expect.objectContaining({
        salary: 1000,
        bonus: 200,
        tax: 150,
        ni: 50
      }));
    });
  });

  describe('Tax Calculations', () => {
    it('should calculate emergency tax correctly', async () => {
      const result = await calculator.calculateEmergencyTax(3000);
      expect(result).toBeGreaterThan(0);
    });

    it('should handle tax code adjustments', () => {
      expect(calculator.adjustTaxCode('1257L', 10)).toBe('1267L');
      expect(calculator.adjustTaxCode('K500', -50)).toBe('K450');
    });
  });
});
