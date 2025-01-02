/**
 * WriteCareNotes.com
 * @fileoverview Admission & Assessment Documentation - Templates and forms for resident admission
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
  Users,
  Clock,
  FileSearch,
  ArrowLeft,
  Heart,
  Home,
  Clipboard,
  UserCheck
} from "lucide-react"

export const metadata: Metadata = {
  title: "Admission & Assessment Documentation | Write Care Notes",
  description: "Access pre-admission assessments, contracts, and welcome packs for new residents.",
  keywords: "care home admission, pre-admission assessment, resident contracts, welcome pack, care needs assessment",
}

const admissionForms = [
  {
    title: "Pre-Admission Assessment Form",
    description: "Comprehensive assessment template for evaluating potential residents",
    format: "DOCX",
    size: "285 KB",
    category: "Assessment",
    lastUpdated: "March 2024"
  },
  {
    title: "Resident Contract Template",
    description: "Standard contract template for resident admission",
    format: "DOCX",
    size: "320 KB",
    category: "Legal",
    lastUpdated: "March 2024"
  },
  {
    title: "Welcome Pack Template",
    description: "Customizable welcome information for new residents and families",
    format: "DOCX",
    size: "425 KB",
    category: "Information",
    lastUpdated: "March 2024"
  },
  {
    title: "Initial Care Needs Assessment",
    description: "Detailed assessment of resident care requirements",
    format: "PDF",
    size: "356 KB",
    category: "Assessment",
    lastUpdated: "March 2024"
  }
]

const assessmentTools = [
  {
    title: "Care Needs Checklist",
    description: "Structured evaluation of physical, mental, and social care needs",
    icon: ClipboardList,
    category: "Core"
  },
  {
    title: "Room Preference Form",
    description: "Document resident accommodation preferences and requirements",
    icon: Home,
    category: "Preferences"
  },
  {
    title: "Medical History Form",
    description: "Comprehensive medical history and medication record",
    icon: FileCheck,
    category: "Medical"
  },
  {
    title: "Social Assessment",
    description: "Evaluation of social needs, interests, and preferences",
    icon: Users,
    category: "Social"
  }
]

const quickGuides = [
  {
    title: "Admission Checklist",
    description: "Step-by-step guide for the admission process",
    icon: Clipboard,
    href: "/resources/documentation/admission/checklist"
  },
  {
    title: "Family Information Pack",
    description: "Essential information for families and representatives",
    icon: Heart,
    href: "/resources/documentation/admission/family-info"
  },
  {
    title: "Assessment Guidelines",
    description: "Best practices for conducting pre-admission assessments",
    icon: UserCheck,
    href: "/resources/documentation/admission/guidelines"
  }
]

export default function AdmissionDocumentationPage() {
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
            Admission & Assessment
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Essential documentation for resident admissions, assessments, and onboarding
          </p>
        </div>

        {/* Update Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            Updated with latest CQC admission requirements
          </div>
        </div>

        {/* Admission Forms */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Essential Forms
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Core documentation required for new resident admissions
          </p>
          
          <div className="mt-8 space-y-4">
            {admissionForms.map((form) => (
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

        {/* Assessment Tools */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Assessment Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Comprehensive assessment templates and checklists
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

        {/* Quick Guides */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Quick Guides
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Helpful resources for managing the admission process
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {quickGuides.map((guide) => (
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
            Need help with admissions?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Our team can help streamline your admission process and customize documentation
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/demo">Book Consultation</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-white hover:bg-blue-500" asChild>
              <Link href="/resources/documentation/admission/consultation">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 