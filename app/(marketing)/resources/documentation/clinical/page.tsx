/**
 * WriteCareNotes.com
 * @fileoverview Clinical Documentation - Medical records and treatment plans
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  FileText,
  Download,
  ClipboardList,
  FileCheck,
  ArrowLeft,
  Stethoscope,
  Pill,
  Activity,
  Heart,
  Brain,
  Thermometer,
  AlertCircle,
  Clock
} from "lucide-react"

export const metadata: Metadata = {
  title: "Clinical Documentation | Write Care Notes",
  description: "Access medical records, treatment plans, and health assessment templates for care home residents.",
  keywords: "clinical documentation, medical records, treatment plans, health assessments, care home clinical forms",
}

const clinicalForms = [
  {
    title: "Medical Assessment Form",
    description: "Comprehensive medical evaluation template",
    format: "PDF",
    size: "325 KB",
    category: "Assessment",
    lastUpdated: "March 2024"
  },
  {
    title: "Treatment Plan Template",
    description: "Structured care and treatment planning document",
    format: "DOCX",
    size: "280 KB",
    category: "Planning",
    lastUpdated: "March 2024"
  },
  {
    title: "Medication Administration Record",
    description: "MAR chart template with medication tracking",
    format: "XLSX",
    size: "245 KB",
    category: "Medication",
    lastUpdated: "March 2024"
  },
  {
    title: "Health Monitoring Chart",
    description: "Daily health observations and vital signs record",
    format: "PDF",
    size: "198 KB",
    category: "Monitoring",
    lastUpdated: "March 2024"
  }
]

const specializedAssessments = [
  {
    title: "Mental Health Assessment",
    description: "Comprehensive mental health evaluation tools",
    icon: Brain,
    category: "Mental Health"
  },
  {
    title: "Wound Care Assessment",
    description: "Wound assessment and treatment planning",
    icon: Heart,
    category: "Wound Care"
  },
  {
    title: "Pain Assessment",
    description: "Pain evaluation and management tools",
    icon: Activity,
    category: "Pain Management"
  },
  {
    title: "Nutrition Assessment",
    description: "Dietary needs and nutrition planning",
    icon: Thermometer,
    category: "Nutrition"
  }
]

const clinicalGuidelines = [
  {
    title: "Medication Management",
    description: "Guidelines for safe medication administration",
    icon: Pill,
    href: "/resources/documentation/clinical/medication"
  },
  {
    title: "Clinical Observations",
    description: "Best practices for health monitoring",
    icon: Stethoscope,
    href: "/resources/documentation/clinical/observations"
  },
  {
    title: "Emergency Procedures",
    description: "Clinical emergency response protocols",
    icon: AlertCircle,
    href: "/resources/documentation/clinical/emergency"
  }
]

export default function ClinicalDocumentationPage() {
  return (
    <div className="bg-gradient-to-b from-blue-50/50 via-white to-blue-50/30 min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/resources/documentation">
              <ArrowLeft className="h-4 w-4" />
              Back to Documentation Center
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Clinical Documentation
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Essential clinical forms and templates for comprehensive resident care
          </p>
        </div>

        {/* Update Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            Updated with latest clinical best practices
          </div>
        </div>

        {/* Clinical Forms */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Clinical Forms
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Essential documentation for clinical care and monitoring
          </p>
          
          <div className="mt-8 space-y-4">
            {clinicalForms.map((form) => (
              <Card key={form.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {form.title}
                        </h3>
                        <Badge variant="secondary">{form.category}</Badge>
                      </div>
                      <p className="mt-1 text-gray-600">
                        {form.description}
                      </p>
                      <div className="mt-2 text-sm text-gray-500">
                        Last updated: {form.lastUpdated}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {form.format} • {form.size}
                    </span>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Specialized Assessments */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Specialized Assessments
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Comprehensive assessment tools for specific care needs
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {specializedAssessments.map((assessment) => (
              <Card key={assessment.title} className="p-6">
                <div className="rounded-lg bg-blue-50 p-3 w-fit">
                  <assessment.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {assessment.title}
                    </h3>
                    <Badge variant="outline">{assessment.category}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {assessment.description}
                  </p>
                  <Button variant="link" className="mt-4 p-0">
                    Access tools →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Clinical Guidelines */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Clinical Guidelines
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Best practice guidance for clinical care delivery
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {clinicalGuidelines.map((guide) => (
              <Card key={guide.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="rounded-lg bg-blue-50 p-3 w-fit">
                  <guide.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900">
                    {guide.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {guide.description}
                  </p>
                  <Button variant="link" asChild className="mt-4 p-0">
                    <Link href={guide.href}>View guidelines →</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-12 text-center sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Need clinical support?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Our clinical specialists can help optimize your documentation and care processes
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/demo">Book Consultation</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-white hover:bg-blue-500" asChild>
              <Link href="/resources/documentation/clinical/consultation">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 