/**
 * WriteCareNotes.com
 * @fileoverview Documentation Center - Essential templates, policies, and procedures
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
  Users,
  Shield,
  Clock,
  Folder,
  BookOpen,
  FileSearch,
  AlertCircle,
  CheckCircle2
} from "lucide-react"

export const metadata: Metadata = {
  title: "Documentation Center | Write Care Notes",
  description: "Access essential templates, policies, and procedures for care home management.",
  keywords: "care home documentation, policy templates, care procedures, care home forms, compliance documents",
}

const policyTemplates = [
  {
    title: "Core Policies Pack",
    description: "Essential policies required by CQC and other regulators",
    category: "Compliance",
    icon: Shield,
    count: "25+ policies",
    updated: "March 2024"
  },
  {
    title: "HR Documentation",
    description: "Staff contracts, handbooks, and HR procedures",
    category: "HR",
    icon: Users,
    count: "15+ templates",
    updated: "March 2024"
  },
  {
    title: "Care Planning Templates",
    description: "Person-centered care plan templates and assessments",
    category: "Care",
    icon: ClipboardList,
    count: "30+ templates",
    updated: "March 2024"
  },
  {
    title: "Audit Tools",
    description: "Quality assurance and compliance audit templates",
    category: "Quality",
    icon: FileCheck,
    count: "10+ tools",
    updated: "March 2024"
  }
]

const documentCategories = [
  {
    title: "Admission & Assessment",
    description: "Pre-admission assessments, contracts, and welcome packs",
    icon: FileSearch,
    href: "/resources/documentation/admission"
  },
  {
    title: "Clinical Documentation",
    description: "Medical records, treatment plans, and health assessments",
    icon: BookOpen,
    href: "/resources/documentation/clinical"
  },
  {
    title: "Risk Assessments",
    description: "Comprehensive risk assessment templates",
    icon: AlertCircle,
    href: "/resources/documentation/risk-assessment"
  },
  {
    title: "Quality Assurance",
    description: "Audit tools and quality monitoring forms",
    icon: CheckCircle2,
    href: "/resources/documentation/quality"
  }
]

const recentDocuments = [
  {
    title: "Medication Administration Record",
    description: "Updated MAR template with latest guidelines",
    format: "XLSX",
    size: "245 KB",
    updated: "1 week ago"
  },
  {
    title: "Care Plan Template",
    description: "Person-centered care planning document",
    format: "DOCX",
    size: "380 KB",
    updated: "2 weeks ago"
  },
  {
    title: "Staff Supervision Form",
    description: "Template for recording staff supervisions",
    format: "PDF",
    size: "156 KB",
    updated: "2 weeks ago"
  }
]

export default function DocumentationCenterPage() {
  return (
    <div className="bg-gradient-to-b from-blue-50/50 via-white to-blue-50/30 min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Documentation Center
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Access essential templates, policies, and procedures for efficient care home management
          </p>
        </div>

        {/* Update Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            All documents updated to latest regulatory requirements
          </div>
        </div>

        {/* Policy Templates Grid */}
        <div className="mx-auto mt-16 grid gap-8 sm:mt-20 lg:mx-0 lg:grid-cols-2">
          {policyTemplates.map((template) => (
            <Card key={template.title} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-50 p-3">
                  <template.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {template.title}
                    </h3>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <p className="mt-2 text-gray-600">
                    {template.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-blue-600 font-medium">
                      {template.count}
                    </span>
                    <span className="text-sm text-gray-500">
                      Updated: {template.updated}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Document Categories */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Document Categories
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Browse our comprehensive collection of care documentation
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {documentCategories.map((category) => (
              <Card key={category.title} className="p-6">
                <div className="rounded-lg bg-blue-50 p-3 w-fit">
                  <category.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900">
                    {category.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {category.description}
                  </p>
                  <Button variant="link" asChild className="mt-4 p-0">
                    <Link href={category.href}>Browse documents →</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Recently Updated
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Latest templates and documentation updates
          </p>
          
          <div className="mt-8 space-y-4">
            {recentDocuments.map((document) => (
              <Card key={document.title} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Download className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {document.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {document.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block text-sm text-gray-500">
                        {document.format} • {document.size}
                      </span>
                      <span className="block text-sm text-gray-500">
                        Updated {document.updated}
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-12 text-center sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Need custom documentation?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Our team can help customize templates to match your care home's specific needs
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/demo">Request Customization</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-white hover:bg-blue-500" asChild>
              <Link href="/resources/documentation/custom">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 