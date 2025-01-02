/**
 * WriteCareNotes.com
 * @fileoverview Infection Control Documentation - Infection prevention and control resources
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
  ShieldCheck,
  Clock,
  Microscope,
  ClipboardCheck,
  BookOpen,
  Syringe,
  Sparkles,
  Stethoscope
} from "lucide-react"

export const metadata: Metadata = {
  title: "Infection Control Documentation | Write Care Notes",
  description: "Access infection prevention and control resources, protocols, and guidance for maintaining a safe care environment.",
  keywords: "infection control, infection prevention, IPC protocols, care home hygiene, outbreak management",
}

const ipcForms = [
  {
    title: "IPC Risk Assessment",
    description: "Infection prevention and control assessment",
    format: "DOCX",
    size: "345 KB",
    category: "Core",
    lastUpdated: "March 2024"
  },
  {
    title: "Outbreak Management Plan",
    description: "Protocols for managing infection outbreaks",
    format: "DOCX",
    size: "298 KB",
    category: "Management",
    lastUpdated: "March 2024"
  },
  {
    title: "Cleaning Schedule Template",
    description: "Enhanced cleaning and disinfection records",
    format: "XLSX",
    size: "275 KB",
    category: "Cleaning",
    lastUpdated: "March 2024"
  },
  {
    title: "PPE Audit Tool",
    description: "Personal protective equipment compliance",
    format: "DOCX",
    size: "312 KB",
    category: "PPE",
    lastUpdated: "March 2024"
  }
]

const ipcTools = [
  {
    title: "Hand Hygiene",
    description: "Hand washing and sanitization guide",
    icon: Sparkles,
    category: "Hygiene"
  },
  {
    title: "PPE Guidance",
    description: "PPE selection and usage protocols",
    icon: Syringe,
    category: "PPE"
  },
  {
    title: "Environmental Cleaning",
    description: "Cleaning and disinfection protocols",
    icon: Sparkles,
    category: "Cleaning"
  },
  {
    title: "Surveillance Tools",
    description: "Infection monitoring and tracking",
    icon: Microscope,
    category: "Monitoring"
  }
]

const ipcGuidance = [
  {
    title: "IPC Standards",
    description: "Core infection control requirements",
    icon: ShieldCheck,
    href: "/resources/documentation/infection-control/standards"
  },
  {
    title: "Best Practices",
    description: "Evidence-based IPC practices",
    icon: BookOpen,
    href: "/resources/documentation/infection-control/best-practices"
  },
  {
    title: "Compliance Guide",
    description: "Regulatory compliance guidance",
    icon: ClipboardCheck,
    href: "/resources/documentation/infection-control/compliance"
  }
]

export default function InfectionControlPage() {
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
            Infection Control
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Essential resources for infection prevention and control
          </p>
        </div>

        {/* Update Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            Updated with latest IPC guidelines
          </div>
        </div>

        {/* IPC Forms */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            IPC Forms
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Essential documentation for infection control
          </p>
          
          <div className="mt-8 space-y-4">
            {ipcForms.map((form) => (
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

        {/* IPC Tools */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            IPC Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Resources for infection prevention and control
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ipcTools.map((tool) => (
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

        {/* IPC Guidance */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            IPC Guidance
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Best practice guidance for infection control
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {ipcGuidance.map((guide) => (
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
            Need help with infection control?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Our specialists can help optimize your infection prevention processes
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/demo">Book Consultation</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-white hover:bg-blue-500" asChild>
              <Link href="/resources/documentation/infection-control/consultation">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 