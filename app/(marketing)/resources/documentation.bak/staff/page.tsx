/**
 * WriteCareNotes.com
 * @fileoverview Staff Documentation - HR forms and staff management templates
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
  Users,
  GraduationCap,
  Clock,
  Calendar,
  UserCheck,
  ClipboardCheck,
  Award,
  BookOpen
} from "lucide-react"

export const metadata: Metadata = {
  title: "Staff Documentation | Write Care Notes",
  description: "Access HR forms, training records, and staff management templates for care home staff.",
  keywords: "staff documentation, HR forms, training records, staff management, care home HR",
}

const staffForms = [
  {
    title: "Staff Application Form",
    description: "Standard employment application template",
    format: "DOCX",
    size: "285 KB",
    category: "HR",
    lastUpdated: "March 2024"
  },
  {
    title: "Staff Induction Checklist",
    description: "Comprehensive onboarding checklist",
    format: "DOCX",
    size: "245 KB",
    category: "Onboarding",
    lastUpdated: "March 2024"
  },
  {
    title: "Training Record Template",
    description: "Individual staff training documentation",
    format: "XLSX",
    size: "312 KB",
    category: "Training",
    lastUpdated: "March 2024"
  },
  {
    title: "Performance Review Form",
    description: "Staff appraisal and development template",
    format: "DOCX",
    size: "298 KB",
    category: "Performance",
    lastUpdated: "March 2024"
  }
]

const managementTools = [
  {
    title: "Staff Rota Template",
    description: "Shift planning and management tool",
    icon: Calendar,
    category: "Scheduling"
  },
  {
    title: "Training Matrix",
    description: "Track staff training requirements",
    icon: GraduationCap,
    category: "Training"
  },
  {
    title: "Competency Framework",
    description: "Staff skills assessment toolkit",
    icon: Award,
    category: "Assessment"
  },
  {
    title: "Supervision Record",
    description: "Staff supervision documentation",
    icon: ClipboardCheck,
    category: "Supervision"
  }
]

const hrGuidelines = [
  {
    title: "Recruitment Guide",
    description: "Best practices for staff recruitment",
    icon: UserCheck,
    href: "/resources/documentation/staff/recruitment"
  },
  {
    title: "Training Requirements",
    description: "Mandatory and recommended training",
    icon: BookOpen,
    href: "/resources/documentation/staff/training"
  },
  {
    title: "Staff Development",
    description: "Career progression framework",
    icon: Users,
    href: "/resources/documentation/staff/development"
  }
]

export default function StaffDocumentationPage() {
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
            Staff Documentation
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Essential HR forms and templates for effective staff management
          </p>
        </div>

        {/* Update Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            Updated with latest employment regulations
          </div>
        </div>

        {/* Staff Forms */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Staff Forms
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Essential HR documentation and templates
          </p>
          
          <div className="mt-8 space-y-4">
            {staffForms.map((form) => (
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

        {/* Management Tools */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Management Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Tools for effective staff management and development
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {managementTools.map((tool) => (
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

        {/* HR Guidelines */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            HR Guidelines
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Best practice guidance for staff management
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {hrGuidelines.map((guide) => (
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
            Need help with staff management?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Our HR specialists can help optimize your staff management processes
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/demo">Book Consultation</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-white hover:bg-blue-500" asChild>
              <Link href="/resources/documentation/staff/consultation">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 