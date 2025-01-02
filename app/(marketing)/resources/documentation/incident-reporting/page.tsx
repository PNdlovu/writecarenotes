/**
 * WriteCareNotes.com
 * @fileoverview Incident Reporting Documentation - Templates and guidelines for incident management
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
  AlertTriangle,
  Shield,
  LineChart,
  Clock,
  FileSearch,
  AlertCircle,
  BookOpen,
  Megaphone
} from "lucide-react"

export const metadata: Metadata = {
  title: "Incident Reporting Documentation | Write Care Notes",
  description: "Access incident report templates, investigation forms, and guidance for managing and reporting incidents in care homes.",
  keywords: "incident reporting, accident reports, safeguarding, incident investigation, care home safety",
}

const incidentForms = [
  {
    title: "Incident Report Form",
    description: "Comprehensive incident documentation template",
    format: "DOCX",
    size: "295 KB",
    category: "Core",
    lastUpdated: "March 2024"
  },
  {
    title: "Investigation Template",
    description: "Structured incident investigation documentation",
    format: "DOCX",
    size: "312 KB",
    category: "Investigation",
    lastUpdated: "March 2024"
  },
  {
    title: "Witness Statement Form",
    description: "Template for recording witness accounts",
    format: "DOCX",
    size: "245 KB",
    category: "Statements",
    lastUpdated: "March 2024"
  },
  {
    title: "Root Cause Analysis Tool",
    description: "Framework for identifying incident causes",
    format: "XLSX",
    size: "328 KB",
    category: "Analysis",
    lastUpdated: "March 2024"
  }
]

const reportingTools = [
  {
    title: "Incident Tracker",
    description: "Monitor and analyze incident patterns",
    icon: LineChart,
    category: "Monitoring"
  },
  {
    title: "Risk Register",
    description: "Document and track identified risks",
    icon: Shield,
    category: "Risk"
  },
  {
    title: "Investigation Guide",
    description: "Step-by-step incident investigation process",
    icon: FileSearch,
    category: "Process"
  },
  {
    title: "Notification Matrix",
    description: "Guide for incident escalation and reporting",
    icon: Megaphone,
    category: "Reporting"
  }
]

const guidanceDocuments = [
  {
    title: "Reporting Requirements",
    description: "Regulatory reporting guidelines and timeframes",
    icon: AlertCircle,
    href: "/resources/documentation/incident-reporting/requirements"
  },
  {
    title: "Best Practices",
    description: "Incident management and prevention guidance",
    icon: BookOpen,
    href: "/resources/documentation/incident-reporting/best-practices"
  },
  {
    title: "Learning Framework",
    description: "System for learning from incidents",
    icon: AlertTriangle,
    href: "/resources/documentation/incident-reporting/learning"
  }
]

export default function IncidentReportingPage() {
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
            Incident Reporting
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Essential documentation for managing and reporting incidents effectively
          </p>
        </div>

        {/* Update Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            Updated with latest CQC incident reporting requirements
          </div>
        </div>

        {/* Incident Forms */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Incident Forms
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Professional templates for incident documentation and investigation
          </p>
          
          <div className="mt-8 space-y-4">
            {incidentForms.map((form) => (
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

        {/* Reporting Tools */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Reporting Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Tools for tracking and analyzing incidents
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reportingTools.map((tool) => (
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

        {/* Guidance Documents */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Guidance Documents
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Best practice guidance for incident management
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {guidanceDocuments.map((guide) => (
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
            Need help with incident management?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Our specialists can help optimize your incident reporting and investigation processes
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/demo">Book Consultation</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-white hover:bg-blue-500" asChild>
              <Link href="/resources/documentation/incident-reporting/consultation">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 