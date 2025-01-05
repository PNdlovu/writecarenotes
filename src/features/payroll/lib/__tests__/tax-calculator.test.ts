import { TaxCalculator } from '../tax-calculator';
import { Region } from '../types';

describe('TaxCalculator', () => {
  let calculator: TaxCalculator;

  beforeEach(() => {
    calculator = new TaxCalculator(Region.ENGLAND);
  });

  describe('calculatePayPeriodTax', () => {
    it('should calculate tax for basic rate taxpayer', () => {
      const result = calculator.calculatePayPeriodTax(30000, 'WEEKLY');
      
      expect(result.grossPay).toBe(576.92); // 30000 / 52
      expect(result.incomeTax).toBe(85.62); // Based on 20% tax rate
      expect(result.nationalInsurance).toBe(47.85); // Based on 12% NI rate
      expect(result.netPay).toBe(443.45);
    });

    it('should calculate tax for higher rate taxpayer', () => {
      const result = calculator.calculatePayPeriodTax(60000, 'WEEKLY');
      
      expect(result.grossPay).toBe(1153.85); // 60000 / 52
      expect(result.incomeTax).toBe(264.23); // Based on 40% tax rate
      expect(result.nationalInsurance).toBe(111.35); // Based on 2% higher rate
      expect(result.netPay).toBe(778.27);
    });

    it('should handle tax-free allowance correctly', () => {
      const result = calculator.calculatePayPeriodTax(12000, 'WEEKLY');
      
      expect(result.grossPay).toBe(230.77);
      expect(result.incomeTax).toBe(0); // Below personal allowance
      expect(result.nationalInsurance).toBe(8.12);
      expect(result.netPay).toBe(222.65);
    });

    it('should calculate monthly tax correctly', () => {
      const result = calculator.calculatePayPeriodTax(36000, 'MONTHLY');
      
      expect(result.grossPay).toBe(3000); // 36000 / 12
      expect(result.incomeTax).toBe(445.00);
      expect(result.nationalInsurance).toBe(248.88);
      expect(result.netPay).toBe(2306.12);
    });
  });

  describe('Regional variations', () => {
    it('should apply Scottish tax rates', () => {
      calculator = new TaxCalculator(Region.SCOTLAND);
      const result = calculator.calculatePayPeriodTax(45000, 'WEEKLY');
      
      // Scottish tax rates are different
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.nationalInsurance).toBeGreaterThan(0);
    });

    it('should apply Welsh tax rates', () => {
      calculator = new TaxCalculator(Region.WALES);
      const result = calculator.calculatePayPeriodTax(45000, 'WEEKLY');
      
      // Welsh rates currently match England
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.nationalInsurance).toBeGreaterThan(0);
    });

    it('should apply Northern Ireland tax rates', () => {
      calculator = new TaxCalculator(Region.NORTHERN_IRELAND);
      const result = calculator.calculatePayPeriodTax(45000, 'WEEKLY');
      
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.nationalInsurance).toBeGreaterThan(0);
    });

    it('should apply Ireland tax rates', () => {
      calculator = new TaxCalculator(Region.IRELAND);
      const result = calculator.calculatePayPeriodTax(45000, 'WEEKLY');
      
      // Irish tax system is different
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.nationalInsurance).toBeGreaterThan(0); // PRSI in Ireland
    });
  });

  describe('Tax code handling', () => {
    it('should handle standard tax code', () => {
      const result = calculator.calculatePayPeriodTax(30000, 'WEEKLY', '1257L');
      
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.nationalInsurance).toBeGreaterThan(0);
    });

    it('should handle emergency tax code', () => {
      const result = calculator.calculatePayPeriodTax(30000, 'WEEKLY', '1257L X');
      
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.nationalInsurance).toBeGreaterThan(0);
    });

    it('should handle NT tax code', () => {
      const result = calculator.calculatePayPeriodTax(30000, 'WEEKLY', 'NT');
      
      expect(result.incomeTax).toBe(0); // No tax
      expect(result.nationalInsurance).toBeGreaterThan(0);
    });

    it('should handle BR tax code', () => {
      const result = calculator.calculatePayPeriodTax(30000, 'WEEKLY', 'BR');
      
      expect(result.incomeTax).toBe(115.38); // Basic rate on all income
      expect(result.nationalInsurance).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero income', () => {
      const result = calculator.calculatePayPeriodTax(0, 'WEEKLY');
      
      expect(result.grossPay).toBe(0);
      expect(result.incomeTax).toBe(0);
      expect(result.nationalInsurance).toBe(0);
      expect(result.netPay).toBe(0);
    });

    it('should handle very high income', () => {
      const result = calculator.calculatePayPeriodTax(1000000, 'WEEKLY');
      
      expect(result.grossPay).toBe(19230.77);
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.nationalInsurance).toBeGreaterThan(0);
      expect(result.netPay).toBeLessThan(result.grossPay);
    });

    it('should handle invalid period type', () => {
      expect(() => {
        calculator.calculatePayPeriodTax(30000, 'INVALID' as any);
      }).toThrow();
    });

    it('should handle negative income', () => {
      expect(() => {
        calculator.calculatePayPeriodTax(-1000, 'WEEKLY');
      }).toThrow();
    });
  });
}); 