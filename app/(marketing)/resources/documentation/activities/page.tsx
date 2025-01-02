/**
 * WriteCareNotes.com
 * @fileoverview Activities Documentation - Activity planning and engagement resources
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
  Calendar,
  Users,
  Clock,
  Music2,
  Palette,
  Brain,
  Heart,
  Sparkles,
  Star
} from "lucide-react"

export const metadata: Metadata = {
  title: "Activities Documentation | Write Care Notes",
  description: "Access activity planning templates, engagement resources, and guidance for meaningful resident activities.",
  keywords: "care home activities, activity planning, resident engagement, social activities, therapeutic activities",
}

const activityTemplates = [
  {
    title: "Activity Plan Template",
    description: "Weekly and monthly activity planning framework",
    format: "DOCX",
    size: "285 KB",
    category: "Planning",
    lastUpdated: "March 2024"
  },
  {
    title: "Activity Assessment Form",
    description: "Resident interests and capabilities assessment",
    format: "DOCX",
    size: "245 KB",
    category: "Assessment",
    lastUpdated: "March 2024"
  },
  {
    title: "Group Activities Guide",
    description: "Structured group activity templates",
    format: "PDF",
    size: "425 KB",
    category: "Group",
    lastUpdated: "March 2024"
  },
  {
    title: "Engagement Record",
    description: "Activity participation and outcomes tracking",
    format: "XLSX",
    size: "298 KB",
    category: "Monitoring",
    lastUpdated: "March 2024"
  }
]

const activityTools = [
  {
    title: "Creative Arts",
    description: "Art and craft activity resources",
    icon: Palette,
    category: "Creative"
  },
  {
    title: "Music & Movement",
    description: "Music therapy and exercise guides",
    icon: Music2,
    category: "Physical"
  },
  {
    title: "Cognitive Games",
    description: "Memory and thinking activities",
    icon: Brain,
    category: "Cognitive"
  },
  {
    title: "Social Events",
    description: "Community engagement ideas",
    icon: Users,
    category: "Social"
  }
]

const planningGuides = [
  {
    title: "Activity Planning",
    description: "Guide to creating balanced activity programs",
    icon: Calendar,
    href: "/resources/documentation/activities/planning"
  },
  {
    title: "Person-Centered Activities",
    description: "Tailoring activities to individual needs",
    icon: Heart,
    href: "/resources/documentation/activities/person-centered"
  },
  {
    title: "Therapeutic Benefits",
    description: "Understanding activity outcomes",
    icon: Star,
    href: "/resources/documentation/activities/benefits"
  }
]

export default function ActivitiesPage() {
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
            Activities & Engagement
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Essential resources for planning and delivering meaningful activities
          </p>
        </div>

        {/* Update Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            Updated with latest engagement best practices
          </div>
        </div>

        {/* Activity Templates */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Activity Templates
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Professional templates for activity planning and assessment
          </p>
          
          <div className="mt-8 space-y-4">
            {activityTemplates.map((template) => (
              <Card key={template.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {template.title}
                        </h3>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                      <p className="mt-1 text-gray-600">
                        {template.description}
                      </p>
                      <div className="mt-2 text-sm text-gray-500">
                        Last updated: {template.lastUpdated}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {template.format} • {template.size}
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

        {/* Activity Tools */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Activity Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Resources for different types of activities
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {activityTools.map((tool) => (
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
                    Access resources →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Planning Guides */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Planning Guides
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Best practice guidance for activity planning
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {planningGuides.map((guide) => (
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
            Need help with activity planning?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Our activity specialists can help create engaging programs for your residents
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/demo">Book Consultation</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-white hover:bg-blue-500" asChild>
              <Link href="/resources/documentation/activities/consultation">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 