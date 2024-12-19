import { PayrollCalculator } from '../services/payroll-calculator';
import { TenantContext } from '@/lib/multi-tenant/types';
import { mock, MockProxy } from 'jest-mock-extended';
import { NICategory } from '../types';

describe('PayrollCalculator', () => {
  let calculator: PayrollCalculator;
  let mockTenantContext: MockProxy<TenantContext>;

  beforeEach(() => {
    mockTenantContext = mock<TenantContext>();
    mockTenantContext.tenant = {
      id: 'test-tenant',
      name: 'Test Tenant'
    };
    calculator = new PayrollCalculator(mockTenantContext);
  });

  describe('calculateTaxableIncome', () => {
    it('should calculate basic rate tax correctly', async () => {
      const grossPay = 30000;
      const taxBands = [
        { min: 0, max: 12570, rate: 0 },
        { min: 12571, max: 50270, rate: 0.2 }
      ];

      const result = await calculator.calculateTaxableIncome(grossPay, taxBands);

      // Expected tax: (30000 - 12570) * 0.2
      expect(result.tax).toBe(3486);
      expect(result.taxableIncome).toBe(17430);
    });

    it('should handle K tax codes', async () => {
      const grossPay = 30000;
      const taxBands = [
        { min: 0, max: 12570, rate: 0 },
        { min: 12571, max: 50270, rate: 0.2 }
      ];
      const rates = {
        taxCode: 'K500'
      };

      const result = await calculator.calculateTaxableIncome(grossPay, taxBands, rates);

      // K500 adds £5000 to taxable income
      expect(result.taxableIncome).toBe(22430);
    });

    it('should handle emergency tax codes', async () => {
      const grossPay = 30000;
      const taxBands = [
        { min: 0, max: 12570, rate: 0 },
        { min: 12571, max: 50270, rate: 0.2 }
      ];
      const rates = {
        taxCode: '1257L X'
      };

      const result = await calculator.calculateTaxableIncome(grossPay, taxBands, rates);

      // Emergency tax should use basic rate
      expect(result.tax).toBe(3486);
    });
  });

  describe('calculateNIContributions', () => {
    it('should calculate NI correctly for category A', async () => {
      const grossPay = 30000;
      const rates = {
        niCategory: NICategory.A
      };

      const result = await calculator.calculateNIContributions(grossPay, rates);

      expect(result.employeeNI).toBeGreaterThan(0);
      expect(result.employerNI).toBeGreaterThan(0);
    });

    it('should handle reduced rate NI categories', async () => {
      const grossPay = 30000;
      const rates = {
        niCategory: NICategory.B
      };

      const result = await calculator.calculateNIContributions(grossPay, rates);

      expect(result.employeeNI).toBeGreaterThan(0);
      expect(result.employeeNI).toBeLessThan(
        (await calculator.calculateNIContributions(grossPay, { niCategory: NICategory.A })).employeeNI
      );
    });
  });

  describe('calculatePayrollSummary', () => {
    it('should generate complete payroll summary', async () => {
      const grossPay = 30000;
      const taxBands = [
        { min: 0, max: 12570, rate: 0 },
        { min: 12571, max: 50270, rate: 0.2 }
      ];
      const rates = {
        niCategory: NICategory.A,
        taxCode: '1257L',
        pensionContribution: 0.05
      };

      const result = await calculator.calculatePayrollSummary(grossPay, taxBands, rates);

      expect(result.grossPay).toBe(grossPay);
      expect(result.netPay).toBeDefined();
      expect(result.deductions).toHaveLength(3); // Tax, NI, and Pension
      expect(result.yearToDate).toBeDefined();
    });

    it('should handle zero gross pay', async () => {
      const grossPay = 0;
      const taxBands = [
        { min: 0, max: 12570, rate: 0 },
        { min: 12571, max: 50270, rate: 0.2 }
      ];

      const result = await calculator.calculatePayrollSummary(grossPay, taxBands);

      expect(result.grossPay).toBe(0);
      expect(result.netPay).toBe(0);
      expect(result.deductions).toHaveLength(0);
    });
  });
});
