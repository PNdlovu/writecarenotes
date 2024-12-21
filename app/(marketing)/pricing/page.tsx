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

const complianceFeatures = [
  {
    title: "CQC Compliance",
    description: "Built-in tools and templates aligned with CQC standards",
    included: "All plans"
  },
  {
    title: "GDPR Compliance",
    description: "Data protection measures and privacy controls",
    included: "All plans"
  },
  {
    title: "NHS Data Security",
    description: "Meets NHS Digital security standards",
    included: "All plans"
  },
  {
    title: "Regional Standards",
    description: "Support for CIW, Care Inspectorate, HIQA, and RQIA requirements",
    included: "Professional & Enterprise"
  }
]

const faqs = [
  {
    question: "How does the pricing work?",
    answer: "Our pricing is based on the number of residents and features needed. All plans are billed monthly with no long-term contract required. You can upgrade or downgrade at any time as your needs change."
  },
  {
    question: "Is there a setup fee?",
    answer: "No, there are no hidden setup fees. Our onboarding team will help you get started at no additional cost. This includes initial setup, data migration assistance, and basic training for your staff."
  },
  {
    question: "Can I switch plans later?",
    answer: "Yes, you can switch plans at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes will take effect at the start of your next billing cycle."
  },
  {
    question: "What kind of support is included?",
    answer: "All plans include email support. Professional plans add 24/7 phone support, while Enterprise plans include a dedicated account manager and priority support with guaranteed response times."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take security seriously. We use enterprise-grade encryption, regular security audits, and comply with NHS Digital security standards. Your data is stored in UK-based data centers with daily backups."
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes, we offer a 30-day free trial of our Professional plan. No credit card required. You can test all features and decide which plan best suits your needs."
  }
]

const trustSignals = [
  { number: "99.9%", label: "Uptime SLA" },
  { number: "24/7", label: "Support" },
  { number: "256-bit", label: "Encryption" },
  { number: "UK", label: "Data Centers" }
]

export default function PricingPage() {
  return (
    <PricingPageContent
      complianceFeatures={complianceFeatures}
      faqs={faqs}
      trustSignals={trustSignals}
    />
  )
} 