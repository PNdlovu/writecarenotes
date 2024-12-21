'use client'

import { Pricing } from "@/components/marketing/Pricing"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  ShieldCheck, 
  Lock, 
  Server, 
  Globe,
  Clock,
  Shield,
  Building2,
  CheckCircle2
} from "lucide-react"

interface Props {
  complianceFeatures: Array<{
    title: string
    description: string
    included: string
  }>
  faqs: Array<{
    question: string
    answer: string
  }>
  trustSignals: Array<{
    number: string
    label: string
  }>
}

export function PricingPageContent({ complianceFeatures, faqs, trustSignals }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-50 via-blue-50/50 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                New Feature
                <span className="mx-1">•</span>
                Just released offline mode
                <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Pricing that grows with your care home
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Choose a plan that's right for you. All plans include core features, regular updates, and enterprise-grade security.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/demo">
                  Start Free Trial
                </Link>
              </Button>
              <Link href="#compare" className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors">
                Compare Plans <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="relative z-10">
        <Pricing />
      </div>

      {/* Trust Signals */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {trustSignals.map((signal) => (
            <Card 
              key={signal.label} 
              className="p-8 text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/50 hover:scale-105"
            >
              <div className="flex flex-col items-center gap-4">
                {signal.label === "Uptime SLA" && <Clock className="h-8 w-8 text-blue-600" />}
                {signal.label === "Support" && <CheckCircle2 className="h-8 w-8 text-blue-600" />}
                {signal.label === "Encryption" && <Shield className="h-8 w-8 text-blue-600" />}
                {signal.label === "Data Centers" && <Building2 className="h-8 w-8 text-blue-600" />}
                <div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {signal.number}
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-600">{signal.label}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Compliance Features */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Compliance & Security</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Enterprise-grade security and compliance features to keep your care home data safe and meet regulatory requirements.
        </p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {complianceFeatures.map((feature) => (
            <Card 
              key={feature.title} 
              className="p-8 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 hover:scale-[1.02] border-0"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-blue-100/50">
                  {feature.title.includes("CQC") && <ShieldCheck className="h-6 w-6 text-blue-600" />}
                  {feature.title.includes("GDPR") && <Lock className="h-6 w-6 text-blue-600" />}
                  {feature.title.includes("NHS") && <Server className="h-6 w-6 text-blue-600" />}
                  {feature.title.includes("Regional") && <Globe className="h-6 w-6 text-blue-600" />}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                  <Badge variant="secondary" className="mt-4 bg-blue-100/50 text-blue-700 hover:bg-blue-100">
                    {feature.included}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left hover:text-blue-600 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl px-6 py-20 sm:px-12 sm:py-24 lg:px-16 shadow-2xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Ready to transform your care home operations?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join over 500+ care homes already using Write Care Notes to improve their care delivery and compliance.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <Button 
                asChild 
                variant="secondary" 
                size="lg" 
                className="rounded-full w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/demo" className="flex items-center gap-2">
                  <span>Book a Live Demo</span>
                  <span className="text-sm text-blue-700">• 30 min</span>
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="rounded-full bg-transparent text-white hover:bg-blue-500 border-2 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/contact" className="flex items-center gap-2">
                  <span>Talk to Our Team</span>
                  <span className="text-sm">• Enterprise Solutions</span>
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-blue-100">
              ✓ Free 30-day trial &nbsp; ✓ No credit card required &nbsp; ✓ Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 