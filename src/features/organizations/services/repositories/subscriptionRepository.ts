/**
 * Subscription Repository
 * Handles all database operations for organization subscriptions
 */
import { prisma } from '@/lib/prisma'
import { 
  Subscription, 
  SubscriptionPlan, 
  SubscriptionStatus,
  BillingCycle,
  Feature 
} from '../types/subscription.types'
import { OrganizationError, OrganizationErrorCode } from '../types/errors'

interface RepositoryContext {
  userId: string
  tenantId: string
}

export class SubscriptionRepository {
  private static instance: SubscriptionRepository

  private constructor() {}

  static getInstance(): SubscriptionRepository {
    if (!SubscriptionRepository.instance) {
      SubscriptionRepository.instance = new SubscriptionRepository()
    }
    return SubscriptionRepository.instance
  }

  async getSubscription(organizationId: string, context: RepositoryContext): Promise<Subscription> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          organizationId,
          tenantId: context.tenantId,
        },
        include: {
          features: true,
          billingHistory: true,
        },
      })

      if (!subscription) {
        throw new OrganizationError(
          `No subscription found for organization: ${organizationId}`,
          OrganizationErrorCode.NOT_FOUND
        )
      }

      return subscription
    } catch (error) {
      throw new OrganizationError(
        `Failed to fetch subscription: ${error.message}`,
        OrganizationErrorCode.DATABASE_ERROR
      )
    }
  }

  async createSubscription(
    organizationId: string,
    plan: SubscriptionPlan,
    context: RepositoryContext
  ): Promise<Subscription> {
    try {
      return await prisma.subscription.create({
        data: {
          organizationId,
          tenantId: context.tenantId,
          plan,
          status: 'ACTIVE' as SubscriptionStatus,
          billingCycle: 'MONTHLY' as BillingCycle,
          startDate: new Date(),
          endDate: this.calculateEndDate('MONTHLY'),
          features: {
            create: this.getFeaturesByPlan(plan),
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: context.userId,
            updatedBy: context.userId,
          },
        },
        include: {
          features: true,
          billingHistory: true,
        },
      })
    } catch (error) {
      throw new OrganizationError(
        `Failed to create subscription: ${error.message}`,
        OrganizationErrorCode.DATABASE_ERROR
      )
    }
  }

  async updateSubscription(
    organizationId: string,
    updates: Partial<Subscription>,
    context: RepositoryContext
  ): Promise<Subscription> {
    try {
      return await prisma.subscription.update({
        where: {
          organizationId,
          tenantId: context.tenantId,
        },
        data: {
          ...updates,
          metadata: {
            updatedAt: new Date(),
            updatedBy: context.userId,
          },
        },
        include: {
          features: true,
          billingHistory: true,
        },
      })
    } catch (error) {
      throw new OrganizationError(
        `Failed to update subscription: ${error.message}`,
        OrganizationErrorCode.DATABASE_ERROR
      )
    }
  }

  async recordBillingEvent(
    organizationId: string,
    amount: number,
    status: 'SUCCESS' | 'FAILED',
    context: RepositoryContext
  ): Promise<void> {
    try {
      await prisma.billingHistory.create({
        data: {
          organizationId,
          tenantId: context.tenantId,
          amount,
          status,
          timestamp: new Date(),
          metadata: {
            createdBy: context.userId,
          },
        },
      })
    } catch (error) {
      throw new OrganizationError(
        `Failed to record billing event: ${error.message}`,
        OrganizationErrorCode.DATABASE_ERROR
      )
    }
  }

  private calculateEndDate(billingCycle: BillingCycle): Date {
    const date = new Date()
    switch (billingCycle) {
      case 'MONTHLY':
        date.setMonth(date.getMonth() + 1)
        break
      case 'ANNUAL':
        date.setFullYear(date.getFullYear() + 1)
        break
    }
    return date
  }

  private getFeaturesByPlan(plan: SubscriptionPlan): Partial<Feature>[] {
    switch (plan) {
      case 'BASIC':
        return [
          { name: 'RESIDENTS', limit: 50 },
          { name: 'STAFF', limit: 10 },
          { name: 'STORAGE', limit: 5 }, // GB
        ]
      case 'PROFESSIONAL':
        return [
          { name: 'RESIDENTS', limit: 200 },
          { name: 'STAFF', limit: 50 },
          { name: 'STORAGE', limit: 50 },
          { name: 'ANALYTICS', limit: null },
        ]
      case 'ENTERPRISE':
        return [
          { name: 'RESIDENTS', limit: null },
          { name: 'STAFF', limit: null },
          { name: 'STORAGE', limit: null },
          { name: 'ANALYTICS', limit: null },
          { name: 'CUSTOM_BRANDING', limit: null },
        ]
      default:
        return []
    }
  }
}


