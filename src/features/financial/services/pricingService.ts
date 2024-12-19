import { PricingPlan, PricingTier, BillingCycle } from '../types/pricing.types';
import { FinancialRepository } from '../database/repositories/financialRepository';
import { FinancialError } from '../utils/errors';
import { Logger } from '@/lib/logger';
import { pricingPlans } from '@/data/pricing';

export class PricingService {
  private logger: Logger;

  constructor(private repository: FinancialRepository) {
    this.logger = new Logger('pricing');
  }

  async calculatePrice(
    tenantId: string,
    planId: string,
    options: {
      residentCount: number;
      addons?: string[];
      billingCycle?: BillingCycle;
      promoCode?: string;
    }
  ): Promise<{
    basePrice: number;
    addonsPrice: number;
    discount: number;
    total: number;
    breakdown: Record<string, number>;
  }> {
    try {
      // Get base plan
      const plan = await this.getPricingPlan(planId);
      if (!plan) {
        throw new FinancialError(
          'Invalid pricing plan',
          'INVALID_PRICING_PLAN'
        );
      }

      // Calculate base price
      let basePrice = this.calculateBasePriceForResidents(
        plan,
        options.residentCount
      );

      // Apply billing cycle adjustments
      if (options.billingCycle === 'ANNUAL') {
        basePrice = this.applyAnnualDiscount(basePrice);
      }

      // Calculate addons price
      const addonsPrice = await this.calculateAddonsPrice(
        options.addons || []
      );

      // Apply promotional discount if applicable
      const discount = await this.calculatePromoDiscount(
        options.promoCode,
        basePrice + addonsPrice
      );

      // Calculate total
      const total = basePrice + addonsPrice - discount;

      // Create price breakdown
      const breakdown = {
        basePlan: basePrice,
        addons: addonsPrice,
        promoDiscount: -discount
      };

      this.logger.info('Price calculated', {
        tenantId,
        planId,
        total,
        breakdown
      });

      return {
        basePrice,
        addonsPrice,
        discount,
        total,
        breakdown
      };
    } catch (error) {
      this.logger.error('Price calculation failed', error);
      throw new FinancialError(
        'Failed to calculate price',
        'PRICE_CALCULATION_FAILED',
        { error }
      );
    }
  }

  async getPricingPlan(planId: string): Promise<PricingPlan | null> {
    return pricingPlans.find(plan => plan.name === planId) || null;
  }

  private calculateBasePriceForResidents(
    plan: PricingPlan,
    residentCount: number
  ): number {
    const basePrice = plan.price;
    
    // Apply tier-based pricing if resident count exceeds plan limit
    if (residentCount > plan.features[0].match(/\d+/)[0]) {
      const extraResidents = residentCount - plan.features[0].match(/\d+/)[0];
      return basePrice + (extraResidents * 5); // $5 per additional resident
    }

    return basePrice;
  }

  private applyAnnualDiscount(price: number): number {
    // 20% discount for annual billing
    return price * 0.8;
  }

  private async calculateAddonsPrice(addons: string[]): Promise<number> {
    // Implement addon price calculation
    return addons.length * 10; // $10 per addon
  }

  private async calculatePromoDiscount(
    promoCode: string | undefined,
    subtotal: number
  ): Promise<number> {
    if (!promoCode) return 0;

    // Get promo from repository
    const promo = await this.repository.getPromoCode(promoCode);
    if (!promo || !this.isPromoValid(promo)) {
      return 0;
    }

    // Calculate discount based on promo type
    switch (promo.type) {
      case 'PERCENTAGE':
        return subtotal * (promo.value / 100);
      case 'FIXED':
        return promo.value;
      default:
        return 0;
    }
  }

  private isPromoValid(promo: any): boolean {
    const now = new Date();
    return (
      promo.startDate <= now &&
      (!promo.endDate || promo.endDate >= now) &&
      (!promo.usageLimit || promo.usageCount < promo.usageLimit)
    );
  }

  async getPricingTiers(): Promise<PricingTier[]> {
    return [
      {
        minResidents: 0,
        maxResidents: 20,
        pricePerResident: 5
      },
      {
        minResidents: 21,
        maxResidents: 50,
        pricePerResident: 4
      },
      {
        minResidents: 51,
        maxResidents: 100,
        pricePerResident: 3
      },
      {
        minResidents: 101,
        maxResidents: null,
        pricePerResident: 2
      }
    ];
  }

  async estimateAnnualCost(
    tenantId: string,
    planId: string,
    options: {
      residentCount: number;
      addons?: string[];
      includeProjections?: boolean;
    }
  ): Promise<{
    annualCost: number;
    monthlyCost: number;
    projectedCosts?: Record<string, number>;
  }> {
    const price = await this.calculatePrice(tenantId, planId, {
      ...options,
      billingCycle: 'ANNUAL'
    });

    const result = {
      annualCost: price.total,
      monthlyCost: price.total / 12
    };

    if (options.includeProjections) {
      // Add 12-month cost projections based on growth assumptions
      const projectedCosts = {};
      for (let i = 1; i <= 12; i++) {
        const projectedResidents = Math.floor(
          options.residentCount * (1 + 0.05 * i)
        ); // Assume 5% monthly growth
        const projection = await this.calculatePrice(tenantId, planId, {
          ...options,
          residentCount: projectedResidents,
          billingCycle: 'ANNUAL'
        });
        projectedCosts[`month${i}`] = projection.total / 12;
      }
      return { ...result, projectedCosts };
    }

    return result;
  }
}


