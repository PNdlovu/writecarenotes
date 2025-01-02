/**
 * WriteCareNotes.com
 * @fileoverview Care Planning Documentation - Templates and guidelines for resident care plans
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Metadata } from "next"
import { Button } from "@/components/ui/Button/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge/Badge"
import Link from "next/link"
import { 
  FileText,
  Download,
  ClipboardList,
  FileCheck,
  ArrowLeft,
  Heart,
  Calendar,
  Activity,
  Users,
  Clock,
  Target,
  Sparkles,
  CheckCircle2
} from "lucide-react"

export const metadata: Metadata = {
  title: "Care Planning Documentation | Write Care Notes",
  description: "Access care plan templates, risk assessments, and review documentation for resident care planning.",
  keywords: "care planning, care plan templates, risk assessments, care reviews, person-centered care",
}

const carePlanTemplates = [
  {
    title: "Person-Centered Care Plan",
    description: "Comprehensive template focusing on individual needs and preferences",
    format: "DOCX",
    size: "345 KB",
    category: "Core",
    lastUpdated: "March 2024"
  },
  {
    title: "Daily Care Routine Plan",
    description: "Structured template for daily care activities and preferences",
    format: "DOCX",
    size: "275 KB",
    category: "Daily Care",
    lastUpdated: "March 2024"
  },
  {
    title: "Risk Assessment Bundle",
    description: "Collection of essential risk assessment templates",
    format: "ZIP",
    size: "520 KB",
    category: "Risk",
    lastUpdated: "March 2024"
  },
  {
    title: "Care Review Template",
    description: "Monthly and quarterly care plan review documentation",
    format: "DOCX",
    size: "298 KB",
    category: "Review",
    lastUpdated: "March 2024"
  }
]

const assessmentTools = [
  {
    title: "Activities of Daily Living",
    description: "Assessment tool for daily living capabilities",
    icon: Activity,
    category: "Core"
  },
  {
    title: "Social Care Needs",
    description: "Social interaction and engagement assessment",
    icon: Users,
    category: "Social"
  },
  {
    title: "Goal Setting Template",
    description: "Person-centered goal planning framework",
    icon: Target,
    category: "Planning"
  },
  {
    title: "Outcome Tracking",
    description: "Monitor and evaluate care outcomes",
    icon: CheckCircle2,
    category: "Monitoring"
  }
]

const planningGuides = [
  {
    title: "Person-Centered Planning",
    description: "Guide to creating individualized care plans",
    icon: Heart,
    href: "/resources/documentation/care-planning/person-centered"
  },
  {
    title: "Review Best Practices",
    description: "Guidelines for effective care plan reviews",
    icon: Calendar,
    href: "/resources/documentation/care-planning/reviews"
  },
  {
    title: "Quality Outcomes",
    description: "Framework for measuring care quality",
    icon: Sparkles,
    href: "/resources/documentation/care-planning/outcomes"
  }
]

export default function CarePlanningPage() {
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
            Care Planning
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Essential templates and tools for person-centered care planning
          </p>
        </div>

        {/* Update Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            Updated with latest CQC care planning guidance
          </div>
        </div>

        {/* Care Plan Templates */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Care Plan Templates
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Professional templates for comprehensive care planning
          </p>
          
          <div className="mt-8 space-y-4">
            {carePlanTemplates.map((template) => (
              <Card key={template.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {template.title}
                        </h3>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                      <p className="mt-1 text-gray-600">
                        {template.description}
                      </p>
                      <div className="mt-2 text-sm text-gray-500">
                        Last updated: {template.lastUpdated}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {template.format} • {template.size}
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

        {/* Assessment Tools */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Assessment Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Tools for evaluating care needs and tracking outcomes
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {assessmentTools.map((tool) => (
              <Card key={tool.title} className="p-6">
                <div className="rounded-lg bg-blue-50 p-3 w-fit">
                  <tool.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {tool.title}
                    </h3>
                    <Badge variant="outline">{tool.category}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {tool.description}
                  </p>
                  <Button variant="link" className="mt-4 p-0">
                    Access tool →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Planning Guides */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Planning Guides
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Best practice guidance for effective care planning
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {planningGuides.map((guide) => (
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
                    <Link href={guide.href}>View guide →</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-12 text-center sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Need help with care planning?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Our care planning specialists can help optimize your documentation process
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/demo">Book Consultation</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-white hover:bg-blue-500" asChild>
              <Link href="/resources/documentation/care-planning/consultation">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 