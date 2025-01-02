/**
 * @fileoverview Pricing Service for financial operations
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';
import { metrics } from '@/lib/metrics';

export interface PriceConfiguration {
  basePrice: number;
  currency: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  regionId: string;
  serviceType: string;
  discounts?: {
    type: 'percentage' | 'fixed';
    value: number;
    conditions?: Record<string, any>;
  }[];
}

export class PricingService {
  private static instance: PricingService;

  private constructor() {}

  static getInstance(): PricingService {
    if (!PricingService.instance) {
      PricingService.instance = new PricingService();
    }
    return PricingService.instance;
  }

  async createPriceConfiguration(
    organizationId: string,
    config: PriceConfiguration
  ) {
    try {
      const priceConfig = await prisma.priceConfiguration.create({
        data: {
          organizationId,
          basePrice: config.basePrice,
          currency: config.currency,
          effectiveFrom: config.effectiveFrom,
          effectiveTo: config.effectiveTo,
          regionId: config.regionId,
          serviceType: config.serviceType,
          discounts: config.discounts
        }
      });

      metrics.increment('pricing.configuration.create.success');
      return priceConfig;
    } catch (error) {
      metrics.increment('pricing.configuration.create.error');
      throw error;
    }
  }

  async getPriceConfiguration(
    organizationId: string,
    serviceType: string,
    regionId: string,
    date: Date = new Date()
  ) {
    return prisma.priceConfiguration.findFirst({
      where: {
        organizationId,
        serviceType,
        regionId,
        effectiveFrom: {
          lte: date
        },
        OR: [
          {
            effectiveTo: null
          },
          {
            effectiveTo: {
              gte: date
            }
          }
        ]
      }
    });
  }

  async calculatePrice(
    basePrice: number,
    discounts: PriceConfiguration['discounts'] = [],
    conditions: Record<string, any> = {}
  ): Promise<number> {
    let finalPrice = basePrice;

    for (const discount of discounts || []) {
      // Check if conditions are met
      const conditionsMet = Object.entries(discount.conditions || {}).every(
        ([key, value]) => conditions[key] === value
      );

      if (conditionsMet) {
        if (discount.type === 'percentage') {
          finalPrice *= (1 - discount.value / 100);
        } else {
          finalPrice -= discount.value;
        }
      }
    }

    return Math.max(0, finalPrice); // Ensure price doesn't go below 0
  }

  async updatePriceConfiguration(
    id: string,
    organizationId: string,
    updates: Partial<PriceConfiguration>
  ) {
    try {
      const updated = await prisma.priceConfiguration.update({
        where: {
          id,
          organizationId
        },
        data: updates
      });

      metrics.increment('pricing.configuration.update.success');
      return updated;
    } catch (error) {
      metrics.increment('pricing.configuration.update.error');
      throw error;
    }
  }

  async deletePriceConfiguration(id: string, organizationId: string) {
    try {
      await prisma.priceConfiguration.delete({
        where: {
          id,
          organizationId
        }
      });

      metrics.increment('pricing.configuration.delete.success');
    } catch (error) {
      metrics.increment('pricing.configuration.delete.error');
      throw error;
    }
  }
} 