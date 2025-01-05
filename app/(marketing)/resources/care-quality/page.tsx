/**
 * WriteCareNotes.com
 * @fileoverview Care Quality Hub - Best practices and quality improvement resources
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Metadata } from "next"
import { Button } from "@/components/ui/Button/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { 
  Heart,
  Users,
  ClipboardCheck,
  BookOpen,
  Star,
  TrendingUp,
  Shield,
  FileCheck,
  Download
} from "lucide-react"

export const metadata: Metadata = {
  title: "Care Quality Hub | Write Care Notes",
  description: "Access best practices, quality improvement resources, and care standards for delivering outstanding person-centered care.",
  keywords: "care quality, person-centered care, quality improvement, care standards, best practices",
}

const qualityFrameworks = [
  {
    title: "Person-Centered Care Framework",
    description: "Comprehensive guide to implementing and maintaining person-centered care practices.",
    icon: Heart,
    href: "/resources/care-quality/person-centered-care"
  },
  {
    title: "Quality Assessment Tools",
    description: "Tools and checklists for evaluating care quality and identifying areas for improvement.",
    icon: ClipboardCheck,
    href: "/resources/care-quality/assessment-tools"
  },
  {
    title: "Staff Development Guide",
    description: "Resources for training staff in quality care delivery and continuous improvement.",
    icon: Users,
    href: "/resources/care-quality/staff-development"
  },
  {
    title: "Best Practice Library",
    description: "Collection of evidence-based practices and care delivery guidelines.",
    icon: BookOpen,
    href: "/resources/care-quality/best-practices"
  }
]

const improvementResources = [
  {
    title: "Quality Metrics Dashboard",
    description: "Key performance indicators for monitoring care quality",
    category: "Monitoring",
    icon: TrendingUp
  },
  {
    title: "Care Standards Manual",
    description: "Detailed standards for all aspects of care delivery",
    category: "Standards",
    icon: Shield
  },
  {
    title: "Audit Templates",
    description: "Ready-to-use templates for internal quality audits",
    category: "Compliance",
    icon: FileCheck
  }
]

const downloadableResources = [
  {
    title: "Care Quality Checklist",
    description: "Comprehensive checklist for daily care quality monitoring",
    format: "PDF",
    size: "156 KB"
  },
  {
    title: "Resident Feedback Forms",
    description: "Templates for gathering resident and family feedback",
    format: "DOCX",
    size: "238 KB"
  },
  {
    title: "Quality Improvement Plan",
    description: "Template for creating quality improvement action plans",
    format: "XLSX",
    size: "342 KB"
  }
]

export default function CareQualityPage() {
  return (
    <div className="bg-gradient-to-b from-blue-50/50 via-white to-blue-50/30 min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Care Quality Hub
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Access comprehensive resources and tools to enhance care quality and deliver outstanding person-centered care
          </p>
        </div>

        {/* Quality Rating */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Star className="h-4 w-4" />
            Trusted by Outstanding-rated care homes
          </div>
        </div>

        {/* Quality Frameworks Grid */}
        <div className="mx-auto mt-16 grid gap-8 sm:mt-20 lg:mx-0 lg:grid-cols-2">
          {qualityFrameworks.map((framework) => (
            <Card key={framework.title} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-50 p-3">
                  <framework.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {framework.title}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {framework.description}
                  </p>
                  <Button variant="link" asChild className="mt-4 p-0">
                    <Link href={framework.href}>Access resources →</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Improvement Resources */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Quality Improvement Resources
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Tools and resources to support continuous quality improvement
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {improvementResources.map((resource) => (
              <Card key={resource.title} className="p-6">
                <div className="rounded-lg bg-blue-50 p-3 w-fit">
                  <resource.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-4">
                  <span className="text-sm font-medium text-blue-600">
                    {resource.category}
                  </span>
                  <h3 className="mt-2 font-semibold text-gray-900">
                    {resource.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {resource.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Downloadable Resources */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Downloadable Resources
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Ready-to-use templates and forms for quality management
          </p>
          
          <div className="mt-8 space-y-4">
            {downloadableResources.map((resource) => (
              <Card key={resource.title} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Download className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {resource.format} • {resource.size}
                    </span>
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
        <div className="mt-20 rounded-2xl bg-blue-600 px-8 py-12 text-center sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Ready to improve your care quality?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Book a consultation with our care quality specialists to discuss how we can help improve your care home's quality ratings
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/demo">Book Consultation</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-white hover:bg-blue-500" asChild>
              <Link href="/resources/care-quality/consultation">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 
