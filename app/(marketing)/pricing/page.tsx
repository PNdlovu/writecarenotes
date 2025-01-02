/**
 * WriteCareNotes.com
 * @fileoverview Pricing Page - Complete pricing information and plan comparison
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Metadata } from "next"
import { PricingPageContent } from "@/components/marketing/PricingPageContent"

export const metadata: Metadata = {
  title: "Pricing | Write Care Notes - Care Home Management Software",
  description: "Transparent pricing plans for Write Care Notes care home management software. Choose the plan that best fits your care home needs.",
  keywords: "care home software pricing, healthcare software plans, care management pricing",
  openGraph: {
    title: "Pricing | Write Care Notes",
    description: "Flexible pricing plans for care homes",
    type: "website"
  }
}

export default function PricingPage() {
  return <PricingPageContent />
}