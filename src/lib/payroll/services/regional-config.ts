import { TenantContext } from '@/lib/multi-tenant/types';
import { Region, TaxBand, TaxYear } from '../types';
import { Cache } from '@/lib/cache';

export class RegionalPayrollConfig {
  private readonly cache: Cache;
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly tenantContext: TenantContext
  ) {
    this.cache = new Cache();
  }

  async getTaxBands(region: Region, taxYear: TaxYear): Promise<TaxBand[]> {
    const cacheKey = `${this.tenantContext.tenant.id}:tax_bands:${region}:${taxYear}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      return cached as TaxBand[];
    }

    const bands = await this.fetchTaxBands(region, taxYear);
    await this.cache.set(cacheKey, bands, this.CACHE_TTL);
    return bands;
  }

  async getTranslations(region: Region): Promise<Record<string, string>> {
    const cacheKey = `${this.tenantContext.tenant.id}:translations:${region}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      return cached as Record<string, string>;
    }

    const translations = await this.fetchTranslations(region);
    await this.cache.set(cacheKey, translations, this.CACHE_TTL);
    return translations;
  }

  private async fetchTaxBands(region: Region, taxYear: TaxYear): Promise<TaxBand[]> {
    // Different tax bands for each region
    switch (region) {
      case Region.SCOTLAND:
        return this.getScottishTaxBands(taxYear);
      case Region.WALES:
        return this.getWelshTaxBands(taxYear);
      case Region.NORTHERN_IRELAND:
        return this.getNorthernIrelandTaxBands(taxYear);
      case Region.IRELAND:
        return this.getIrelandTaxBands(taxYear);
      default:
        return this.getEnglandTaxBands(taxYear);
    }
  }

  private async fetchTranslations(region: Region): Promise<Record<string, string>> {
    // Base translations that apply to all regions
    const baseTranslations = {
      salary: 'Salary',
      bonus: 'Bonus',
      tax: 'Tax',
      ni: 'National Insurance',
      pension: 'Pension',
      net_pay: 'Net Pay',
      gross_pay: 'Gross Pay',
      tax_code: 'Tax Code',
      pay_period: 'Pay Period',
      year_to_date: 'Year to Date',
    };

    // Region-specific translations and overrides
    switch (region) {
      case Region.SCOTLAND:
        return {
          ...baseTranslations,
          ni: 'National Insurance',
          tax: 'Scottish Income Tax',
        };
      case Region.WALES:
        return {
          ...baseTranslations,
          tax: 'Welsh Income Tax',
        };
      case Region.NORTHERN_IRELAND:
        return baseTranslations;
      case Region.IRELAND:
        return {
          ...baseTranslations,
          ni: 'PRSI',
          tax: 'Income Tax',
          pension: 'Pension Contribution',
        };
      default:
        return baseTranslations;
    }
  }

  private getEnglandTaxBands(taxYear: TaxYear): TaxBand[] {
    // 2024-2025 tax bands for England
    return [
      { min: 0, max: 12570, rate: 0 },
      { min: 12571, max: 50270, rate: 0.2 },
      { min: 50271, max: 125140, rate: 0.4 },
      { min: 125141, max: Infinity, rate: 0.45 },
    ];
  }

  private getScottishTaxBands(taxYear: TaxYear): TaxBand[] {
    // 2024-2025 tax bands for Scotland
    return [
      { min: 0, max: 12570, rate: 0 },
      { min: 12571, max: 14732, rate: 0.19 },
      { min: 14733, max: 25688, rate: 0.20 },
      { min: 25689, max: 43662, rate: 0.21 },
      { min: 43663, max: 125140, rate: 0.42 },
      { min: 125141, max: Infinity, rate: 0.47 },
    ];
  }

  private getWelshTaxBands(taxYear: TaxYear): TaxBand[] {
    // Welsh tax bands currently mirror England
    return this.getEnglandTaxBands(taxYear);
  }

  private getNorthernIrelandTaxBands(taxYear: TaxYear): TaxBand[] {
    // Northern Ireland tax bands currently mirror England
    return this.getEnglandTaxBands(taxYear);
  }

  private getIrelandTaxBands(taxYear: TaxYear): TaxBand[] {
    // 2024 tax bands for Ireland
    return [
      { min: 0, max: 40000, rate: 0.2 },
      { min: 40001, max: Infinity, rate: 0.4 },
    ];
  }

  async clearCache(): Promise<void> {
    await this.cache.clear();
  }
}
