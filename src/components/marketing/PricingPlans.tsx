'use client'

/**
 * WriteCareNotes.com
 * @fileoverview Pricing Plans Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'
import { Badge } from '@/components/ui/Badge/Badge'
import { Card } from '@/components/ui/Card'

export function PricingPlans() {
  const [residents, setResidents] = useState<string>('')
  const monthlyTotal = residents ? `£${(Number(residents) * 3.75).toFixed(2)}` : '£0.00'

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose the perfect plan for your care home. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Pricing Calculator */}
        <div className="mt-16 flex justify-center">
          <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200 max-w-xl w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Calculate your monthly cost</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label htmlFor="residents" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of residents
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="residents"
                    value={residents}
                    onChange={(e) => setResidents(e.target.value)}
                    className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter number"
                    min="1"
                    max="1000"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">#</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 mb-1">Monthly cost</div>
                <div className="text-2xl font-bold text-gray-900">
                  {residents ? monthlyTotal : '£3.75'} 
                  <span className="text-base font-normal text-gray-600">
                    {residents ? ' total' : ' per resident'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {/* Free Plan */}
          <div className="rounded-3xl p-8 ring-1 ring-gray-200 bg-white">
            <h3 className="text-lg font-semibold leading-8 text-gray-900">Free</h3>
            
            <p className="mt-4 text-sm leading-6 text-gray-600">Perfect for small care homes getting started.</p>
            
            <div className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-gray-900">£0</span>
              <span className="text-sm font-semibold leading-6 text-gray-600">forever</span>
            </div>
            
            <div className="mt-8 text-sm font-medium text-gray-900">What's included:</div>
            <ul role="list" className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                <span><strong>Up to 10 residents</strong></span>
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Basic care planning
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Daily notes & handover
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Basic reporting
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Community support
              </li>
            </ul>

            <div className="mt-6">
              <Link
                href="/auth/signup?plan=free"
                className="block w-full rounded-lg py-4 text-center text-sm font-semibold leading-6 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 hover:ring-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get started for free
              </Link>
            </div>
          </div>

          {/* Standard Plan */}
          <div className="rounded-3xl p-8 ring-2 ring-blue-600 bg-white relative">
            <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-blue-600 px-3 py-1 text-center text-sm font-semibold text-white shadow-sm">
              Most popular
            </div>
            
            <h3 className="text-lg font-semibold leading-8 text-gray-900">Standard</h3>
            
            <p className="mt-4 text-sm leading-6 text-gray-600">Complete care management solution.</p>
            
            <div className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-gray-900">£3.75</span>
              <span className="text-sm font-semibold leading-6 text-gray-600">/resident/month</span>
            </div>
            
            <div className="mt-8 text-sm font-medium text-gray-900">Everything in Free, plus:</div>
            <ul role="list" className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                <span><strong>Unlimited residents</strong></span>
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Full care planning system
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Medication management
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Staff rota & management
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Email & phone support
              </li>
            </ul>

            <div className="mt-6">
              <Link
                href="/auth/signup?plan=standard"
                className="block w-full rounded-lg bg-blue-600 px-3 py-4 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get started
              </Link>
              <p className="mt-4 text-xs leading-5 text-gray-600 text-center">No credit card required</p>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="rounded-3xl p-8 ring-1 ring-gray-200 bg-white">
            <h3 className="text-lg font-semibold leading-8 text-gray-900">Premium</h3>
            
            <p className="mt-4 text-sm leading-6 text-gray-600">Advanced features and priority support.</p>
            
            <div className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-gray-900">£4.50</span>
              <span className="text-sm font-semibold leading-6 text-gray-600">/resident/month</span>
            </div>
            
            <div className="mt-8 text-sm font-medium text-gray-900">Everything in Standard, plus:</div>
            <ul role="list" className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Custom care plan templates
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Advanced analytics
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Priority 24/7 support
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Training sessions
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                Dedicated account manager
              </li>
            </ul>

            <div className="mt-6">
              <Link
                href="/auth/signup?plan=premium"
                className="block w-full rounded-lg py-4 text-center text-sm font-semibold leading-6 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 hover:ring-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Contact sales
              </Link>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900">Still have questions?</h3>
          <p className="mt-2 text-base text-gray-600">Contact our team and we'll be happy to help you choose the right plan for your care home.</p>
          <Button variant="outline" className="mt-6">
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  )
}