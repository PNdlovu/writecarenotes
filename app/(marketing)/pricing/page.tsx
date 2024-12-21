/**
 * WriteCareNotes.com
 * @fileoverview Pricing Page
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { PricingPlans } from '@/components/marketing/PricingPlans'
import { PricingFAQ } from '@/components/marketing/PricingFAQ'

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that best fits your care home needs
        </p>
      </div>

      <PricingPlans />
      <PricingFAQ />
    </div>
  )
} 