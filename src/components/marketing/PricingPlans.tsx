/**
 * WriteCareNotes.com
 * @fileoverview Pricing Plans Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Starter',
    price: '£99',
    period: '/month',
    description: 'Perfect for small care homes getting started with digital management.',
    features: [
      'Up to 25 residents',
      'Basic care planning',
      'Medication management',
      'Staff rota',
      'Incident reporting',
      'Email support'
    ],
    buttonText: 'Get Started',
    buttonLink: '/auth/signup?plan=starter',
    highlight: false
  },
  {
    name: 'Professional',
    price: '£199',
    period: '/month',
    description: 'Ideal for medium-sized care homes needing comprehensive features.',
    features: [
      'Up to 75 residents',
      'Advanced care planning',
      'Full medication management',
      'Staff management & training',
      'Family portal access',
      'Compliance reporting',
      'Priority support',
      'API access'
    ],
    buttonText: 'Get Started',
    buttonLink: '/auth/signup?plan=professional',
    highlight: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Tailored solutions for large care home groups and organizations.',
    features: [
      'Unlimited residents',
      'Custom integrations',
      'Multi-site management',
      'Advanced analytics',
      'Custom reporting',
      'Dedicated account manager',
      '24/7 support',
      'Staff training program'
    ],
    buttonText: 'Contact Sales',
    buttonLink: '/contact?enquiry=enterprise',
    highlight: false
  }
]

export function PricingPlans() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Choose the perfect plan for your care home's needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl bg-white transition-all duration-200 ${
                plan.highlight
                  ? 'shadow-xl border-2 border-blue-200 scale-105'
                  : 'shadow-lg hover:shadow-xl border border-gray-100'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href={plan.buttonLink} className="block">
                <Button
                  className={`w-full h-12 text-lg font-semibold ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-md hover:shadow-lg'
                      : ''
                  }`}
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}