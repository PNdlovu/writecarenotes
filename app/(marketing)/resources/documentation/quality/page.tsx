/**
 * WriteCareNotes.com
 * @fileoverview Quality Assurance Documentation - Audit tools and quality monitoring templates
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
  CheckCircle2,
  LineChart,
  Clock,
  Search,
  BarChart3,
  ClipboardCheck,
  Target,
  Sparkles
} from "lucide-react"

export const metadata: Metadata = {
  title: "Quality Assurance Documentation | Write Care Notes",
  description: "Access audit tools, quality monitoring templates, and improvement frameworks for care home quality assurance.",
  keywords: "quality assurance, audit tools, quality monitoring, care standards, CQC compliance",
}

const auditTools = [
  {
    title: "Care Quality Audit Tool",
    description: "Comprehensive care standards assessment",
    format: "XLSX",
    size: "425 KB",
    category: "Core",
    lastUpdated: "March 2024"
  },
  {
    title: "Mock Inspection Checklist",
    description: "CQC-aligned inspection preparation tool",
    format: "DOCX",
    size: "315 KB",
    category: "Inspection",
    lastUpdated: "March 2024"
  },
  {
    title: "Quality Metrics Dashboard",
    description: "Key performance indicators template",
    format: "XLSX",
    size: "385 KB",
    category: "Monitoring",
    lastUpdated: "March 2024"
  },
  {
    title: "Improvement Action Plan",
    description: "Template for tracking quality improvements",
    format: "DOCX",
    size: "275 KB",
    category: "Planning",
    lastUpdated: "March 2024"
  }
]

const monitoringTools = [
  {
    title: "Quality Indicators",
    description: "Track key quality metrics",
    icon: BarChart3,
    category: "Metrics"
  },
  {
    title: "Compliance Tracker",
    description: "Monitor regulatory compliance",
    icon: CheckCircle2,
    category: "Compliance"
  },
  {
    title: "Audit Schedule",
    description: "Annual quality audit planner",
    icon: ClipboardCheck,
    category: "Planning"
  },
  {
    title: "Outcomes Framework",
    description: "Measure quality outcomes",
    icon: Target,
    category: "Outcomes"
  }
]

const qualityGuidance = [
  {
    title: "Quality Standards",
    description: "Core quality standards and expectations",
    icon: Sparkles,
    href: "/resources/documentation/quality/standards"
  },
  {
    title: "Audit Process",
    description: "Guide to conducting effective audits",
    icon: Search,
    href: "/resources/documentation/quality/audit-process"
  },
  {
    title: "Performance Analysis",
    description: "Framework for analyzing quality data",
    icon: LineChart,
    href: "/resources/documentation/quality/analysis"
  }
]

export default function QualityAssurancePage() {
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
            Quality Assurance
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Essential tools and templates for maintaining high care standards
          </p>
        </div>

        {/* Update Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            Updated with latest CQC quality framework
          </div>
        </div>

        {/* Audit Tools */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Audit Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Professional templates for quality monitoring and improvement
          </p>
          
          <div className="mt-8 space-y-4">
            {auditTools.map((tool) => (
              <Card key={tool.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {tool.title}
                        </h3>
                        <Badge variant="secondary">{tool.category}</Badge>
                      </div>
                      <p className="mt-1 text-gray-600">
                        {tool.description}
                      </p>
                      <div className="mt-2 text-sm text-gray-500">
                        Last updated: {tool.lastUpdated}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {tool.format} • {tool.size}
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

        {/* Monitoring Tools */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Monitoring Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Tools for tracking and improving care quality
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {monitoringTools.map((tool) => (
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

        {/* Quality Guidance */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Quality Guidance
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Best practice guidance for quality assurance
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {qualityGuidance.map((guide) => (
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
            Need help with quality assurance?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Our quality specialists can help optimize your monitoring and improvement processes
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/demo">Book Consultation</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-white hover:bg-blue-500" asChild>
              <Link href="/resources/documentation/quality/consultation">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 
