import { RegionalPayrollConfig } from '../regional-config';
import { mockDeep } from 'jest-mock-extended';

describe('RegionalPayrollConfig', () => {
  let config: RegionalPayrollConfig;
  const mockTenantId = 'test-tenant-id';

  beforeEach(() => {
    config = new RegionalPayrollConfig('en-GB', mockTenantId);
  });

  describe('Tax Rates', () => {
    it('should load correct tax rates for England', async () => {
      const rates = await config.getTaxRates('england');
      expect(rates).toBeDefined();
      expect(rates.personalAllowance).toBe(12570);
      expect(rates.bands).toEqual(expect.arrayContaining([
        expect.objectContaining({
          name: 'Basic rate',
          rate: 20,
          threshold: 12571
        })
      ]));
    });

    it('should load correct tax rates for Scotland', async () => {
      const rates = await config.getTaxRates('scotland');
      expect(rates).toBeDefined();
      expect(rates.bands).toEqual(expect.arrayContaining([
        expect.objectContaining({
          name: 'Starter rate',
          rate: 19,
          threshold: 12571
        })
      ]));
    });

    it('should throw error for invalid region', async () => {
      await expect(config.getTaxRates('invalid-region')).rejects.toThrow(
        'Invalid region specified'
      );
    });
  });

  describe('NI Rates', () => {
    it('should load correct NI rates', async () => {
      const rates = await config.getNIRates();
      expect(rates).toBeDefined();
      expect(rates.primaryThreshold).toBeDefined();
      expect(rates.upperEarningsLimit).toBeDefined();
    });

    it('should cache NI rates', async () => {
      const spy = jest.spyOn(config as any, 'fetchNIRates');
      
      await config.getNIRates();
      await config.getNIRates();
      
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Currency Formatting', () => {
    it('should format currency according to region', () => {
      expect(config.formatCurrency(1234.56)).toBe('£1,234.56');
    });

    it('should handle negative amounts', () => {
      expect(config.formatCurrency(-1234.56)).toBe('-£1,234.56');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates according to region', () => {
      const date = new Date('2024-01-01');
      expect(config.formatDate(date)).toBe('01/01/2024');
    });

    it('should parse dates according to region', () => {
      const dateStr = '01/01/2024';
      const date = config.parseDate(dateStr);
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2024);
    });
  });

  describe('Language Support', () => {
    it('should provide translations for payroll terms', () => {
      expect(config.translate('gross_pay')).toBe('Gross Pay');
      expect(config.translate('net_pay')).toBe('Net Pay');
    });

    it('should fall back to default language if translation missing', () => {
      const nonExistentKey = 'non_existent_key';
      expect(config.translate(nonExistentKey)).toBe(nonExistentKey);
    });
  });

  describe('Tax Year', () => {
    it('should determine correct tax year for date', () => {
      const date = new Date('2024-04-06');
      const taxYear = config.getTaxYear(date);
      expect(taxYear).toBe('2024-25');
    });

    it('should handle dates at tax year boundary', () => {
      const endOfTaxYear = new Date('2024-04-05');
      const startOfTaxYear = new Date('2024-04-06');
      
      expect(config.getTaxYear(endOfTaxYear)).toBe('2023-24');
      expect(config.getTaxYear(startOfTaxYear)).toBe('2024-25');
    });
  });

  describe('Cache Management', () => {
    it('should clear cache for tenant', async () => {
      await config.getNIRates(); // Cache some data
      config.clearCache();
      
      const spy = jest.spyOn(config as any, 'fetchNIRates');
      await config.getNIRates();
      
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
