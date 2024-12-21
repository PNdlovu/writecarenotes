import { RegionalPayrollConfig } from '../services/regional-config';
import { TenantContext } from '@/lib/multi-tenant/types';
import { Region, TaxYear } from '../types';
import { mock, MockProxy } from 'jest-mock-extended';
import { Cache } from '@/lib/cache';

jest.mock('@/lib/cache');

describe('RegionalPayrollConfig', () => {
  let config: RegionalPayrollConfig;
  let mockTenantContext: MockProxy<TenantContext>;
  let mockCache: jest.Mocked<Cache>;

  beforeEach(() => {
    mockTenantContext = mock<TenantContext>();
    mockTenantContext.tenant = {
      id: 'test-tenant',
      name: 'Test Tenant'
    };

    mockCache = new Cache() as jest.Mocked<Cache>;
    config = new RegionalPayrollConfig(mockTenantContext);
  });

  describe('getTaxBands', () => {
    it('should return correct tax bands for England', async () => {
      const result = await config.getTaxBands(Region.ENGLAND, TaxYear.Y2024_2025);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ min: 0, max: 12570, rate: 0 });
      expect(result[1]).toEqual({ min: 12571, max: 50270, rate: 0.2 });
    });

    it('should return correct tax bands for Scotland', async () => {
      const result = await config.getTaxBands(Region.SCOTLAND, TaxYear.Y2024_2025);

      expect(result).toHaveLength(6);
      expect(result[0]).toEqual({ min: 0, max: 12570, rate: 0 });
      expect(result[1]).toEqual({ min: 12571, max: 14732, rate: 0.19 });
    });

    it('should use cached tax bands when available', async () => {
      const mockBands = [{ min: 0, max: 1000, rate: 0.1 }];
      mockCache.get.mockResolvedValue(mockBands);

      const result = await config.getTaxBands(Region.ENGLAND, TaxYear.Y2024_2025);

      expect(result).toEqual(mockBands);
      expect(mockCache.get).toHaveBeenCalled();
    });
  });

  describe('getTranslations', () => {
    it('should return base translations for England', async () => {
      const result = await config.getTranslations(Region.ENGLAND);

      expect(result.salary).toBe('Salary');
      expect(result.tax).toBe('Tax');
      expect(result.ni).toBe('National Insurance');
    });

    it('should return modified translations for Scotland', async () => {
      const result = await config.getTranslations(Region.SCOTLAND);

      expect(result.tax).toBe('Scottish Income Tax');
    });

    it('should return modified translations for Ireland', async () => {
      const result = await config.getTranslations(Region.IRELAND);

      expect(result.ni).toBe('PRSI');
      expect(result.tax).toBe('Income Tax');
    });

    it('should use cached translations when available', async () => {
      const mockTranslations = { test: 'Test' };
      mockCache.get.mockResolvedValue(mockTranslations);

      const result = await config.getTranslations(Region.ENGLAND);

      expect(result).toEqual(mockTranslations);
      expect(mockCache.get).toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      await config.clearCache();

      expect(mockCache.clear).toHaveBeenCalled();
    });
  });
});
