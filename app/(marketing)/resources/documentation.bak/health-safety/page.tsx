/**
 * WriteCareNotes.com
 * @fileoverview Health & Safety Documentation - Risk assessments and safety protocols
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
  ShieldCheck,
  Clock,
  AlertTriangle,
  ClipboardCheck,
  BookOpen,
  HardHat,
  Flame,
  Shield
} from "lucide-react"

export const metadata: Metadata = {
  title: "Health & Safety Documentation | Write Care Notes",
  description: "Access risk assessment templates, safety protocols, and guidance for maintaining a safe care home environment.",
  keywords: "health and safety, risk assessment, safety protocols, care home safety, workplace safety",
}

const safetyForms = [
  {
    title: "Risk Assessment Template",
    description: "Comprehensive risk assessment framework",
    format: "DOCX",
    size: "345 KB",
    category: "Core",
    lastUpdated: "March 2024"
  },
  {
    title: "Hazard Reporting Form",
    description: "Documentation for identifying and reporting hazards",
    format: "DOCX",
    size: "275 KB",
    category: "Reporting",
    lastUpdated: "March 2024"
  },
  {
    title: "Safety Audit Checklist",
    description: "Regular safety inspection template",
    format: "XLSX",
    size: "298 KB",
    category: "Audit",
    lastUpdated: "March 2024"
  },
  {
    title: "COSHH Assessment Form",
    description: "Control of substances hazardous to health",
    format: "DOCX",
    size: "312 KB",
    category: "COSHH",
    lastUpdated: "March 2024"
  }
]

const safetyTools = [
  {
    title: "Fire Safety",
    description: "Fire risk assessment and procedures",
    icon: Flame,
    category: "Fire"
  },
  {
    title: "PPE Guidelines",
    description: "Personal protective equipment guide",
    icon: HardHat,
    category: "PPE"
  },
  {
    title: "Accident Prevention",
    description: "Preventive measures and controls",
    icon: Shield,
    category: "Prevention"
  },
  {
    title: "Emergency Response",
    description: "Emergency procedures and protocols",
    icon: AlertTriangle,
    category: "Emergency"
  }
]

const safetyGuidance = [
  {
    title: "Safety Standards",
    description: "Core health and safety requirements",
    icon: ShieldCheck,
    href: "/resources/documentation/health-safety/standards"
  },
  {
    title: "Best Practices",
    description: "Safety management best practices",
    icon: BookOpen,
    href: "/resources/documentation/health-safety/best-practices"
  },
  {
    title: "Compliance Guide",
    description: "Regulatory compliance guidance",
    icon: ClipboardCheck,
    href: "/resources/documentation/health-safety/compliance"
  }
]

export default function HealthAndSafetyPage() {
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
            Health & Safety
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Essential resources for maintaining a safe care environment
          </p>
        </div>

        {/* Update Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            Updated with latest safety regulations
          </div>
        </div>

        {/* Safety Forms */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Safety Forms
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Essential documentation for safety management
          </p>
          
          <div className="mt-8 space-y-4">
            {safetyForms.map((form) => (
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

        {/* Safety Tools */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Safety Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Resources for maintaining workplace safety
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {safetyTools.map((tool) => (
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

        {/* Safety Guidance */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Safety Guidance
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Best practice guidance for health and safety
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {safetyGuidance.map((guide) => (
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
            Need help with health and safety?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Our specialists can help optimize your safety management processes
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/demo">Book Consultation</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-white hover:bg-blue-500" asChild>
              <Link href="/resources/documentation/health-safety/consultation">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 