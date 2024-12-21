import { TenantContext } from '@/lib/multi-tenant/types';
import { PayrollPeriod, PayrollSettings } from '@prisma/client';

export class PayrollPerformanceAdapter {
  private cache: Map<string, any> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly tenantContext: TenantContext) {}

  private getCacheKey(key: string): string {
    return `${this.tenantContext.tenant.id}:${key}`;
  }

  async getPayrollPeriods(prisma: any): Promise<PayrollPeriod[]> {
    const cacheKey = this.getCacheKey('payroll_periods');
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const periods = await prisma.payrollPeriod.findMany({
      where: {
        organizationId: this.tenantContext.tenant.id
      },
      orderBy: {
        startDate: 'desc'
      },
      take: 12,
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        totalGross: true,
        totalNet: true,
        totalTax: true,
        totalNI: true
      }
    });

    this.cache.set(cacheKey, {
      data: periods,
      timestamp: Date.now()
    });

    return periods;
  }

  async getPayrollSettings(prisma: any): Promise<PayrollSettings | null> {
    const cacheKey = this.getCacheKey('payroll_settings');
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const settings = await prisma.payrollSettings.findFirst({
      where: {
        organizationId: this.tenantContext.tenant.id
      }
    });

    if (settings) {
      this.cache.set(cacheKey, {
        data: settings,
        timestamp: Date.now()
      });
    }

    return settings;
  }

  clearCache(): void {
    const prefix = `${this.tenantContext.tenant.id}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  async optimizeBulkCalculations<T>(
    items: T[],
    calculator: (item: T) => Promise<any>,
    batchSize = 50
  ): Promise<any[]> {
    const results: any[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => calculator(item))
      );
      results.push(...batchResults);
    }

    return results;
  }
}
