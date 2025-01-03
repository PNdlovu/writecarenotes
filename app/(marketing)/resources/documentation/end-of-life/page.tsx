/**
 * WriteCareNotes.com
 * @fileoverview End of Life Care Documentation - Care planning and support resources
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
  Clock,
  Users,
  ClipboardCheck,
  BookOpen,
  HeartPulse,
  Flower2,
  Stethoscope
} from "lucide-react"

export const metadata: Metadata = {
  title: "End of Life Care Documentation | Write Care Notes",
  description: "Access end of life care planning templates, assessment tools, and guidance for providing compassionate palliative care.",
  keywords: "end of life care, palliative care, advance care planning, care home documentation, end of life support",
}

const carePlanningForms = [
  {
    title: "End of Life Care Plan",
    description: "Comprehensive care planning template",
    format: "DOCX",
    size: "345 KB",
    category: "Core",
    lastUpdated: "March 2024"
  },
  {
    title: "Advance Care Planning",
    description: "Documentation for resident wishes and preferences",
    format: "DOCX",
    size: "298 KB",
    category: "Planning",
    lastUpdated: "March 2024"
  },
  {
    title: "Symptom Assessment Tool",
    description: "Monitoring and management of symptoms",
    format: "PDF",
    size: "275 KB",
    category: "Assessment",
    lastUpdated: "March 2024"
  },
  {
    title: "Family Support Plan",
    description: "Framework for supporting families and loved ones",
    format: "DOCX",
    size: "312 KB",
    category: "Support",
    lastUpdated: "March 2024"
  }
]

const supportTools = [
  {
    title: "Comfort Care Guide",
    description: "Managing comfort and dignity",
    icon: Heart,
    category: "Care"
  },
  {
    title: "Family Communication",
    description: "Supporting conversations with families",
    icon: Users,
    category: "Support"
  },
  {
    title: "Spiritual Care",
    description: "Spiritual and cultural support guidance",
    icon: Flower2,
    category: "Spiritual"
  },
  {
    title: "Care After Death",
    description: "Post-death care procedures",
    icon: Stethoscope,
    category: "Procedures"
  }
]

const bestPracticeGuides = [
  {
    title: "Care Standards",
    description: "End of life care best practices",
    icon: HeartPulse,
    href: "/resources/documentation/end-of-life/standards"
  },
  {
    title: "Staff Support",
    description: "Supporting staff delivering end of life care",
    icon: ClipboardCheck,
    href: "/resources/documentation/end-of-life/staff-support"
  },
  {
    title: "Clinical Guidelines",
    description: "Evidence-based care protocols",
    icon: BookOpen,
    href: "/resources/documentation/end-of-life/clinical-guidelines"
  }
]

export default function EndOfLifeCarePage() {
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
            End of Life Care
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Essential resources for providing compassionate end of life care
          </p>
        </div>

        {/* Update Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            Updated with latest palliative care guidelines
          </div>
        </div>

        {/* Care Planning Forms */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Care Planning Forms
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Essential documentation for end of life care planning
          </p>
          
          <div className="mt-8 space-y-4">
            {carePlanningForms.map((form) => (
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

        {/* Support Tools */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Support Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Resources for providing comprehensive support
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {supportTools.map((tool) => (
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

        {/* Best Practice Guides */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Best Practice Guides
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Guidance for delivering high-quality end of life care
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {bestPracticeGuides.map((guide) => (
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
            Need support with end of life care?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Our specialists can help enhance your end of life care provision
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/demo">Book Consultation</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-white hover:bg-blue-500" asChild>
              <Link href="/resources/documentation/end-of-life/consultation">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 
