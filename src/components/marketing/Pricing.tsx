/**
 * WriteCareNotes.com
 * @fileoverview Pricing Component - Displays pricing plans and features
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

'use client'

import Link from "next/link"
import { Button } from "@/components/ui/Button/Button"
import { Card } from "@/components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { 
  Check, 
  Minus, 
  Users, 
  ClipboardCheck, 
  Calendar, 
  AlertTriangle, 
  PiggyBank, 
  FileText, 
  Bed, 
  Mail, 
  Headphones, 
  BarChart 
} from "lucide-react"
import React from "react"
import { Badge } from "@/components/ui/Badge/Badge"

const plans = [
  {
    name: "Starter",
    price: "£99",
    period: "per month",
    description: "Perfect for small care homes",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    features: [
      { text: "Up to 20 residents", icon: Users },
      { text: "Basic care planning", icon: ClipboardCheck },
      { text: "Staff rota management", icon: Calendar },
      { text: "Incident reporting", icon: AlertTriangle },
      { text: "Basic financial management", icon: PiggyBank },
      { text: "Core assessments", icon: FileText },
      { text: "Bed management", icon: Bed },
      { text: "Email support", icon: Mail },
      { text: "Implementation support", icon: Headphones },
      { text: "Basic reporting", icon: BarChart }
    ]
  },
  {
    name: "Professional",
    price: "£199",
    period: "per month",
    description: "Ideal for medium-sized facilities",
    color: "bg-gradient-to-br from-green-500 to-green-600",
    popular: true,
    features: [
      { text: "Up to 50 residents", icon: Users },
      { text: "Advanced care planning", icon: ClipboardCheck },
      { text: "Full financial suite", icon: PiggyBank },
      { text: "Payroll processing", icon: Calendar },
      { text: "GP Connect integration", icon: AlertTriangle },
      { text: "Custom assessments", icon: FileText },
      { text: "Medication management", icon: Bed },
      { text: "24/7 phone support", icon: Mail },
      { text: "Family portal", icon: Headphones },
      { text: "Quality assurance tools", icon: BarChart },
      { text: "Advanced reporting", icon: BarChart }
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "per month",
    description: "For large care organizations",
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    features: [
      { text: "Unlimited residents", icon: Users },
      { text: "Multi-facility management", icon: ClipboardCheck },
      { text: "Advanced financial controls", icon: PiggyBank },
      { text: "Custom integrations", icon: Calendar },
      { text: "Full healthcare connectivity", icon: AlertTriangle },
      { text: "Advanced analytics", icon: FileText },
      { text: "White-label options", icon: Bed },
      { text: "Dedicated support", icon: Mail },
      { text: "Custom development", icon: Headphones },
      { text: "Business intelligence", icon: BarChart },
      { text: "Onsite training", icon: BarChart }
    ]
  }
]

const featureComparison = {
  categories: [
    {
      name: "Core Care Management",
      features: [
        { name: "Care Planning & Assessments", starter: true, professional: true, enterprise: true },
        { name: "Daily Notes & Handover", starter: true, professional: true, enterprise: true },
        { name: "Incident Reporting", starter: true, professional: true, enterprise: true },
        { name: "Medication Management", starter: false, professional: true, enterprise: true },
        { name: "Family Portal Access", starter: false, professional: true, enterprise: true },
        { name: "Bed Management", starter: true, professional: true, enterprise: true },
        { name: "Care Quality Monitoring", starter: false, professional: true, enterprise: true },
        { name: "End of Life Care Planning", starter: false, professional: true, enterprise: true }
      ]
    },
    {
      name: "Financial Management",
      features: [
        { name: "Basic Invoicing", starter: true, professional: true, enterprise: true },
        { name: "Resident Billing", starter: true, professional: true, enterprise: true },
        { name: "Payroll Processing", starter: false, professional: true, enterprise: true },
        { name: "Staff Rota & Timesheets", starter: true, professional: true, enterprise: true },
        { name: "Financial Reporting", starter: false, professional: true, enterprise: true },
        { name: "Multi-site Financial Management", starter: false, professional: false, enterprise: true },
        { name: "Budgeting Tools", starter: false, professional: true, enterprise: true },
        { name: "Cost Analysis", starter: false, professional: true, enterprise: true },
        { name: "Expense Management", starter: false, professional: true, enterprise: true }
      ]
    },
    {
      name: "Healthcare Integration",
      features: [
        { name: "GP Connect Integration", starter: false, professional: true, enterprise: true },
        { name: "NHS Spine Integration", starter: false, professional: true, enterprise: true },
        { name: "Pharmacy System Integration", starter: false, professional: true, enterprise: true },
        { name: "Laboratory Results", starter: false, professional: true, enterprise: true },
        { name: "Electronic Prescriptions", starter: false, professional: false, enterprise: true },
        { name: "Healthcare Provider Portal", starter: false, professional: false, enterprise: true },
        { name: "NHS Mail Integration", starter: false, professional: true, enterprise: true },
        { name: "Emergency Services Integration", starter: false, professional: false, enterprise: true }
      ]
    },
    {
      name: "Assessment Tools",
      features: [
        { name: "Pre-admission Assessment", starter: true, professional: true, enterprise: true },
        { name: "Risk Assessments", starter: true, professional: true, enterprise: true },
        { name: "Care Needs Assessment", starter: true, professional: true, enterprise: true },
        { name: "Mental Capacity Assessment", starter: false, professional: true, enterprise: true },
        { name: "Custom Assessment Forms", starter: false, professional: true, enterprise: true },
        { name: "Assessment Analytics", starter: false, professional: false, enterprise: true },
        { name: "Dependency Level Scoring", starter: false, professional: true, enterprise: true },
        { name: "Nutrition & Hydration", starter: true, professional: true, enterprise: true }
      ]
    },
    {
      name: "Quality & Compliance",
      features: [
        { name: "CQC Compliance Tools", starter: true, professional: true, enterprise: true },
        { name: "GDPR Controls", starter: true, professional: true, enterprise: true },
        { name: "Audit Trail", starter: true, professional: true, enterprise: true },
        { name: "Custom Policies", starter: false, professional: true, enterprise: true },
        { name: "Advanced Security", starter: false, professional: true, enterprise: true },
        { name: "Multi-Factor Auth", starter: false, professional: true, enterprise: true },
        { name: "Quality Assurance Tools", starter: false, professional: true, enterprise: true },
        { name: "Regulatory Reporting", starter: false, professional: true, enterprise: true }
      ]
    },
    {
      name: "Staff & HR Management",
      features: [
        { name: "Staff Records", starter: true, professional: true, enterprise: true },
        { name: "Training Management", starter: true, professional: true, enterprise: true },
        { name: "Document Management", starter: true, professional: true, enterprise: true },
        { name: "Performance Reviews", starter: false, professional: true, enterprise: true },
        { name: "HR Documentation", starter: false, professional: true, enterprise: true },
        { name: "Advanced HR Analytics", starter: false, professional: false, enterprise: true },
        { name: "Staff Scheduling", starter: true, professional: true, enterprise: true },
        { name: "Agency Staff Management", starter: false, professional: true, enterprise: true }
      ]
    },
    {
      name: "Reporting & Analytics",
      features: [
        { name: "Basic Reports", starter: true, professional: true, enterprise: true },
        { name: "Custom Reports", starter: false, professional: true, enterprise: true },
        { name: "Data Export", starter: true, professional: true, enterprise: true },
        { name: "Advanced Analytics", starter: false, professional: true, enterprise: true },
        { name: "Business Intelligence", starter: false, professional: false, enterprise: true },
        { name: "KPI Dashboards", starter: false, professional: true, enterprise: true },
        { name: "Trend Analysis", starter: false, professional: true, enterprise: true },
        { name: "Custom Dashboards", starter: false, professional: false, enterprise: true }
      ]
    },
    {
      name: "Support & Training",
      features: [
        { name: "Email Support", starter: true, professional: true, enterprise: true },
        { name: "Phone Support", starter: false, professional: true, enterprise: true },
        { name: "24/7 Emergency Support", starter: false, professional: true, enterprise: true },
        { name: "Video Training Library", starter: true, professional: true, enterprise: true },
        { name: "Custom Training", starter: false, professional: false, enterprise: true },
        { name: "Dedicated Account Manager", starter: false, professional: false, enterprise: true },
        { name: "Onsite Training", starter: false, professional: false, enterprise: true },
        { name: "Implementation Support", starter: true, professional: true, enterprise: true }
      ]
    }
  ]
}

export function Pricing() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-20">
          <div className="mx-auto max-w-4xl lg:mx-0 lg:flex-shrink-0 lg:pt-8">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl">
              Choose the perfect plan for your care home. All plans include core features, regular updates, and our commitment to security and compliance.
            </p>
            <div className="mt-8 flex items-center gap-x-4">
              <div className="flex items-center gap-x-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">No setup fees</span>
              </div>
              <div className="flex items-center gap-x-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">Free data migration</span>
              </div>
              <div className="flex items-center gap-x-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Timeline */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Quick and Easy Implementation
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We'll have you up and running quickly with our proven implementation process
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="relative p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 left-8 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Week 1
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Setup & Configuration</h3>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li className="flex gap-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>System configuration</span>
                </li>
                <li className="flex gap-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Data migration planning</span>
                </li>
                <li className="flex gap-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Initial staff training</span>
                </li>
              </ul>
            </Card>
            <Card className="relative p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 left-8 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Week 2-3
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Data & Training</h3>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li className="flex gap-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Data migration</span>
                </li>
                <li className="flex gap-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Staff training sessions</span>
                </li>
                <li className="flex gap-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Process customization</span>
                </li>
              </ul>
            </Card>
            <Card className="relative p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 left-8 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Week 4
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Go Live</h3>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li className="flex gap-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>System launch</span>
                </li>
                <li className="flex gap-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Ongoing support</span>
                </li>
                <li className="flex gap-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Success monitoring</span>
                </li>
              </ul>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              * Implementation timeline may vary based on care home size and requirements
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="isolate mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -right-20 top-8 rotate-45">
                  <Badge className="bg-blue-500 text-white px-8 py-1">Most Popular</Badge>
                </div>
              )}
              <div className="p-8">
                <h3 className="text-xl font-semibold leading-7">{plan.name}</h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span className={`text-4xl font-bold tracking-tight ${plan.price === "Custom" ? "text-gray-900" : "text-blue-600"}`}>{plan.price}</span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">{plan.period}</span>
                </p>
                <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                <Button asChild className={`mt-6 w-full rounded-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
                  <Link href="/demo">Get Started</Link>
                </Button>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex gap-x-3">
                      <feature.icon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                      {feature.text}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24" id="compare">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Feature Comparison</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compare our plans to find the perfect fit for your care home
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="w-[300px] py-6 text-lg font-semibold">Feature</TableHead>
                <TableHead className="text-center py-6">
                  <div className="text-lg font-semibold">Starter</div>
                  <div className="text-sm text-gray-500">£99/month</div>
                </TableHead>
                <TableHead className="text-center py-6 bg-blue-50/50">
                  <div className="text-lg font-semibold text-blue-600">Professional</div>
                  <div className="text-sm text-blue-500">£199/month</div>
                  <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-600">Most Popular</Badge>
                </TableHead>
                <TableHead className="text-center py-6">
                  <div className="text-lg font-semibold">Enterprise</div>
                  <div className="text-sm text-gray-500">Custom pricing</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {featureComparison.categories.map((category, categoryIndex) => (
                <React.Fragment key={`category-${categoryIndex}`}>
                  <TableRow>
                    <TableCell 
                      colSpan={4} 
                      className="bg-gradient-to-r from-gray-50 to-gray-50/50 py-4"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    </TableCell>
                  </TableRow>
                  {category.features.map((feature, featureIndex) => (
                    <TableRow 
                      key={`${category.name}-${feature.name}-${featureIndex}`}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="font-medium py-4">{feature.name}</TableCell>
                      <TableCell className="text-center">
                        {feature.starter ? (
                          <div className="flex items-center justify-center">
                            <Check className="h-5 w-5 text-green-500" />
                            <span className="sr-only">Yes</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Minus className="h-5 w-5 text-gray-300" />
                            <span className="sr-only">No</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center bg-blue-50/20">
                        {feature.professional ? (
                          <div className="flex items-center justify-center">
                            <Check className="h-5 w-5 text-green-500" />
                            <span className="sr-only">Yes</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Minus className="h-5 w-5 text-gray-300" />
                            <span className="sr-only">No</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {feature.enterprise ? (
                          <div className="flex items-center justify-center">
                            <Check className="h-5 w-5 text-green-500" />
                            <span className="sr-only">Yes</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Minus className="h-5 w-5 text-gray-300" />
                            <span className="sr-only">No</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help choosing? <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">Talk to our team</Link>
          </p>
        </div>
      </div>
    </>
  )
} 