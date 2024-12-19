import { useState } from 'react'
import { Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export type SubscriptionTier = 'STARTER' | 'GROWTH' | 'ENTERPRISE'

interface Plan {
  id: SubscriptionTier
  name: string
  price: number
  description: string
  features: string[]
  badge?: string
}

const plans: Plan[] = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 99,
    description: 'Perfect for single care homes',
    features: [
      '1 care home facility',
      'Up to 20 residents',
      'Full care planning',
      'Staff management',
      'Medication management',
      'Basic reporting',
      'CQC/Regulatory compliance',
    ],
    badge: 'Most Popular',
  },
  {
    id: 'GROWTH',
    name: 'Growth',
    price: 249,
    description: 'For growing care organizations',
    features: [
      'Up to 3 care homes',
      'Up to 50 residents per home',
      'All Starter features',
      'Advanced reporting',
      'Multi-facility dashboard',
      'Family portal',
      'API access',
      'Priority support',
    ],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 599,
    description: 'For large care organizations',
    features: [
      'Unlimited care homes',
      'Unlimited residents',
      'All Growth features',
      'Custom integrations',
      'Dedicated account manager',
      'Custom training',
      'White-label options',
      '24/7 support',
    ],
  },
]

interface PlanSelectorProps {
  selectedPlan: SubscriptionTier
  onSelectPlan: (plan: SubscriptionTier) => void
  isLoading?: boolean
}

export function PlanSelector({ selectedPlan, onSelectPlan, isLoading }: PlanSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => (
        <Card 
          key={plan.id}
          className={`relative ${
            selectedPlan === plan.id ? 'border-primary' : ''
          }`}
        >
          {plan.badge && (
            <Badge 
              className="absolute top-4 right-4"
              variant={plan.badge === 'Most Popular' ? 'default' : 'secondary'}
            >
              {plan.badge}
            </Badge>
          )}
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              £{plan.price}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </div>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={selectedPlan === plan.id ? 'default' : 'outline'}
              onClick={() => onSelectPlan(plan.id)}
              disabled={isLoading}
            >
              {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}


