/**
 * WriteCareNotes.com
 * @fileoverview Medication Management Documentation - MAR charts and medication protocols
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
  Pill,
  Clock,
  AlertTriangle,
  ClipboardCheck,
  BookOpen,
  Stethoscope,
  ShieldCheck,
  LineChart
} from "lucide-react"

export const metadata: Metadata = {
  title: "Medication Management Documentation | Write Care Notes",
  description: "Access medication administration records, protocols, and guidance for safe medication management in care homes.",
  keywords: "medication management, MAR charts, medication protocols, care home medication, medication safety",
}

const medicationForms = [
  {
    title: "MAR Chart Template",
    description: "Comprehensive medication administration record",
    format: "XLSX",
    size: "345 KB",
    category: "Core",
    lastUpdated: "March 2024"
  },
  {
    title: "Medication Incident Form",
    description: "Documentation for medication errors and near misses",
    format: "DOCX",
    size: "275 KB",
    category: "Incident",
    lastUpdated: "March 2024"
  },
  {
    title: "PRN Protocol Template",
    description: "Guidelines for as-needed medication administration",
    format: "DOCX",
    size: "298 KB",
    category: "Protocol",
    lastUpdated: "March 2024"
  },
  {
    title: "Controlled Drugs Register",
    description: "Record keeping for controlled medications",
    format: "XLSX",
    size: "312 KB",
    category: "Control",
    lastUpdated: "March 2024"
  }
]

const managementTools = [
  {
    title: "Stock Control",
    description: "Medication inventory management system",
    icon: ClipboardCheck,
    category: "Inventory"
  },
  {
    title: "Audit Checklist",
    description: "Medication management audit tool",
    icon: ShieldCheck,
    category: "Audit"
  },
  {
    title: "Compliance Monitor",
    description: "Track medication administration compliance",
    icon: LineChart,
    category: "Monitoring"
  },
  {
    title: "Assessment Tool",
    description: "Medication needs assessment framework",
    icon: Stethoscope,
    category: "Assessment"
  }
]

const safetyGuidelines = [
  {
    title: "Administration Guide",
    description: "Safe medication administration protocols",
    icon: Pill,
    href: "/resources/documentation/medication/administration"
  },
  {
    title: "Safety Standards",
    description: "Medication safety requirements",
    icon: AlertTriangle,
    href: "/resources/documentation/medication/safety"
  },
  {
    title: "Best Practices",
    description: "Current best practice guidance",
    icon: BookOpen,
    href: "/resources/documentation/medication/best-practices"
  }
]

export default function MedicationManagementPage() {
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
            Medication Management
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Essential documentation for safe medication administration and control
          </p>
        </div>

        {/* Update Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            Updated with latest NICE medication guidelines
          </div>
        </div>

        {/* Medication Forms */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Medication Forms
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Essential documentation for medication management
          </p>
          
          <div className="mt-8 space-y-4">
            {medicationForms.map((form) => (
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
            Tools for effective medication management
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

        {/* Safety Guidelines */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Safety Guidelines
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Best practice guidance for medication safety
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {safetyGuidelines.map((guide) => (
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
            Need help with medication management?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Our specialists can help optimize your medication administration processes
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/demo">Book Consultation</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-white hover:bg-blue-500" asChild>
              <Link href="/resources/documentation/medication/consultation">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 