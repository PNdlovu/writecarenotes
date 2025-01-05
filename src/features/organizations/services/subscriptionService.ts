/**
 * Subscription Service
 * Handles business logic for subscriptions and billing
 */
import { 
  Subscription,
  SubscriptionPlan,
  BillingCycle,
  SUBSCRIPTION_PLANS,
  Feature
} from '../types/subscription.types'
import { SubscriptionRepository } from '../repositories/subscriptionRepository'
import { OrganizationError, OrganizationErrorCode } from '../types/errors'
import { stripe } from '@/lib/stripe'

interface ServiceContext {
  userId: string
  tenantId: string
  region: string
  language: string
}

export class SubscriptionService {
  private static instance: SubscriptionService
  private repository: SubscriptionRepository

  private constructor() {
    this.repository = SubscriptionRepository.getInstance()
  }

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService()
    }
    return SubscriptionService.instance
  }

  async getSubscription(organizationId: string, context: ServiceContext): Promise<Subscription> {
    return this.repository.getSubscription(organizationId, {
      userId: context.userId,
      tenantId: context.tenantId,
    })
  }

  async createSubscription(
    organizationId: string,
    plan: SubscriptionPlan,
    billingCycle: BillingCycle,
    paymentMethodId: string,
    context: ServiceContext
  ): Promise<Subscription> {
    try {
      // Create Stripe customer and subscription
      const amount = SUBSCRIPTION_PLANS[plan].price[billingCycle]
      const stripeCustomer = await stripe.customers.create({
        payment_method: paymentMethodId,
        email: context.userId, // Assuming userId is an email
        metadata: {
          organizationId,
          tenantId: context.tenantId,
        },
      })

      const stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomer.id,
        items: [{ price: this.getStripePriceId(plan, billingCycle) }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      })

      // Create local subscription
      const subscription = await this.repository.createSubscription(
        organizationId,
        plan,
        {
          userId: context.userId,
          tenantId: context.tenantId,
        }
      )

      // Record initial billing event
      await this.repository.recordBillingEvent(
        organizationId,
        amount,
        'SUCCESS',
        {
          userId: context.userId,
          tenantId: context.tenantId,
        }
      )

      return subscription
    } catch (error) {
      throw new OrganizationError(
        `Failed to create subscription: ${error.message}`,
        OrganizationErrorCode.BILLING_ERROR
      )
    }
  }

  async updateSubscription(
    organizationId: string,
    plan: SubscriptionPlan,
    context: ServiceContext
  ): Promise<Subscription> {
    const currentSubscription = await this.getSubscription(organizationId, context)
    
    // Check for downgrades and validate limits
    if (this.isPlanDowngrade(currentSubscription.plan, plan)) {
      await this.validateDowngrade(organizationId, plan, context)
    }

    // Update subscription
    return this.repository.updateSubscription(
      organizationId,
      { plan },
      {
        userId: context.userId,
        tenantId: context.tenantId,
      }
    )
  }

  async cancelSubscription(
    organizationId: string,
    context: ServiceContext
  ): Promise<void> {
    const subscription = await this.getSubscription(organizationId, context)
    
    // Cancel at period end
    await this.repository.updateSubscription(
      organizationId,
      {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      {
        userId: context.userId,
        tenantId: context.tenantId,
      }
    )
  }

  async checkFeatureAccess(
    organizationId: string,
    feature: Feature['name'],
    context: ServiceContext
  ): Promise<boolean> {
    const subscription = await this.getSubscription(organizationId, context)
    const plan = SUBSCRIPTION_PLANS[subscription.plan]
    return !!plan.features[feature]
  }

  async validateFeatureUsage(
    organizationId: string,
    feature: Feature['name'],
    usage: number,
    context: ServiceContext
  ): Promise<boolean> {
    const subscription = await this.getSubscription(organizationId, context)
    const plan = SUBSCRIPTION_PLANS[subscription.plan]
    const limit = plan.features[feature]
    
    // If limit is null, feature is unlimited
    if (limit === null) return true
    
    return usage <= limit
  }

  private isPlanDowngrade(currentPlan: SubscriptionPlan, newPlan: SubscriptionPlan): boolean {
    const planOrder = ['BASIC', 'PROFESSIONAL', 'ENTERPRISE']
    return planOrder.indexOf(currentPlan) > planOrder.indexOf(newPlan)
  }

  private async validateDowngrade(
    organizationId: string,
    newPlan: SubscriptionPlan,
    context: ServiceContext
  ): Promise<void> {
    const planLimits = SUBSCRIPTION_PLANS[newPlan].features
    
    // Check each feature limit
    for (const [feature, limit] of Object.entries(planLimits)) {
      if (limit === null) continue
      
      const usage = await this.getCurrentFeatureUsage(
        organizationId,
        feature as Feature['name'],
        context
      )
      
      if (usage > limit) {
        throw new OrganizationError(
          `Cannot downgrade: Current ${feature} usage (${usage}) exceeds new plan limit (${limit})`,
          OrganizationErrorCode.VALIDATION_ERROR
        )
      }
    }
  }

  private async getCurrentFeatureUsage(
    organizationId: string,
    feature: Feature['name'],
    context: ServiceContext
  ): Promise<number> {
    // Implement feature-specific usage calculation
    // This would typically involve querying various services
    return 0 // Placeholder
  }

  private getStripePriceId(plan: SubscriptionPlan, billingCycle: BillingCycle): string {
    // Map plans to Stripe price IDs
    const priceIds = {
      BASIC: {
        MONTHLY: 'price_H1YvDwgksl2',
        ANNUAL: 'price_H1YvDwgksl3',
      },
      PROFESSIONAL: {
        MONTHLY: 'price_H1YvDwgksl4',
        ANNUAL: 'price_H1YvDwgksl5',
      },
      ENTERPRISE: {
        MONTHLY: 'price_H1YvDwgksl6',
        ANNUAL: 'price_H1YvDwgksl7',
      },
    }
    return priceIds[plan][billingCycle]
  }
}


